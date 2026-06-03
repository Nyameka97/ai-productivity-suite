import { useState, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles, Copy, Check, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { runAI } from "@/lib/ai.functions";
import { toast } from "sonner";

type Field = {
  id: string;
  label: string;
  placeholder?: string;
  rows?: number;
  required?: boolean;
};

type Props = {
  title: string;
  description: string;
  icon: ReactNode;
  tool: "email" | "summary" | "planner" | "research";
  fields: Field[];
  buildPrompt: (values: Record<string, string>) => string;
  outputLabel?: string;
};

export function ToolWorkspace({
  title,
  description,
  icon,
  tool,
  fields,
  buildPrompt,
  outputLabel = "AI Output",
}: Props) {
  const callAI = useServerFn(runAI);
  const [values, setValues] = useState<Record<string, string>>({});
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    for (const f of fields) {
      if (f.required && !values[f.id]?.trim()) {
        toast.error(`Please fill in: ${f.label}`);
        return;
      }
    }
    setLoading(true);
    try {
      const result = await callAI({
        data: {
          tool,
          messages: [{ role: "user", content: buildPrompt(values) }],
        },
      });
      if (result.ok) {
        setOutput(result.content);
      } else {
        toast.error(result.error);
      }
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-8 md:py-10">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-sm">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inputs</CardTitle>
            <CardDescription>Fill in the details. We'll structure the prompt for you.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((f) => (
              <div key={f.id} className="space-y-1.5">
                <label className="text-sm font-medium" htmlFor={f.id}>
                  {f.label}
                  {f.required && <span className="ml-0.5 text-destructive">*</span>}
                </label>
                <Textarea
                  id={f.id}
                  placeholder={f.placeholder}
                  rows={f.rows ?? 3}
                  value={values[f.id] ?? ""}
                  onChange={(e) => setValues((v) => ({ ...v, [f.id]: e.target.value }))}
                  className="resize-y"
                />
              </div>
            ))}
            <Button onClick={handleGenerate} disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Generate
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div>
              <CardTitle className="text-base">{outputLabel}</CardTitle>
              <CardDescription>Editable — refine to your voice before sending.</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={copy} disabled={!output}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            <Textarea
              value={output}
              onChange={(e) => setOutput(e.target.value)}
              placeholder="Your AI-generated output will appear here…"
              rows={18}
              className="resize-y font-mono text-sm leading-relaxed"
            />
            <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>
                Responsible AI notice: outputs are AI-generated and may contain errors or
                inaccuracies. Always review and edit before sharing.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
