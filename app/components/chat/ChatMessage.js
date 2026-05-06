"use client";

import { Copy, Check } from "lucide-react";
import { useState } from "react";

function formatMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`(.*?)`/g, '<code class="tw:bg-white/10 tw:px-1 tw:py-0.5 tw:rounded tw:text-cyan-300 tw:text-xs tw:font-mono">$1</code>')
    .replace(/\n/g, "<br/>");
}

export default function ChatMessage({ role, content, isStreaming }) {
  const [copied, setCopied] = useState(false);
  const isUser = role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  if (isUser) {
    return (
      <div className="tw:flex tw:justify-end tw:mb-4">
        <div className="tw:max-w-[85%] tw:bg-white/8 tw:border tw:border-white/10 tw:rounded-2xl tw:rounded-br-sm tw:px-4 tw:py-2.5">
          <p className="tw:text-sm tw:text-white tw:leading-relaxed tw:whitespace-pre-wrap">{content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tw:flex tw:gap-3 tw:mb-4 tw:group">
      <div className="tw:w-7 tw:h-7 tw:rounded-full tw:bg-gradient-to-br tw:from-cyan-500 tw:to-violet-600 tw:flex tw:items-center tw:justify-center tw:shrink-0 tw:mt-0.5">
        <span className="tw:text-white tw:text-[10px] tw:font-bold">AI</span>
      </div>
      <div className="tw:flex-1 tw:min-w-0">
        <div
          className="tw:text-sm tw:text-zinc-200 tw:leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formatMarkdown(content) }}
        />
        {isStreaming && (
          <span className="tw:inline-block tw:w-1.5 tw:h-4 tw:bg-cyan-400 tw:rounded-sm tw:animate-pulse tw:ml-0.5 tw:-mb-0.5" />
        )}
        {!isStreaming && content && (
          <button
            onClick={handleCopy}
            className="tw:mt-2 tw:flex tw:items-center tw:gap-1 tw:text-[11px] tw:text-zinc-600 hover:tw:text-zinc-300 tw:transition-colors tw:opacity-0 group-hover:tw:opacity-100"
          >
            {copied ? <Check size={11} /> : <Copy size={11} />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>
    </div>
  );
}
