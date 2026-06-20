"use client";

import { Zap } from "lucide-react";

interface OrganicKPI {
  label: string;
  value: string;
  sub?: string;
}

function OrganicCard({ kpi }: { kpi: OrganicKPI }) {
  return (
    <div className="flex-1 px-4 py-3 min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wider text-wyb-muted mb-1">
        {kpi.label}
      </p>
      <p
        className="text-[23px] font-semibold text-wyb-text leading-none"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {kpi.value}
      </p>
      {kpi.sub && (
        <p className="text-[11px] text-wyb-muted mt-1 tabular-nums">{kpi.sub}</p>
      )}
    </div>
  );
}

const ORGANIC_KPIS: OrganicKPI[] = [
  { label: "FTDs diretos", value: "0", sub: "aguardando eventos" },
  { label: "Volume FTD direto", value: "R$ 0,00", sub: "sem utm_inf" },
  { label: "Redepósitos diretos", value: "0", sub: "aguardando eventos" },
  { label: "Volume redep. direto", value: "R$ 0,00", sub: "sem utm_inf" },
];

export function OrganicStrip() {
  return (
    <div className="border border-wyb-border rounded-[10px] bg-wyb-surface overflow-hidden shadow-wyb">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-wyb-border bg-wyb-surface-2">
        <Zap className="size-3.5 text-wyb-accent" />
        <span className="text-[12px] font-medium text-wyb-text">
          Tráfego direto
        </span>
        <span className="text-[11px] text-wyb-muted ml-1">
          — eventos recebidos sem <code className="font-mono text-wyb-accent">utm_inf</code> (tráfego pago / orgânico não atribuído)
        </span>
      </div>
      <div className="flex divide-x divide-wyb-border">
        {ORGANIC_KPIS.map((kpi) => (
          <OrganicCard key={kpi.label} kpi={kpi} />
        ))}
      </div>
    </div>
  );
}
