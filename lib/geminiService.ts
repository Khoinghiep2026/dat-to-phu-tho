import { places } from "@/data/travel";
import { DISTRICT_DATABASE } from "@/data/districtDirectory";
import { culturalEvents } from "@/data/events";
import { buildItinerary, type GeneratedItinerary } from "./guidePlanner";
import { type AiSurveyState } from "./aiChatEngine";

export type GeminiChatMessage = {
  role: "user" | "model";
  parts: Array<{ text: string }>;
};

export type GeminiChatResponse = {
  text: string;
  options?: Array<{ label: string; value: string; icon?: string }>;
  itinerary?: GeneratedItinerary;
  updatedSurvey?: AiSurveyState;
  modelUsed: string;
};

// Build high-density grounded context for Phú Thọ, Vĩnh Phúc, and Hòa Bình
function buildTravelKnowledgeContext(): string {
  const placesSummary = places.map((p) => {
    const highlightsText = p.highlights?.join(", ") || "";
    const foodText = p.restaurants?.map((r) => r.name).join(", ") || "";
    return `- [${p.id}] ${p.name} (${p.category}, ${p.region}, ${p.district}): ${p.description.slice(0, 160)}... Giá vé: ${p.price || "Miễn phí"}. Thời điểm đẹp: ${p.bestTime || p.season || "Quanh năm"}. Điểm nhấn: ${highlightsText}. Quán ăn/đặc sản gợi ý: ${foodText}`;
  }).join("\n");

  const districtsSummary = Object.values(DISTRICT_DATABASE).slice(0, 15).map((d) => {
    const atts = d.attractions.slice(0, 3).map((a) => a.name).join(", ");
    const food = d.culinary.slice(0, 3).map((c) => c.dish).join(", ");
    return `- ${d.name} (${d.province}): Điểm đến: ${atts}. Ẩm thực: ${food}`;
  }).join("\n");

  const eventsSummary = culturalEvents.slice(0, 6).map((e) => {
    return `- ${e.name} (${e.schedule}, ${e.location}): ${e.description.slice(0, 120)}`;
  }).join("\n");

  return `
=== CƠ SỞ DỮ LIỆU ĐẤT TỔ (PHÚ THỌ, VĨNH PHÚC, HÒA BÌNH) ===
[DANH LAM THẮNG CẢNH TIÊU BIỂU]:
${placesSummary}

[CÁC HUYỆN & VÙNG ĐẶC SẮC]:
${districtsSummary}

[LỄ HỘI VĂN HÓA TRUYỀN THỐNG]:
${eventsSummary}
============================================================
`;
}

const SYSTEM_INSTRUCTION = `
Bạn là "Trợ lý Du lịch Đất Tổ" — chuyên gia tư vấn du lịch và cội nguồn văn hóa thông minh của tỉnh Phú Thọ cùng 2 tuyến liên kết (Tam Đảo - Vĩnh Phúc & Mai Châu, Kim Bôi - Hòa Bình).

PHONG CÁCH & VĂN PHONG:
- Nhiệt tình, ấm áp, đậm bản sắc hiếu khách Đất Tổ.
- Xưng "em", gọi người dùng là "bạn" (hoặc tên người dùng nếu có).
- Trình bày mạch lạc, sử dụng các biểu tượng emoji sinh động, định dạng Markdown rõ ràng (in đậm, danh sách gạch đầu dòng).
- Đưa ra lời khuyên thiết thực (giờ đi, trang phục khi vào đền chùa, món ăn đặc sản đúng quán, lưu ý đường đèo/săn mây).

GIỚI HẠN PHẠM VI (GUARDRAILS) & CỬA NGÕ HÀ NỘI:
- Bạn CHUYÊN SÂU về tỉnh Phú Thọ cùng 2 tuyến liên kết (Tam Đảo - Vĩnh Phúc & Mai Châu, Kim Bôi - Hòa Bình).
- Với HÀ NỘI (cửa ngõ kết nối và nơi xuất phát chính của du khách về Đất Tổ, cách ~60-80km): Khi người dùng hỏi về các khu du lịch, điểm vui chơi hay ẩm thực tại Hà Nội, hãy giải đáp đầy đủ và chính xác các điểm tham quan văn hóa & sinh thái tiêu biểu của Thủ đô (Quần thể Hồ Gươm, Lăng Bác, Văn Miếu, Hoàng Thành, Ba Vì, Làng cổ Đường Lâm, Bát Tràng...). Đồng thời, khéo léo gợi ý kết nối tour du lịch cuối tuần tuyệt vời từ Hà Nội về Đền Hùng, Thanh Thủy hay Tam Đảo (chỉ 1 giờ chạy xe cao tốc).
- Nếu người dùng hỏi du lịch ở các tỉnh thành xa (Đà Nẵng, Phú Quốc, Sapa, Nha Trang...), hãy lịch sự giải thích bạn là Trợ lý chuyên trách miền Đất Tổ và khéo léo gợi ý điểm đến tương đồng (ví dụ: muốn tắm biển -> gợi ý tắm khoáng Thanh Thủy hoặc chèo kayak Thung Nai; muốn săn mây sapa -> gợi ý Đồi chè Long Cốc hoặc Tam Đảo).
- Nếu người dùng hỏi chủ đề phi du lịch (viết code, giải toán, chính trị...), hãy từ chối khéo léo và hướng về các danh lam thắng cảnh Phú Thọ.

QUY TẮC XUẤT DỮ LIỆU CẤU TRÚC:
1. Khi người dùng hỏi và muốn LÊN LỊCH TRÌNH (hoặc câu hỏi có Điểm đến + Thời gian):
Hãy tư vấn lịch trình chi tiết theo buổi (Sáng, Trưa, Chiều, Tối). Đồng thời, ở CUỐI câu trả lời, hãy đính kèm một khối mã JSON chính xác như sau:
\`\`\`itinerary_json
{
  "isItinerary": true,
  "anchorPlaceId": "<mã_place_id_phù_hợp_như: den-hung, long-coc, xuan-son, thanh-thuy, tam-dao, ban-lac-mai-chau, den-mau-au-co>",
  "durationDays": 2,
  "durationNights": 1,
  "travelers": 2,
  "transport": "Ô tô riêng",
  "budget": "Tiêu chuẩn",
  "style": "Văn hóa & cội nguồn",
  "options": [
    {"label": "✨ Áp dụng vào bản đồ trực quan", "value": "apply_itinerary", "icon": "🗺️"},
    {"label": "🍲 Món ngon đặc sản", "value": "ask_foods", "icon": "🥢"}
  ]
}
\`\`\`

2. Khi chỉ là câu hỏi tư vấn thông thường (không phải tạo lịch trình), hãy đính kèm khối gợi ý ở CUỐI:
\`\`\`options_json
[
  {"label": "🏛️ Lên tour Đền Hùng", "value": "plan_den_hung", "icon": "🏛️"},
  {"label": "🍃 Săn mây Long Cốc", "value": "plan_long_coc", "icon": "📸"},
  {"label": "♨️ Khoáng nóng Thanh Thủy", "value": "plan_thanh_thuy", "icon": "💆"},
  {"label": "🍲 Đặc sản Phú Thọ", "value": "ask_foods", "icon": "🥢"}
]
\`\`\`
`.trim();

export async function askGemini(params: {
  apiKey: string;
  model?: string;
  userMessage: string;
  history?: Array<{ sender: "ai" | "user"; text: string }>;
  survey?: AiSurveyState;
  userName?: string;
  userLocation?: { lat: number; lng: number };
}): Promise<GeminiChatResponse> {
  const {
    apiKey,
    model = process.env.GEMINI_MODEL || "gemini-3.8-flash",
    userMessage,
    history = [],
    survey,
    userName,
    userLocation,
  } = params;

  if (!apiKey) {
    throw new Error("Missing Gemini API Key");
  }

  const knowledgeContext = buildTravelKnowledgeContext();
  const contextNote = `
Thông tin người dùng hiện tại:
- Tên người dùng: ${userName || "Bạn đọc"}
- Vị trí GPS hiện tại: ${userLocation ? `${userLocation.lat}, ${userLocation.lng}` : "Chưa xác định"}
- Trạng thái chuyến đi đang khảo sát: ${JSON.stringify(survey || {})}
`;

  // Format history for Gemini contents
  const contents: GeminiChatMessage[] = [];

  // Add recent history (up to last 6 turns)
  const recentHistory = history.slice(-6);
  for (const h of recentHistory) {
    contents.push({
      role: h.sender === "user" ? "user" : "model",
      parts: [{ text: h.text }],
    });
  }

  // Add the current user prompt
  contents.push({
    role: "user",
    parts: [{ text: userMessage }],
  });

  const payload = {
    system_instruction: {
      parts: [
        { text: SYSTEM_INSTRUCTION },
        { text: knowledgeContext },
        { text: contextNote },
      ],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  // Try the prioritized models (Google GenAI 2026 active versions)
  const preferredModel = (model && model !== "gemini-2.0-flash" && model !== "gemini-1.5-flash")
    ? model
    : "gemini-3.8-flash";

  const modelsToTry = [
    preferredModel,
    "gemini-3.8-flash",
    "gemini-2.5-flash",
    "gemini-2.5-pro",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro-latest",
  ];
  const uniqueModels = Array.from(new Set(modelsToTry));

  let lastError: any = null;

  for (const targetModel of uniqueModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorBody}`);
      }

      const data = await response.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!rawText) {
        throw new Error("Empty response from Gemini API");
      }

      // Parse structured JSON blocks if present
      let cleanText = rawText;
      let options: Array<{ label: string; value: string; icon?: string }> | undefined = undefined;
      let itinerary: GeneratedItinerary | undefined = undefined;
      let updatedSurvey: AiSurveyState | undefined = survey ? { ...survey } : undefined;

      // Extract ```itinerary_json ... ```
      const itineraryMatch = cleanText.match(/```itinerary_json\s*([\s\S]*?)\s*```/);
      if (itineraryMatch) {
        try {
          const parsed = JSON.parse(itineraryMatch[1]);
          cleanText = cleanText.replace(/```itinerary_json[\s\S]*?```/, "").trim();

          if (parsed.options) {
            options = parsed.options;
          }

          // Build actual rich itinerary
          const anchorId = parsed.anchorPlaceId || survey?.anchorPlaceId || "den-hung";
          const days = Number(parsed.durationDays) || survey?.durationDays || 2;
          const nights = parsed.durationNights !== undefined ? Number(parsed.durationNights) : (days > 1 ? days - 1 : 0);
          const travelers = Number(parsed.travelers) || survey?.travelers || 2;
          const transport = parsed.transport || survey?.transport || "Ô tô riêng";
          const budget = parsed.budget || survey?.budget || "Tiêu chuẩn";
          const style = parsed.style || survey?.style || "Văn hóa & cội nguồn";

          itinerary = buildItinerary({
            anchorPlaceId: anchorId,
            selectedPlaceIds: [anchorId],
            durationDays: days,
            durationNights: nights,
            transport,
            budget,
            style,
            travelers,
          });

          if (updatedSurvey) {
            updatedSurvey.anchorPlaceId = anchorId;
            updatedSurvey.durationDays = days;
            updatedSurvey.durationNights = nights;
            updatedSurvey.travelers = travelers;
            updatedSurvey.transport = transport;
            updatedSurvey.budget = budget;
            updatedSurvey.style = style;
          }
        } catch (e) {
          console.warn("Failed to parse itinerary_json from Gemini:", e);
        }
      }

      // Extract ```options_json ... ```
      const optionsMatch = cleanText.match(/```options_json\s*([\s\S]*?)\s*```/);
      if (optionsMatch) {
        try {
          options = JSON.parse(optionsMatch[1]);
          cleanText = cleanText.replace(/```options_json[\s\S]*?```/, "").trim();
        } catch (e) {
          console.warn("Failed to parse options_json from Gemini:", e);
        }
      }

      // Default options if none parsed
      if (!options || options.length === 0) {
        options = [
          { label: "🏛️ Tour Đền Hùng", value: "plan_den_hung", icon: "🏛️" },
          { label: "🍃 Đồi chè Long Cốc", value: "plan_long_coc", icon: "📸" },
          { label: "♨️ Khoáng nóng Thanh Thủy", value: "plan_thanh_thuy", icon: "💆" },
          { label: "🍲 Gợi ý đặc sản", value: "ask_foods", icon: "🥢" },
        ];
      }

      return {
        text: cleanText,
        options,
        itinerary,
        updatedSurvey,
        modelUsed: targetModel,
      };
    } catch (err) {
      lastError = err;
      console.warn(`Model ${targetModel} failed, trying fallback...`, err);
    }
  }

  // Final fallback: dynamically discover available models from API
  try {
    const listRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (listRes.ok) {
      const listData = await listRes.json();
      const availableModels = (listData?.models || [])
        .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
        .map((m: any) => m.name.replace(/^models\//, ""));

      // Try the first available model that isn't already tried
      const untried = availableModels.find((m: string) => !uniqueModels.includes(m));
      if (untried) {
        console.log(`Discovered active model from API: ${untried}, attempting call...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${untried}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            return {
              text: rawText,
              options: [
                { label: "🏛️ Tour Đền Hùng", value: "plan_den_hung", icon: "🏛️" },
                { label: "🍃 Đồi chè Long Cốc", value: "plan_long_coc", icon: "📸" },
                { label: "♨️ Khoáng nóng Thanh Thủy", value: "plan_thanh_thuy", icon: "💆" },
                { label: "🍲 Gợi ý đặc sản", value: "ask_foods", icon: "🥢" },
              ],
              modelUsed: untried,
            };
          }
        }
      }
    }
  } catch (discoveryErr) {
    console.warn("Model discovery failed:", discoveryErr);
  }

  throw lastError || new Error("All Gemini models failed");
}
