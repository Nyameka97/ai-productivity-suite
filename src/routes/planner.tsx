import { createFileRoute } from "@tanstack/react-router";
import { ListChecks } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ToolWorkspace } from "@/components/ai/ToolWorkspace";

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [{ title: "AI Task Planner — Workplace AI" }] }),
  component: () => (
    <AppShell>
      <ToolWorkspace
        title="AI Task Planner"
        description="Turn a goal into a prioritized plan with milestones and next steps."
        icon={<ListChecks className="h-5 w-5" />}
        tool="planner"
        fields={[
          { id: "goal", label: "Goal or objective", placeholder: "e.g. Launch v2 of the onboarding flow by end of quarter", required: true, rows: 3 },
          { id: "context", label: "Context & constraints (optional)", placeholder: "Team size, deadlines, dependencies…", rows: 4 },
        ]}
        buildPrompt={(v) =>
          `Goal: ${v.goal}\n\nContext / constraints: ${v.context || "None provided"}`
        }
        outputLabel="Action Plan"
      />
    </AppShell>
  ),
});
