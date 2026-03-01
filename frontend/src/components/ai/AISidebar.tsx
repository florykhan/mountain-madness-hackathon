"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  PaperPlaneTilt,
  X,
  Sparkle,
  ArrowClockwise,
} from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

const SAMPLE_QUESTIONS = [
  { text: "Evaluate investment portfolio", glyph: "◌" },
  { text: "Show spending insights", glyph: "◍" },
  { text: "Find unusual patterns", glyph: "◐" },
];

const MOCK_RESPONSES: Record<string, string> = {
  default:
    "Based on your spending patterns, I can see a few opportunities to optimize. Your food spending is trending 12% higher than last month. Consider meal prepping on Sundays — users who do this save an average of $47/week.",
  spending:
    "This month you've spent $847 so far. Your predicted total is $1,142 which is 14% over your $1,000 budget. The biggest categories are Food ($312), Entertainment ($198), and Transport ($156).",
  save: "Here are 3 ways to save on food:\n\n1. **Skip eating out on weekdays** — saves ~$85/week\n2. **Use the grocery list feature** — reduces impulse purchases by 23%\n3. **Batch cook on weekends** — average savings of $47/week\n\nWant me to create a challenge around any of these?",
  challenge:
    "You're doing great on your Weekend Warrior challenge! You've spent $85 of your $274 target with 2 days left. You're currently ranked #2 — just $23 behind Jordan Lee. Skip the Jazz Concert on Friday and you'll likely take the #1 spot!",
  budget:
    "Based on your calendar events next week, I predict you'll spend approximately $274. Here's the breakdown:\n\n• **Food & Coffee**: $89\n• **Entertainment**: $95 (Jazz Concert)\n• **Transport**: $53\n• **Other**: $37\n\nI'd suggest a budget of $250 to save an extra $24.",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("spending") || lower.includes("month"))
    return MOCK_RESPONSES.spending;
  if (lower.includes("save") || lower.includes("food"))
    return MOCK_RESPONSES.save;
  if (lower.includes("challenge") || lower.includes("track"))
    return MOCK_RESPONSES.challenge;
  if (lower.includes("budget") || lower.includes("week"))
    return MOCK_RESPONSES.budget;
  return MOCK_RESPONSES.default;
}

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function AiAvatar() {
  return (
    <div
      className="h-8 w-8 shrink-0 antialiased"
      style={{ filter: "drop-shadow(0px 6px 8px rgba(244, 78, 247, 0.10))" }}
    >
      <div className="flex h-full w-full items-center justify-center rounded-lg border border-white/[0.1] bg-fuchsia-500/[0.12]">
        <Sparkle size={14} weight="fill" className="text-fuchsia-300" />
      </div>
    </div>
  );
}

export function AISidebar({ isOpen, onClose }: AISidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming, scrollToBottom]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isStreaming) return;

      const userMsg: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content: content.trim(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      if (inputRef.current) {
        inputRef.current.style.height = "auto";
      }
      setIsStreaming(true);

      // Try API first, fall back to mock
      let reply = "";
      try {
        if (process.env.NEXT_PUBLIC_API_URL) {
          const res = await api.coachChat(content.trim());
          reply = res.reply.content;
        } else {
          // Simulate network delay
          await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));
          reply = getResponse(content);
        }
      } catch {
        await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));
        reply = getResponse(content);
      }

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: reply,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsStreaming(false);
    },
    [isStreaming]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleAutoResize = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 80)}px`;
  };

  const resetChat = () => {
    setMessages([]);
    setInput("");
  };

  return (
    <div
      className={cn(
        "hidden h-full max-w-[400px] shrink-0 overflow-y-auto border-l border-white/[0.1] bg-[#0b0b0b] transition-all duration-300 lg:block",
        isOpen ? "w-full opacity-100" : "pointer-events-none w-0 opacity-0"
      )}
      style={{ fontFamily: "var(--font-sure-sans)" }}
    >
      <div className="relative h-full">
        <div className="flex h-full shrink-0 flex-col justify-between">
          <div className="border-b border-white/[0.1] px-4 py-4 md:p-4">
            <nav className="flex items-center justify-between">
              <div className="flex min-w-0 grow items-center gap-2">
                <button
                  type="button"
                  onClick={resetChat}
                  disabled={messages.length === 0}
                  className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-white/[0.12] bg-[#171717] text-white/85 transition-colors hover:bg-[#242424] disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Start new chat"
                >
                  <ArrowClockwise size={14} weight="bold" />
                </button>

                <div className="min-w-0">
                  <h2 className="truncate text-sm font-medium text-white">
                    AI Assistant
                  </h2>
                  <p className="truncate text-xs text-[#cfcfcf]">
                    Private finance context + web insights
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.12] bg-[#171717] text-white/85 transition-colors hover:bg-[#242424]"
                aria-label="Close AI sidebar"
              >
                <X size={14} weight="bold" />
              </button>
            </nav>
          </div>

          <div className="grow space-y-6 overflow-y-auto p-4 lg:pb-4">
            {messages.length === 0 && !isStreaming && (
              <div className="mt-auto">
                <div className="flex w-full items-start gap-3 p-2">
                  <AiAvatar />
                  <div className="max-w-[85%] space-y-4 text-sm text-white">
                    <p>
                      Hey there! I&apos;m an AI/large-language-model that can
                      help with your finances. I have access to your account
                      context.
                    </p>

                    <p>
                      You can use{" "}
                      <span
                        className="rounded border border-white/[0.15] bg-[#171717] px-1.5 py-0.5 text-xs"
                        style={{ fontFamily: "var(--font-sure-mono)" }}
                      >
                        /
                      </span>{" "}
                      to access commands
                    </p>

                    <div className="space-y-3">
                      <p>Here&apos;s a few questions you can ask:</p>
                      <div className="space-y-2.5">
                        {SAMPLE_QUESTIONS.map((question) => (
                          <button
                            key={question.text}
                            type="button"
                            onClick={() => sendMessage(question.text)}
                            className="flex w-fit items-center gap-2 rounded-full border border-white/[0.1] px-2.5 py-1.5 text-sm text-[#cfcfcf] transition-colors hover:bg-white/[0.08]"
                          >
                            <span className="text-[#9e9e9e]">
                              {question.glyph}
                            </span>
                            {question.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {messages.map((msg) =>
              msg.role === "assistant" ? (
                <div key={msg.id} className="mb-6 flex items-start gap-3">
                  <AiAvatar />
                  <div className="max-w-[85%] space-y-2 text-sm leading-relaxed text-white">
                    {msg.content.split("\n").map((line, i) => {
                      if (!line.trim()) return null;
                      const parts = line.split(/\*\*(.*?)\*\*/g);
                      return (
                        <p key={i}>
                          {parts.map((part, j) =>
                            j % 2 === 1 ? (
                              <strong key={j} className="font-semibold">
                                {part}
                              </strong>
                            ) : (
                              <span key={j}>{part}</span>
                            )
                          )}
                        </p>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div
                  key={msg.id}
                  className="mb-6 ml-auto w-fit max-w-[85%] rounded-lg border border-white/[0.08] bg-[#242424] px-3 py-2"
                >
                  <p className="whitespace-pre-wrap text-sm text-white">
                    {msg.content}
                  </p>
                </div>
              )
            )}

            {isStreaming && (
              <div className="flex items-start gap-3">
                <AiAvatar />
                <p className="animate-pulse text-sm text-[#cfcfcf]">
                  Thinking ...
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="sticky bottom-0 left-0 w-full border-t border-white/[0.1] bg-[#0b0b0b] px-4 pb-4 pt-3 lg:static lg:mt-auto lg:pt-0">
            <div id="chat-form" className="space-y-2">
              <div className="flex gap-2 rounded-full bg-[#171717] px-2 py-1.5 shadow-[0px_1px_2px_0px_rgba(255,255,255,0.08),0px_0px_0px_1px_rgba(255,255,255,0.05)] lg:flex-col lg:rounded-lg">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleAutoResize}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything ..."
                  rows={1}
                  className="w-full resize-none border-0 bg-transparent px-1 text-sm text-white placeholder:text-[#9e9e9e] focus:outline-none"
                  style={{ maxHeight: 80, overflow: "hidden" }}
                />

                <div className="flex items-center justify-between gap-1">
                  <div className="hidden items-center gap-1 lg:flex">
                    {["+", "/", "@", "#"].map((shortcut) => (
                      <button
                        key={shortcut}
                        type="button"
                        disabled
                        className="flex h-7 w-7 cursor-not-allowed items-center justify-center rounded-md border border-white/[0.1] bg-[#0b0b0b] text-xs font-medium text-[#9e9e9e]"
                        aria-label="Coming soon"
                      >
                        {shortcut}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isStreaming}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-35"
                    aria-label="Send message"
                  >
                    <PaperPlaneTilt size={13} weight="fill" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-[#cfcfcf]">
                AI responses are informational only and are not financial
                advice.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
