import { NextRequest, NextResponse } from "next/server";
import { askGemini } from "@/lib/geminiService";
import { processAiMessage, type AiSurveyState } from "@/lib/aiChatEngine";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      message,
      history = [],
      survey,
      userName,
      userPosition,
      apiKey: clientApiKey,
    } = body;

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Missing message parameter" }, { status: 400 });
    }

    const headerApiKey = req.headers.get("x-gemini-key");
    const apiKey = clientApiKey || headerApiKey || process.env.GEMINI_API_KEY;

    // If an API key is available, use Gemini Generative AI
    if (apiKey) {
      try {
        const geminiRes = await askGemini({
          apiKey,
          userMessage: message,
          history,
          survey,
          userName,
          userLocation: userPosition,
        });

        return NextResponse.json({
          success: true,
          isGemini: true,
          model: geminiRes.modelUsed,
          text: geminiRes.text,
          options: geminiRes.options,
          itinerary: geminiRes.itinerary,
          updatedSurvey: geminiRes.updatedSurvey,
        });
      } catch (geminiError: any) {
        console.warn("Gemini execution failed, falling back to local engine:", geminiError?.message);
        
        // Graceful fallback to rule-based engine
        const fallbackRes = processAiMessage(message, survey || {
          destinationText: "",
          anchorPlaceId: "",
          selectedPlaceIds: [],
        }, userName);

        return NextResponse.json({
          success: true,
          isGemini: false,
          isFallback: true,
          fallbackReason: geminiError?.message || "Gemini API failed",
          text: fallbackRes.text,
          options: fallbackRes.options,
          itinerary: fallbackRes.itinerary,
          updatedSurvey: fallbackRes.updatedSurvey,
        });
      }
    }

    // No API key provided: Run local offline rule-based engine
    const localRes = processAiMessage(message, survey || {
      destinationText: "",
      anchorPlaceId: "",
      selectedPlaceIds: [],
    }, userName);

    return NextResponse.json({
      success: true,
      isGemini: false,
      isOfflineEngine: true,
      text: localRes.text,
      options: localRes.options,
      itinerary: localRes.itinerary,
      updatedSurvey: localRes.updatedSurvey,
    });
  } catch (err: any) {
    console.error("API /api/chat error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  const hasEnvKey = Boolean(process.env.GEMINI_API_KEY);
  const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

  return NextResponse.json({
    status: "ok",
    hasEnvKey,
    model,
    provider: "Google Gemini",
  });
}
