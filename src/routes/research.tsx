import { createFileRoute } from "@tanstack/react-router";
import { Search } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ToolWorkspace } from "@/components/ai/ToolWorkspace";

export const Route = createFileRoute("/research")({
  head: () => ({ meta: [{ title: "AI Research Assistant — Workplace AI" }] }),
  component: () => (
    <AppShell>
      <ToolWorkspace
        title="AI Research Assistant"
        description="Get a structured briefing on any topic or question."
        icon={<Search className="h-5 w-5" />}
        tool="research"
        fields={[
          { id: "topic", label: "Topic or question", placeholder: "e.g. Compare common pricing models for B2B SaaS onboarding tools", required: true, rows: 3 },
          { id: "audience", label: "Audience / purpose (optional)", placeholder: "Who is this for? What decision are you making?", rows: 2 },
        ]}
        buildPrompt={(v) =>
          `Topic: ${v.topic}\n\nAudience / purpose: ${v.audience || "General workplace use"}`
        }
        outputLabel="Briefing"
      />
    </AppShell>
  ),
});
