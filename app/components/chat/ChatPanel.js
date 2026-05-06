"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useShell } from "@/lib/ShellContext";
import { useFilters } from "@/lib/FiltersContext";
import ChatMessage from "./ChatMessage";
import { X, Send, Sparkles, RotateCcw } from "lucide-react";

const SUGGESTED = [
  "Why did my TACOS spike recently?",
  "Which campaigns are burning budget?",
  "Summarize my account performance this month",
  "What products should I restock soonest?",
  "Compare this week vs last week",
];

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initial;
    } catch {
      return initial;
    }
  });

  const set = (v) => {
    setValue(v);
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {
      /* ignore */
    }
  };

  return [value, set];
}

export default function ChatPanel() {
  const { chatOpen, setChatOpen, chatPrefill, setChatPrefill } = useShell();
  const { companyId, dateTimePeriod } = useFilters();
  const pathname = usePathname();
  const [messages, setMessages] = useLocalStorage("atlas_chat_history", []);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Consume chatPrefill whenever it is set
  useEffect(() => {
    if (chatPrefill) {
      setInput(chatPrefill);
      setChatPrefill("");
      inputRef.current?.focus();
    }
  }, [chatPrefill, setChatPrefill]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (chatOpen) inputRef.current?.focus();
  }, [chatOpen]);

  async function send(text) {
    const userMsg = text.trim();
    if (!userMsg || streaming) return;
    setInput("");

    const next = [...messages, { role: "user", content: userMsg }];
    setMessages(next);
    setStreaming(true);

    const aiPlaceholder = { role: "assistant", content: "" };
    setMessages([...next, aiPlaceholder]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          context: {
            companyId,
            page: pathname,
            dateStart: dateTimePeriod?.startDate?.toISOString?.() ?? null,
            dateEnd: dateTimePeriod?.endDate?.toISOString?.() ?? null,
          },
          history: next.slice(-6),
        }),
      });

      if (!res.ok) throw new Error("API error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") break;
            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta?.content ?? "";
              accumulated += delta;
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: "assistant", content: accumulated };
                return updated;
              });
            } catch {
              /* skip malformed chunk */
            }
          }
        }
      }
    } catch (err) {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  };

  if (!chatOpen) return null;

  return (
    <>
      {/* Backdrop (mobile) */}
      <div
        className="tw:fixed tw:inset-0 tw:z-40 tw:bg-black/40 xl:tw:hidden"
        onClick={() => setChatOpen(false)}
      />

      {/* Panel */}
      <div className="tw:fixed tw:right-0 tw:top-0 tw:h-full tw:z-50 tw:flex tw:flex-col tw:bg-zinc-950 tw:border-l tw:border-white/[0.07] tw:shadow-2xl tw:w-full xl:tw:w-[480px] tw:transition-all tw:duration-300">
        {/* Header */}
        <div className="tw:flex tw:items-center tw:gap-3 tw:h-14 tw:px-4 tw:border-b tw:border-white/[0.07] tw:shrink-0">
          <div className="tw:w-7 tw:h-7 tw:rounded-full tw:bg-gradient-to-br tw:from-cyan-500 tw:to-violet-600 tw:flex tw:items-center tw:justify-center tw:shrink-0">
            <Sparkles size={13} className="tw:text-white" />
          </div>
          <div>
            <p className="tw:text-sm tw:font-semibold tw:text-white">Atlas AI Assistant</p>
            <p className="tw:text-xs tw:text-zinc-500">Ask about your account</p>
          </div>
          <div className="tw:ml-auto tw:flex tw:items-center tw:gap-1">
            {messages.length > 0 && (
              <button
                onClick={() => setMessages([])}
                className="tw:p-2 tw:rounded-lg tw:text-zinc-600 hover:tw:text-zinc-300 hover:tw:bg-white/5 tw:transition-colors"
                title="Clear chat"
              >
                <RotateCcw size={14} />
              </button>
            )}
            <button
              onClick={() => setChatOpen(false)}
              className="tw:p-2 tw:rounded-lg tw:text-zinc-600 hover:tw:text-white hover:tw:bg-white/5 tw:transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="tw:flex-1 tw:overflow-y-auto tw:px-4 tw:py-4">
          {messages.length === 0 ? (
            <div className="tw:flex tw:flex-col tw:items-center tw:justify-center tw:h-full tw:gap-6 tw:text-center tw:px-4">
              <div>
                <div className="tw:w-14 tw:h-14 tw:rounded-2xl tw:bg-gradient-to-br tw:from-cyan-500/20 tw:to-violet-600/20 tw:border tw:border-white/10 tw:flex tw:items-center tw:justify-center tw:mx-auto tw:mb-3">
                  <Sparkles size={22} className="tw:text-cyan-400" />
                </div>
                <p className="tw:text-white tw:font-semibold tw:mb-1">Your account assistant</p>
                <p className="tw:text-zinc-500 tw:text-sm">Ask anything about your Amazon performance, campaigns, inventory, or forecasts.</p>
              </div>
              <div className="tw:grid tw:grid-cols-1 tw:gap-2 tw:w-full">
                {SUGGESTED.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="tw:text-left tw:text-sm tw:text-zinc-400 hover:tw:text-white tw:bg-white/[0.03] hover:tw:bg-white/8 tw:border tw:border-white/[0.07] hover:tw:border-white/20 tw:rounded-xl tw:px-4 tw:py-3 tw:transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <ChatMessage
                  key={i}
                  role={msg.role}
                  content={msg.content}
                  isStreaming={streaming && i === messages.length - 1 && msg.role === "assistant"}
                />
              ))}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="tw:shrink-0 tw:px-4 tw:pb-4 tw:pt-2 tw:border-t tw:border-white/[0.07]">
          <div className="tw:flex tw:items-end tw:gap-2 tw:bg-white/[0.04] tw:border tw:border-white/10 tw:rounded-xl tw:px-4 tw:py-3 focus-within:tw:border-cyan-500/40">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Message Atlas AI…"
              rows={1}
              disabled={streaming}
              className="tw:flex-1 tw:bg-transparent tw:text-white tw:placeholder-zinc-600 tw:outline-none tw:resize-none tw:text-sm tw:leading-relaxed tw:max-h-32 tw:overflow-y-auto"
              style={{ fieldSizing: "content" }}
            />
            <button
              onClick={() => send(input)}
              disabled={!input.trim() || streaming}
              className="tw:p-1.5 tw:rounded-lg tw:bg-cyan-500 hover:tw:bg-cyan-400 tw:text-black tw:transition-colors disabled:tw:opacity-30 disabled:tw:cursor-not-allowed tw:shrink-0"
            >
              <Send size={14} />
            </button>
          </div>
          <p className="tw:text-[10px] tw:text-zinc-700 tw:text-center tw:mt-2">AI may make mistakes. Verify key decisions with your data.</p>
        </div>
      </div>
    </>
  );
}
