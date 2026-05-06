"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import {
  Plug2,
  Copy,
  Check,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  Zap,
  Info,
  ExternalLink,
} from "lucide-react";

// ─── Tool definitions (mirrored from the API route) ────────────────────────
const TOOLS = [
  {
    name: "get_performance_metrics",
    description: "Get ROAS, ACOS, TACOS, ad spend, ad sales, and total revenue for a date range.",
    params: [
      { name: "companyId", type: "string", required: true,  desc: "Company / account ID." },
      { name: "startDate",  type: "string", required: false, desc: "YYYY-MM-DD (default: 7 days ago)." },
      { name: "endDate",    type: "string", required: false, desc: "YYYY-MM-DD (default: today)." },
    ],
  },
  {
    name: "get_alerts",
    description: "Detect anomalies: TACOS spikes, revenue drops, spend changes, CTR drops — last 7 days vs prior 7-day baseline.",
    params: [
      { name: "companyId", type: "string", required: true, desc: "Company / account ID." },
    ],
  },
  {
    name: "get_top_campaigns",
    description: "Top campaigns by spend with ROAS, ACOS, sales, impressions, and clicks.",
    params: [
      { name: "companyId", type: "string", required: true,  desc: "Company / account ID." },
      { name: "startDate",  type: "string", required: false, desc: "YYYY-MM-DD (default: 30 days ago)." },
      { name: "endDate",    type: "string", required: false, desc: "YYYY-MM-DD (default: today)." },
      { name: "limit",      type: "number", required: false, desc: "Max results (default: 10)." },
    ],
  },
  {
    name: "get_top_keywords",
    description: "Top keywords by spend with ROAS, ACOS, impressions, clicks, and match type.",
    params: [
      { name: "companyId", type: "string", required: true,  desc: "Company / account ID." },
      { name: "startDate",  type: "string", required: false, desc: "YYYY-MM-DD (default: 30 days ago)." },
      { name: "endDate",    type: "string", required: false, desc: "YYYY-MM-DD (default: today)." },
      { name: "limit",      type: "number", required: false, desc: "Max results (default: 20)." },
    ],
  },
  {
    name: "get_pnl_summary",
    description: "P&L summary: total sales, ad cost, ad sales, organic sales, profit, and units.",
    params: [
      { name: "companyId", type: "string", required: true,  desc: "Company / account ID." },
      { name: "startDate",  type: "string", required: false, desc: "YYYY-MM-DD (default: 30 days ago)." },
      { name: "endDate",    type: "string", required: false, desc: "YYYY-MM-DD (default: today)." },
    ],
  },
];

// ─── Config template generators ───────────────────────────────────────────
function claudeDesktopConfig(endpoint, token) {
  return JSON.stringify(
    {
      mcpServers: {
        atlas: {
          command: "npx",
          args: ["-y", "@modelcontextprotocol/server-fetch"],
          env: {
            MCP_SERVER_URL: endpoint,
            MCP_AUTH_HEADER: `Bearer ${token}`,
          },
        },
      },
    },
    null,
    2
  );
}

function cursorConfig(endpoint, token) {
  return JSON.stringify(
    {
      mcpServers: {
        atlas: {
          url: endpoint,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      },
    },
    null,
    2
  );
}

function genericHttpExample(endpoint, token) {
  return `curl -X POST "${endpoint}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer ${token}" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "get_performance_metrics",
      "arguments": { "companyId": "1" }
    }
  }'`;
}

// ─── Small components ─────────────────────────────────────────────────────
function CopyButton({ text, className = "" }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {}
  };
  return (
    <button
      onClick={copy}
      className={`tw:p-1.5 tw:rounded tw:text-zinc-500 hover:tw:text-white hover:tw:bg-white/10 tw:transition-colors ${className}`}
      title="Copy"
    >
      {copied ? <Check size={14} className="tw:text-green-400" /> : <Copy size={14} />}
    </button>
  );
}

function CodeBlock({ code, label }) {
  return (
    <div className="tw:relative tw:rounded-xl tw:border tw:border-white/[0.07] tw:bg-zinc-900 tw:overflow-hidden">
      {label && (
        <div className="tw:flex tw:items-center tw:justify-between tw:px-4 tw:py-2 tw:border-b tw:border-white/[0.06]">
          <span className="tw:text-[11px] tw:font-mono tw:text-zinc-500">{label}</span>
          <CopyButton text={code} />
        </div>
      )}
      <pre className="tw:p-4 tw:text-xs tw:font-mono tw:text-zinc-300 tw:overflow-x-auto tw:whitespace-pre tw:leading-relaxed">
        {code}
      </pre>
    </div>
  );
}

function Collapsible({ title, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="tw:rounded-xl tw:border tw:border-white/[0.07] tw:bg-zinc-900/60 tw:overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="tw:w-full tw:flex tw:items-center tw:gap-3 tw:px-5 tw:py-4 hover:tw:bg-white/[0.02] tw:transition-colors tw:text-left"
      >
        {open ? <ChevronDown size={15} className="tw:text-zinc-500 tw:shrink-0" /> : <ChevronRight size={15} className="tw:text-zinc-500 tw:shrink-0" />}
        <span className="tw:text-sm tw:font-semibold tw:text-white tw:flex-1">{title}</span>
        {badge && (
          <span className="tw:text-[10px] tw:font-semibold tw:px-2 tw:py-0.5 tw:rounded tw:bg-cyan-500/15 tw:text-cyan-400 tw:border tw:border-cyan-500/20">
            {badge}
          </span>
        )}
      </button>
      {open && <div className="tw:px-5 tw:pb-5 tw:space-y-4">{children}</div>}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────
export default function McpConnectPage() {
  const [token, setToken] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [endpoint, setEndpoint] = useState("");

  useEffect(() => {
    const t = Cookies.get("auth_token") ?? "";
    setToken(t);
    setEndpoint(`${window.location.origin}/api/mcp`);
  }, []);

  const maskedToken = token
    ? token.slice(0, 6) + "•".repeat(Math.max(0, token.length - 10)) + token.slice(-4)
    : "loading…";

  return (
    <div className="tw:max-w-3xl tw:space-y-8">
      {/* Header */}
      <div>
        <div className="tw:flex tw:items-center tw:gap-2.5 tw:mb-2">
          <Plug2 size={20} className="tw:text-cyan-400" />
          <h2 className="tw:text-xl tw:font-semibold tw:text-white">MCP Connect</h2>
          <span className="tw:text-[10px] tw:font-semibold tw:px-2 tw:py-0.5 tw:rounded tw:bg-cyan-500/15 tw:text-cyan-400 tw:border tw:border-cyan-500/20">
            Beta
          </span>
        </div>
        <p className="tw:text-zinc-400 tw:text-sm tw:leading-relaxed">
          Connect any MCP-compatible AI agent — Claude Desktop, Cursor, Windsurf, or a custom script — to your live Atlas data.
          Your agent can then query campaign metrics, detect anomalies, and pull P&L summaries directly.
        </p>
      </div>

      {/* Info banner */}
      <div className="tw:flex tw:gap-3 tw:p-4 tw:rounded-xl tw:bg-cyan-500/[0.06] tw:border tw:border-cyan-500/20">
        <Info size={16} className="tw:text-cyan-400 tw:shrink-0 tw:mt-0.5" />
        <p className="tw:text-sm tw:text-cyan-200/80 tw:leading-relaxed">
          <span className="tw:font-semibold">What is MCP?</span> The Model Context Protocol (MCP) is an open standard that lets AI assistants fetch live data from external
          services. Instead of copy-pasting numbers from Atlas, your AI agent can call Atlas tools directly and get real-time answers.
        </p>
      </div>

      {/* Credentials card */}
      <div className="tw:rounded-2xl tw:border tw:border-white/[0.08] tw:bg-zinc-900 tw:p-5 tw:space-y-5">
        <p className="tw:text-xs tw:uppercase tw:tracking-widest tw:text-zinc-500 tw:font-semibold">
          Your Credentials
        </p>

        {/* Endpoint */}
        <div>
          <label className="tw:block tw:text-xs tw:text-zinc-500 tw:mb-1.5">MCP Endpoint</label>
          <div className="tw:flex tw:items-center tw:gap-2 tw:p-3 tw:rounded-lg tw:border tw:border-white/[0.08] tw:bg-zinc-950 tw:font-mono tw:text-sm tw:text-zinc-200">
            <span className="tw:flex-1 tw:truncate">{endpoint || "https://your-atlas-domain/api/mcp"}</span>
            <CopyButton text={endpoint} />
          </div>
        </div>

        {/* API key */}
        <div>
          <label className="tw:block tw:text-xs tw:text-zinc-500 tw:mb-1.5">API Key (your session token)</label>
          <div className="tw:flex tw:items-center tw:gap-2 tw:p-3 tw:rounded-lg tw:border tw:border-white/[0.08] tw:bg-zinc-950 tw:font-mono tw:text-sm tw:text-zinc-200">
            <span className="tw:flex-1 tw:truncate tw:select-all">
              {showToken ? token : maskedToken}
            </span>
            <button
              onClick={() => setShowToken((v) => !v)}
              className="tw:p-1.5 tw:rounded tw:text-zinc-500 hover:tw:text-white hover:tw:bg-white/10 tw:transition-colors tw:shrink-0"
              title={showToken ? "Hide token" : "Reveal token"}
            >
              {showToken ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
            <CopyButton text={token} />
          </div>
          <p className="tw:mt-1.5 tw:text-[11px] tw:text-zinc-600">
            This is your current session token. It expires when you log out. Treat it like a password.
          </p>
        </div>
      </div>

      {/* Setup guides */}
      <div className="tw:space-y-3">
        <p className="tw:text-xs tw:uppercase tw:tracking-widest tw:text-zinc-500 tw:font-semibold tw:px-1">
          Setup Guides
        </p>

        <Collapsible title="Claude Desktop" badge="Recommended" defaultOpen>
          <p className="tw:text-sm tw:text-zinc-400 tw:leading-relaxed">
            Open your Claude Desktop config file and add the Atlas server. Restart Claude after saving.
          </p>
          <div className="tw:text-xs tw:text-zinc-500 tw:space-y-1">
            <p><span className="tw:text-zinc-400 tw:font-medium">macOS:</span> <code className="tw:font-mono">~/Library/Application Support/Claude/claude_desktop_config.json</code></p>
            <p><span className="tw:text-zinc-400 tw:font-medium">Windows:</span> <code className="tw:font-mono">%APPDATA%\Claude\claude_desktop_config.json</code></p>
          </div>
          <CodeBlock
            label="claude_desktop_config.json"
            code={claudeDesktopConfig(endpoint || "https://your-atlas-domain/api/mcp", showToken ? token : "<YOUR_API_KEY>")}
          />
          <p className="tw:text-xs tw:text-zinc-500">
            Requires <code className="tw:font-mono">npx</code> (Node 18+). The <code className="tw:font-mono">@modelcontextprotocol/server-fetch</code> package bridges the HTTP endpoint to Claude&apos;s stdio transport.
          </p>
        </Collapsible>

        <Collapsible title="Cursor / Windsurf / VS Code (HTTP transport)">
          <p className="tw:text-sm tw:text-zinc-400 tw:leading-relaxed">
            Paste the config into your editor&apos;s MCP settings. Cursor supports HTTP transport natively — no extra process needed.
          </p>
          <div className="tw:text-xs tw:text-zinc-500 tw:space-y-1">
            <p><span className="tw:text-zinc-400 tw:font-medium">Cursor:</span> Settings → MCP Servers → Add server</p>
            <p><span className="tw:text-zinc-400 tw:font-medium">Config file:</span> <code className="tw:font-mono">~/.cursor/mcp.json</code></p>
          </div>
          <CodeBlock
            label="mcp.json"
            code={cursorConfig(endpoint || "https://your-atlas-domain/api/mcp", showToken ? token : "<YOUR_API_KEY>")}
          />
        </Collapsible>

        <Collapsible title="Any MCP client / cURL test">
          <p className="tw:text-sm tw:text-zinc-400 tw:leading-relaxed">
            The Atlas MCP endpoint speaks JSON-RPC 2.0 over plain HTTP POST. Any library or language can call it.
          </p>
          <CodeBlock
            label="shell — test with cURL"
            code={genericHttpExample(endpoint || "https://your-atlas-domain/api/mcp", showToken ? token : "<YOUR_API_KEY>")}
          />
        </Collapsible>
      </div>

      {/* Available tools */}
      <div className="tw:space-y-3">
        <p className="tw:text-xs tw:uppercase tw:tracking-widest tw:text-zinc-500 tw:font-semibold tw:px-1">
          Available Tools ({TOOLS.length})
        </p>

        <div className="tw:space-y-2">
          {TOOLS.map((tool) => (
            <div
              key={tool.name}
              className="tw:rounded-xl tw:border tw:border-white/[0.07] tw:bg-zinc-900/60 tw:p-4 tw:space-y-3"
            >
              <div className="tw:flex tw:items-start tw:gap-3">
                <Zap size={14} className="tw:text-cyan-400 tw:shrink-0 tw:mt-0.5" />
                <div>
                  <code className="tw:text-sm tw:font-mono tw:font-semibold tw:text-white">
                    {tool.name}
                  </code>
                  <p className="tw:text-xs tw:text-zinc-400 tw:mt-0.5 tw:leading-relaxed">
                    {tool.description}
                  </p>
                </div>
              </div>
              <div className="tw:ml-5 tw:overflow-x-auto">
                <table className="tw:w-full tw:text-xs">
                  <thead>
                    <tr className="tw:text-left tw:text-zinc-600">
                      <th className="tw:pb-1 tw:pr-4 tw:font-medium">Parameter</th>
                      <th className="tw:pb-1 tw:pr-4 tw:font-medium">Type</th>
                      <th className="tw:pb-1 tw:pr-4 tw:font-medium">Required</th>
                      <th className="tw:pb-1 tw:font-medium">Description</th>
                    </tr>
                  </thead>
                  <tbody className="tw:divide-y tw:divide-white/[0.04]">
                    {tool.params.map((p) => (
                      <tr key={p.name} className="tw:text-zinc-400">
                        <td className="tw:py-1.5 tw:pr-4 tw:font-mono tw:text-zinc-300">{p.name}</td>
                        <td className="tw:py-1.5 tw:pr-4 tw:font-mono tw:text-zinc-500">{p.type}</td>
                        <td className="tw:py-1.5 tw:pr-4">
                          {p.required ? (
                            <span className="tw:text-amber-400 tw:font-medium">yes</span>
                          ) : (
                            <span className="tw:text-zinc-600">no</span>
                          )}
                        </td>
                        <td className="tw:py-1.5">{p.desc}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer link */}
      <div className="tw:flex tw:items-center tw:gap-2 tw:text-xs tw:text-zinc-600">
        <ExternalLink size={12} />
        <a
          href="https://modelcontextprotocol.io/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:tw:text-zinc-400 tw:transition-colors"
        >
          MCP documentation — modelcontextprotocol.io
        </a>
      </div>
    </div>
  );
}
