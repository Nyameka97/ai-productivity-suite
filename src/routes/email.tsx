import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ToolWorkspace } from "@/components/ai/ToolWorkspace";

export const Route = createFileRoute("/email")({
  head: () => ({ meta: [{ title: "Smart Email Generator — Workplace AI" }] }),
  component: () => (
    <AppShell>
      <ToolWorkspace
        title="Smart Email Generator"
        description="Draft polished, on-tone emails in seconds."
        icon={<Mail className="h-5 w-5" />}
        tool="email"
        fields={[
          { id: "recipient", label: "Recipient & context", placeholder: "e.g. My manager, about delaying the Q3 roadmap review", required: true, rows: 2 },
          { id: "intent", label: "What you want to say", placeholder: "Key points, decisions, asks…", required: true, rows: 5 },
          { id: "tone", label: "Tone (optional)", placeholder: "Professional, friendly, concise, apologetic…", rows: 1 },
        ]}
        buildPrompt={(v) =>
          `Write an email.\n\nRecipient/context: ${v.recipient}\n\nKey points to convey:\n${v.intent}\n\nDesired tone: ${v.tone || "professional and concise"}`
        }
        outputLabel="Email Draft"
      />
    </AppShell>
  ),
});
