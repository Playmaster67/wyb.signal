"use client";

import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPI {
  label: string;
  value: string;
  delta: number; // % vs período anterior
  deltaLabel?: string;
}

function DeltaIcon({ delta }: { delta: number }) {
  if (delta > 0) return <TrendingUp className="size-3 text-wyb-pos" />;
  if (delta < 0) return <TrendingDown className="size-3 text-wyb-neg" />;
  return <Minus className="size-3 text-wyb-neutral" />;
}

function KPICard({ kpi }: { kpi: KPI }) {
  const deltaColor =
    kpi.delta > 0
      ? "text-wyb-pos"
      : kpi.delta < 0
        ? "text-wyb-neg"
        : "text-wyb-neutral";

  return (
    <div className="flex-1 px-4 py-3 min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wider text-wyb-muted mb-1">
        {kpi.label}
      </p>
      <p
        className="text-[23px] font-semibold text-wyb-text leading-none tabular-nums"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {kpi.value}
      </p>
      {kpi.delta !== undefined && (
        <div className={cn("flex items-center gap-1 mt-1.5", deltaColor)}>
          <DeltaIcon delta={kpi.delta} />
          <span className="text-[11px] font-medium tabular-nums">
            {kpi.delta > 0 ? "+" : ""}
            {kpi.delta.toFixed(1)}%
          </span>
          {kpi.deltaLabel && (
            <span className="text-[11px] text-wyb-faint">{kpi.deltaLabel}</span>
          )}
        </div>
      )}
    </div>
  );
}

const KPIS: KPI[] = [
  { label: "FTDs", value: "312", delta: 12.4, deltaLabel: "vs período ant." },
  { label: "Leads", value: "1.847", delta: 8.1, deltaLabel: "vs período ant." },
  { label: "Redepósitos", value: "934", delta: -3.2, deltaLabel: "vs período ant." },
  { label: "Volume BRL", value: "R$ 284.600", delta: 15.7, deltaLabel: "vs período ant." },
  { label: "Taxa Lead→FTD", value: "16,9%", delta: 0.6, deltaLabel: "vs período ant." },
];

export function KPIStrip() {
  return (
    <div className="flex divide-x divide-wyb-border border border-wyb-border rounded-[10px] bg-wyb-surface overflow-hidden shadow-wyb">
      {KPIS.map((kpi) => (
        <KPICard key={kpi.label} kpi={kpi} />
      ))}
    </div>
  );
}
