"use client";

import { useState, useMemo } from "react";
import { Download, AlertTriangle, FileText, FileSpreadsheet, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type Period      = "7" | "14" | "30" | "90";
type EventType   = "all" | "lead" | "ftd" | "redeposit";
type Attribution = "all" | "attributed" | "organic";
type Format      = "csv" | "xlsx";

interface ExportLog {
  id: string;
  exported_at: string;
  period: string;
  event_type: string;
  influencer: string;
  row_count: number;
  format: Format;
}

// ─── Static data ──────────────────────────────────────────────────────────────
const INFLUENCERS = [
  { id: "all",  name: "Todos os influencers" },
  { id: "1",    name: "thunder_br"    },
  { id: "2",    name: "vitinho_fx"    },
  { id: "3",    name: "camila.odds"   },
  { id: "4",    name: "betmaster_mx"  },
  { id: "5",    name: "lukasbet"      },
  { id: "6",    name: "analista_cl"   },
  { id: "7",    name: "rodrigo_vip"   },
  { id: "8",    name: "palpiteiro"    },
];

const PERIOD_LABEL: Record<Period, string> = {
  "7":  "Últimos 7 dias",
  "14": "Últimos 14 dias",
  "30": "Últimos 30 dias",
  "90": "Últimos 90 dias",
};

const EVENT_LABEL: Record<EventType, string> = {
  all:       "Todos os tipos",
  lead:      "Lead",
  ftd:       "FTD",
  redeposit: "Redepósito",
};

const ATTR_LABEL: Record<Attribution, string> = {
  all:        "Todos",
  attributed: "Atribuído",
  organic:    "Orgânico",
};

const MOCK_LOGS: ExportLog[] = [
  { id: "e1", exported_at: "2025-06-15T14:32:00", period: "Últimos 30 dias",  event_type: "FTD",           influencer: "thunder_br",   row_count: 89,   format: "csv"  },
  { id: "e2", exported_at: "2025-06-14T09:15:00", period: "Últimos 7 dias",   event_type: "Todos",         influencer: "Todos",        row_count: 247,  format: "xlsx" },
  { id: "e3", exported_at: "2025-06-12T17:04:00", period: "Últimos 90 dias",  event_type: "Lead",          influencer: "Todos",        row_count: 1847, format: "csv"  },
  { id: "e4", exported_at: "2025-06-10T11:50:00", period: "Últimos 30 dias",  event_type: "Redepósito",    influencer: "camila.odds",  row_count: 140,  format: "xlsx" },
  { id: "e5", exported_at: "2025-06-07T08:23:00", period: "Últimos 14 dias",  event_type: "FTD",           influencer: "vitinho_fx",   row_count: 74,   format: "csv"  },
];

const MAX_ROWS = 50_000;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function simulateCount(
  period: Period,
  eventType: EventType,
  influencerId: string,
  attribution: Attribution
): number {
  const BASE: Record<Period, number> = { "7": 247, "14": 489, "30": 1024, "90": 2847 };
  let n = BASE[period];
  if (eventType !== "all")     n = Math.floor(n * 0.33);
  if (influencerId !== "all")  n = Math.floor(n * 0.11);
  if (attribution !== "all")   n = Math.floor(n * 0.82);
  return Math.max(n, 1);
}

function formatCount(n: number): string {
  return n.toLocaleString("pt-BR");
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString("pt-BR", {
    day: "2-digit", month: "short", year: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
}

function buildMockCsv(
  count: number,
  eventType: EventType,
  influencerId: string
): string {
  const TYPES  = eventType === "all"
    ? ["lead", "ftd", "redeposit"]
    : [eventType === "redeposit" ? "redeposit" : eventType];
  const UTMS   = influencerId === "all"
    ? ["a3k9f2", "b7m2x1", "c9p4n8", "d2q7r3", "e5s1t6"]
    : [INFLUENCERS.find((i) => i.id === influencerId)?.name ?? "unknown"];
  const SAMPLE = Math.min(count, 50);

  const header = ["event_id", "event_type", "user_id", "utm_inf", "value_brl", "deposit_number", "event_ts"].join(",");
  const rows   = Array.from({ length: SAMPLE }, (_, i) => {
    const type = TYPES[i % TYPES.length];
    const depositNum = type === "redeposit" ? String(Math.floor(Math.random() * 5) + 1) : "";
    return [
      `evt_${Math.random().toString(36).slice(2, 10)}`,
      type,
      `usr_${1000 + i}`,
      UTMS[i % UTMS.length],
      (Math.random() * 480 + 50).toFixed(2),
      depositNum,
      new Date(Date.now() - i * 3_600_000).toISOString(),
    ].join(",");
  });

  return [header, ...rows].join("\n");
}

function triggerDownload(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement("a");
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ─── Label chips ──────────────────────────────────────────────────────────────
function FilterLabel({ value }: { value: string }) {
  return (
    <span className="font-mono text-[11px] text-wyb-muted bg-wyb-surface-2 border border-wyb-border rounded px-1.5 py-0.5">
      {value}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function ExportPanel() {
  // Filters
  const [period,       setPeriod]       = useState<Period>("30");
  const [eventType,    setEventType]    = useState<EventType>("all");
  const [influencerId, setInfluencerId] = useState("all");
  const [attribution,  setAttribution]  = useState<Attribution>("all");

  // Export log
  const [logs, setLogs] = useState<ExportLog[]>(MOCK_LOGS);
  const [exporting, setExporting] = useState<Format | null>(null);

  const count = useMemo(
    () => simulateCount(period, eventType, influencerId, attribution),
    [period, eventType, influencerId, attribution]
  );

  const overLimit = count > MAX_ROWS;
  const influencerName = INFLUENCERS.find((i) => i.id === influencerId)?.name ?? "Todos";

  async function handleExport(format: Format) {
    if (overLimit) return;
    setExporting(format);

    // Simulate async export (real: server action / API call)
    await new Promise((r) => setTimeout(r, 800));

    const csv      = buildMockCsv(count, eventType, influencerId);
    const datePart = new Date().toISOString().split("T")[0];
    const filename = `wyb_export_${datePart}.${format}`;
    const mime     = format === "csv"
      ? "text/csv;charset=utf-8;"
      : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

    triggerDownload(csv, filename, mime);

    setLogs((prev) => [
      {
        id:          crypto.randomUUID(),
        exported_at: new Date().toISOString(),
        period:      PERIOD_LABEL[period],
        event_type:  EVENT_LABEL[eventType],
        influencer:  influencerName,
        row_count:   count,
        format,
      },
      ...prev,
    ]);

    setExporting(null);
  }

  const SELECT_CLS = "h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-[13px] text-foreground outline-none transition-colors focus:border-ring";

  const PERIOD_TABS: { value: Period; label: string }[] = [
    { value: "7",  label: "7d"  },
    { value: "14", label: "14d" },
    { value: "30", label: "30d" },
    { value: "90", label: "90d" },
  ];

  return (
    <>
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-[18px] font-semibold text-wyb-text leading-none">Exportação</h1>
        <p className="text-[12px] text-wyb-muted mt-1">
          Exporte eventos com filtros — sem PII além do <code className="font-mono text-[11px]">user_id</code>
        </p>
      </div>

      {/* ── Filters card ────────────────────────────────────────────────── */}
      <div className="border border-wyb-border rounded-[10px] bg-wyb-surface p-4 shadow-wyb">
        <p className="text-[11px] font-medium uppercase tracking-wider text-wyb-muted mb-4">
          Filtros
        </p>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Período */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-wyb-muted">Período</label>
            <div className="flex border border-wyb-border rounded-[8px] overflow-hidden">
              {PERIOD_TABS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setPeriod(t.value)}
                  className={cn(
                    "flex-1 h-8 text-[12px] font-medium transition-colors",
                    period === t.value
                      ? "bg-wyb-accent text-white"
                      : "text-wyb-muted hover:bg-wyb-surface-2 hover:text-wyb-text"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tipo de evento */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-wyb-muted">Tipo de evento</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventType)}
              className={SELECT_CLS}
            >
              <option value="all">Todos os tipos</option>
              <option value="lead">Lead</option>
              <option value="ftd">FTD</option>
              <option value="redeposit">Redepósito</option>
            </select>
          </div>

          {/* Influencer */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-wyb-muted">Influencer</label>
            <select
              value={influencerId}
              onChange={(e) => setInfluencerId(e.target.value)}
              className={SELECT_CLS}
            >
              {INFLUENCERS.map((inf) => (
                <option key={inf.id} value={inf.id}>{inf.name}</option>
              ))}
            </select>
          </div>

          {/* Atribuição */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-medium text-wyb-muted">Atribuição</label>
            <select
              value={attribution}
              onChange={(e) => setAttribution(e.target.value as Attribution)}
              className={SELECT_CLS}
            >
              <option value="all">Todos</option>
              <option value="attributed">Atribuído</option>
              <option value="organic">Orgânico</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Preview + Export ────────────────────────────────────────────── */}
      <div className={cn(
        "border rounded-[10px] p-4 shadow-wyb",
        overLimit
          ? "border-amber-500/30 bg-amber-500/5"
          : "border-wyb-border bg-wyb-surface"
      )}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {overLimit ? (
              <>
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-amber-500 shrink-0" />
                  <span className="text-[15px] font-semibold text-wyb-text tabular-nums">
                    {formatCount(count)} eventos
                  </span>
                </div>
                <p className="text-[12px] text-amber-600 mt-0.5">
                  Excede o limite de {formatCount(MAX_ROWS)} por requisição.
                  Refine os filtros ou divida em períodos menores.
                </p>
              </>
            ) : (
              <>
                <span className="text-[22px] font-semibold text-wyb-text tabular-nums leading-none">
                  {formatCount(count)}
                  <span className="text-[14px] font-normal text-wyb-muted ml-2">eventos</span>
                </span>
                <p className="text-[12px] text-wyb-muted mt-1">
                  {PERIOD_LABEL[period]} · {EVENT_LABEL[eventType]} · {influencerName} · {ATTR_LABEL[attribution]}
                </p>
                <p className="text-[11px] text-wyb-faint mt-0.5">
                  Colunas: event_id, event_type, user_id, utm_inf, value_brl, deposit_number, event_ts
                </p>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              disabled={overLimit || exporting !== null}
              onClick={() => handleExport("csv")}
              className="gap-1.5"
            >
              {exporting === "csv" ? (
                <span className="size-3.5 rounded-full border-2 border-wyb-accent border-t-transparent animate-spin" />
              ) : (
                <FileText className="size-3.5" />
              )}
              CSV
            </Button>
            <Button
              size="sm"
              disabled={overLimit || exporting !== null}
              onClick={() => handleExport("xlsx")}
              className="gap-1.5"
            >
              {exporting === "xlsx" ? (
                <span className="size-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <FileSpreadsheet className="size-3.5" />
              )}
              XLSX
            </Button>
          </div>
        </div>
      </div>

      {/* ── Audit log ───────────────────────────────────────────────────── */}
      <div className="border border-wyb-border rounded-[10px] bg-wyb-surface overflow-hidden shadow-wyb">
        <div className="px-4 py-3 border-b border-wyb-border flex items-center gap-2">
          <Clock className="size-3.5 text-wyb-muted" />
          <p className="text-[11px] font-medium uppercase tracking-wider text-wyb-muted">
            Log de exportações
          </p>
        </div>

        <table className="w-full text-[13px]" style={{ fontVariantNumeric: "tabular-nums" }}>
          <thead>
            <tr className="border-b border-wyb-border">
              {["Data / Hora", "Período", "Tipo", "Influencer", "Linhas", "Formato"].map((h) => (
                <th
                  key={h}
                  className={cn(
                    "px-4 py-2.5 text-[11px] font-medium uppercase tracking-wider text-wyb-muted text-left whitespace-nowrap select-none",
                    h === "Linhas" && "text-right"
                  )}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-wyb-muted">
                  Nenhuma exportação realizada ainda.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-wyb-border last:border-0 hover:bg-wyb-surface-2 transition-colors"
                  style={{ height: 40 }}
                >
                  <td className="px-4 text-wyb-muted whitespace-nowrap">
                    {formatDateTime(log.exported_at)}
                  </td>
                  <td className="px-4">
                    <FilterLabel value={log.period} />
                  </td>
                  <td className="px-4">
                    <FilterLabel value={log.event_type} />
                  </td>
                  <td className="px-4 text-wyb-muted">
                    {log.influencer}
                  </td>
                  <td className="px-4 text-right font-semibold text-wyb-text tabular-nums">
                    {formatCount(log.row_count)}
                  </td>
                  <td className="px-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] px-1.5 py-0 h-5 rounded-[4px] border font-mono uppercase",
                        log.format === "csv"
                          ? "border-wyb-accent/30 text-wyb-accent bg-wyb-accent-soft"
                          : "border-wyb-pos/30 text-wyb-pos bg-wyb-pos/5"
                      )}
                    >
                      {log.format}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
