import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { ToolWorkspace } from "@/components/ai/ToolWorkspace";

export const Route = createFileRoute("/meetings")({
  head: () => ({ meta: [{ title: "Meeting Summarizer — Workplace AI" }] }),
  component: () => (
    <AppShell>
      <ToolWorkspace
        title="Meeting Notes Summarizer"
        description="Paste raw notes or a transcript — get a clean summary with decisions and action items."
        icon={<FileText className="h-5 w-5" />}
        tool="summary"
        fields={[
          { id: "title", label: "Meeting title (optional)", placeholder: "e.g. Weekly product sync", rows: 1 },
          { id: "notes", label: "Notes or transcript", placeholder: "Paste your raw meeting notes here…", required: true, rows: 10 },
        ]}
        buildPrompt={(v) =>
          `Meeting: ${v.title || "Untitled meeting"}\n\nRaw notes / transcript:\n${v.notes}`
        }
        outputLabel="Summary"
      />
    </AppShell>
  ),
});
