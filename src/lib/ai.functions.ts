import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"]),
  content: z.string().min(1).max(20000),
});

const InputSchema = z.object({
  tool: z.enum(["email", "summary", "planner", "research", "chat"]),
  messages: z.array(MessageSchema).min(1).max(40),
});

const SYSTEM_PROMPTS: Record<string, string> = {
  email:
    "You are a professional email writing assistant. Given the user's intent, recipient, tone, and key points, write a clear, concise, well-structured email. Output only the email with a Subject line first, then a blank line, then the body. Keep it professional and ready to send.",
  summary:
    "You are a meeting notes summarizer. Given raw meeting notes or transcript, produce: 1) a 2-3 sentence Overview, 2) Key Decisions (bulleted), 3) Action Items (bulleted with owner if mentioned), 4) Open Questions. Use clear markdown headings.",
  planner:
    "You are an AI task planner. Break the user's goal into a prioritized, actionable plan. Output markdown with sections: Objective, Milestones, Today's Tasks (checkbox list), This Week (checkbox list), Risks & Dependencies. Be specific and realistic.",
  research:
    "You are an AI research assistant. Given a topic or question, produce a structured briefing: TL;DR (2-3 sentences), Key Points (bulleted), Considerations & Trade-offs, Suggested Next Steps. Cite reasoning, not fake URLs. If uncertain, say so.",
  chat:
    "You are a helpful, friendly AI workplace productivity assistant. Be concise, accurate, and practical. Use markdown when it improves clarity.",
};

export const runAI = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => InputSchema.parse(data))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { ok: false as const, error: "AI service is not configured." };
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPTS[data.tool] },
          ...data.messages,
        ],
      }),
    });

    if (!res.ok) {
      if (res.status === 429) {
        return { ok: false as const, error: "Rate limit reached. Please try again in a moment." };
      }
      if (res.status === 402) {
        return { ok: false as const, error: "AI credits exhausted. Please add credits to your workspace." };
      }
      const text = await res.text();
      console.error("AI gateway error:", res.status, text);
      return { ok: false as const, error: "AI request failed. Please try again." };
    }

    const json = await res.json();
    const content: string = json?.choices?.[0]?.message?.content ?? "";
    return { ok: true as const, content };
  });
