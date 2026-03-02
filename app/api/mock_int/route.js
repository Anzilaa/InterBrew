import { NextResponse } from "next/server";
import { Groq } from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req) {
  try {
    const { message, history = [], system } = await req.json();

    // Construct the conversation payload. Allow a `system` override from the client
    const systemMessage = system
      ? { role: "system", content: system }
      : { role: "system", content: "You are a strict technical interviewer. Keep responses under 2 sentences. Ask one technical question at a time and wait for an answer." };

    const messages = [systemMessage, ...history, { role: "user", content: message }];

    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      // Use the OpenAI-compatible OSS model; allow override with GROQ_MODEL env var
      model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
      temperature: 1,
      max_completion_tokens: 8192,
      top_p: 1,
      stream: false,
    });

    // groq-sdk returns choices similar to other chat APIs
    const aiResponse = chatCompletion.choices?.[0]?.message?.content || "Could you repeat that?";

    return NextResponse.json({ reply: aiResponse });
  } catch (error) {
    console.error("Groq API Error:", error);
    return NextResponse.json({ error: "Failed to fetch response" }, { status: 500 });
  }
}