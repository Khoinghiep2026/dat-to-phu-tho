import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { text, lang = "vi" } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Missing text" }, { status: 400 });
    }

    // Truncate if too long for a single speech request (Google Translate TTS limit is ~200 chars per chunk)
    // We handle chunking for smooth streaming
    const cleanText = text.replace(/[*#_~`]/g, " ").replace(/\s+/g, " ").trim();
    if (!cleanText) {
      return NextResponse.json({ error: "Empty text" }, { status: 400 });
    }

    // Language mapping for Google TTS
    const langMap: Record<string, string> = {
      vi: "vi",
      en: "en",
      zh: "zh-CN",
      ja: "ja",
      ko: "ko",
    };
    const targetLang = langMap[lang] || "vi";

    // Split text into chunks <= 180 chars at sentence or comma boundaries
    const chunks: string[] = [];
    const words = cleanText.split(" ");
    let currentChunk = "";

    for (const word of words) {
      if ((currentChunk + " " + word).trim().length <= 180) {
        currentChunk = (currentChunk + " " + word).trim();
      } else {
        if (currentChunk) chunks.push(currentChunk);
        currentChunk = word;
      }
    }
    if (currentChunk) chunks.push(currentChunk);

    // Fetch audio chunks in parallel (up to 5 chunks to keep latency minimal)
    const audioBuffers: ArrayBuffer[] = [];
    const chunksToFetch = chunks.slice(0, 8); // ~1400 chars, plenty for a spot narration

    for (const chunk of chunksToFetch) {
      const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${encodeURIComponent(
        targetLang
      )}&client=tw-ob&q=${encodeURIComponent(chunk)}`;

      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Referer: "https://translate.google.com/",
        },
      });

      if (res.ok) {
        const buf = await res.arrayBuffer();
        audioBuffers.push(buf);
      }
    }

    if (audioBuffers.length === 0) {
      return NextResponse.json({ error: "Could not generate speech audio" }, { status: 502 });
    }

    // Concatenate mp3 buffers
    const totalLength = audioBuffers.reduce((acc, b) => acc + b.byteLength, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const buf of audioBuffers) {
      combined.set(new Uint8Array(buf), offset);
      offset += buf.byteLength;
    }

    return new Response(combined, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    });
  } catch (err: any) {
    console.error("TTS API error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const text = searchParams.get("text");
  const lang = searchParams.get("lang") || "vi";

  if (!text) {
    return NextResponse.json({ error: "Missing text parameter" }, { status: 400 });
  }

  // Delegate to POST
  return POST(
    new NextRequest(req.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, lang }),
    })
  );
}
