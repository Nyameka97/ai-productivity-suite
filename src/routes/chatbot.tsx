import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { MessageSquare, Send, Loader2, Sparkles, AlertTriangle, User, Trash2 } from "lucide-react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { runAI } from "@/lib/ai.functions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/chatbot")({
  head: () => ({ meta: [{ title: "AI Chatbot — Workplace AI" }] }),
  component: ChatPage,
});

type Msg = { role: "user" | "assistant"; content: string };

function ChatPage() {
  const callAI = useServerFn(runAI);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const result = await callAI({ data: { tool: "chat", messages: next } });
      if (result.ok) {
        setMessages((m) => [...m, { role: "assistant", content: result.content }]);
      } else {
        toast.error(result.error);
        setMessages(next);
      }
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <AppShell>
      <div className="mx-auto flex h-[calc(100vh-3.5rem)] w-full max-w-4xl flex-col px-4 py-6 md:px-8">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground shadow-sm">
              <MessageSquare className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">AI Chatbot</h1>
              <p className="text-sm text-muted-foreground">
                Your workplace assistant. Ask anything productivity-related.
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => setMessages([])}>
              <Trash2 className="mr-1.5 h-4 w-4" /> Clear
            </Button>
          )}
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto rounded-xl border border-border bg-card p-4"
        >
          {messages.length === 0 ? (
            <EmptyState onPick={(p) => setInput(p)} />
          ) : (
            <div className="space-y-4">
              {messages.map((m, i) => (
                <Bubble key={i} msg={m} />
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            placeholder="Ask anything… (Enter to send, Shift+Enter for new line)"
            rows={2}
            className="resize-none"
          />
          <Button onClick={send} disabled={loading || !input.trim()} size="lg">
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-2 flex items-start gap-1.5 text-[11px] text-muted-foreground">
          <AlertTriangle className="mt-0.5 h-3 w-3 text-primary" />
          Responses are AI-generated. Verify important information before acting on it.
        </div>
      </div>
    </AppShell>
  );
}

function Bubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          isUser ? "bg-secondary text-secondary-foreground" : "bg-gradient-brand text-primary-foreground",
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          "max-w-[80%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
          isUser
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground",
        )}
      >
        {msg.content}
      </div>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (s: string) => void }) {
  const suggestions = [
    "Help me prepare for a 1:1 with my manager tomorrow.",
    "Suggest 5 ways to run a more focused team standup.",
    "Draft a polite reminder to a vendor who missed a deadline.",
    "Explain OKRs to a new hire in 3 paragraphs.",
  ];
  return (
    <div className="flex h-full flex-col items-center justify-center text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-brand text-primary-foreground">
        <Sparkles className="h-5 w-5" />
      </div>
      <h3 className="font-display text-lg font-semibold">How can I help you today?</h3>
      <p className="mb-6 mt-1 text-sm text-muted-foreground">Try one of these to get started.</p>
      <div className="grid w-full max-w-xl gap-2 sm:grid-cols-2">
        {suggestions.map((s) => (
          <button
            key={s}
            onClick={() => onPick(s)}
            className="rounded-lg border border-border bg-background p-3 text-left text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
