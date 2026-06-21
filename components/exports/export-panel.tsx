"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, FileText, FileSpreadsheet, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getExportPreviewAction } from "@/app/(dashboard)/exports/actions";
import type { ExportLogRow, ExportInfluencer } from "@/lib/exports/data";

// ─── Types ────────────────────────────────────────────────────────────────────
type Period      = "7" | "14" | "30" | "90";
type EventType   = "all" | "lead" | "ftd" | "redeposit";
type Attribution = "all" | "attributed" | "organic";
type Format      = "csv" | "xlsx";

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

const MAX_ROWS = 50_000;

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

function triggerBlobDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a   = document.createElement("a");
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
export function ExportPanel({
  initialLogs,
  influencers,
}: {
  initialLogs: ExportLogRow[];
  influencers: ExportInfluencer[];
}) {
  const router = useRouter();
  const logs = initialLogs;

  // Filters
  const [period,       setPeriod]       = useState<Period>("30");
  const [eventType,    setEventType]    = useState<EventType>("all");
  const [influencerId, setInfluencerId] = useState("all");
  const [attribution,  setAttribution]  = useState<Attribution>("all");

  const [count, setCount]         = useState(0);
  const [loadingCount, setLoadingCount] = useState(true);
  const [exporting, setExporting] = useState<Format | null>(null);

  const influencerOptions = useMemo(
    () => [{ id: "all", name: "Todos os influencers" }, ...influencers],
    [influencers]
  );

  // Preview em tempo real — debounce nos filtros
  useEffect(() => {
    let active = true;
    const t = setTimeout(async () => {
      if (active) setLoadingCount(true);
      const result = await getExportPreviewAction(Number(period), eventType, influencerId, attribution);
      if (active) {
        setCount(result.count);
        setLoadingCount(false);
      }
    }, 250);
    return () => { active = false; clearTimeout(t); };
  }, [period, eventType, influencerId, attribution]);

  const overLimit = count > MAX_ROWS;
  const influencerName = influencerOptions.find((i) => i.id === influencerId)?.name ?? "Todos";

  async function handleExport(format: Format) {
    if (overLimit) return;
    setExporting(format);

    const params = new URLSearchParams({
      period: period,
      event_type: eventType,
      influencer_id: influencerId,
      attribution: attribution,
      format,
    });

    try {
      const res = await fetch(`/api/export?${params.toString()}`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        alert(body.error ?? "Falha ao exportar.");
        return;
      }
      const blob = await res.blob();
      const datePart = new Date().toISOString().split("T")[0];
      triggerBlobDownload(blob, `wyb_export_${datePart}.${format}`);
      router.refresh();
    } finally {
      setExporting(null);
    }
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
              {influencerOptions.map((inf) => (
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
            {loadingCount ? (
              <span className="text-[22px] font-semibold text-wyb-faint tabular-nums leading-none">…</span>
            ) : overLimit ? (
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
              disabled={overLimit || loadingCount || exporting !== null}
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
              disabled={overLimit || loadingCount || exporting !== null}
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
                    <FilterLabel value={`${log.filters.period_days}d`} />
                  </td>
                  <td className="px-4">
                    <FilterLabel value={log.filters.event_type} />
                  </td>
                  <td className="px-4 text-wyb-muted">
                    {log.filters.influencer}
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
