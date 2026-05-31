import { NextRequest, NextResponse } from "next/server";

const AI_SYSTEM = `أنت نظام ذكاء اصطناعي متخصص في تشخيص أعطال السيارات. أرجع JSON فقط بدون أي نص إضافي أو markdown:
{"fault":"اسم العطل","severity":"low|medium|high|critical","confidence":85,"location":"موقع العطل","description":"وصف العطل","recommendation":"الإجراء المقترح","estimatedCost":"نطاق التكلفة بالريال","urgency":"مستوى الاستعجال"}`;

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "message required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        system: AI_SYSTEM,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }

    const data = await response.json();
    const text = data.content
      ?.filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("") || "{}";

    const result = JSON.parse(text.replace(/```json|```/g, "").trim());
    return NextResponse.json(result);

  } catch (err) {
    console.error("Analyze error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
