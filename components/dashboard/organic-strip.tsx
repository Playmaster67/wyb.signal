"use client";

import { Zap } from "lucide-react";

interface OrganicStripProps {
  leads: number;
  ftds: number;
  ftdVolumeBrl: number;
  redeposits: number;
  redepositVolumeBrl: number;
}

function fmtBRL(v: number) {
  return `R$ ${v.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`;
}

export function OrganicStrip({ leads, ftds, ftdVolumeBrl, redeposits, redepositVolumeBrl }: OrganicStripProps) {
  const kpis = [
    { label: "Leads diretos", value: leads.toLocaleString("pt-BR") },
    { label: "FTDs diretos", value: ftds.toLocaleString("pt-BR") },
    { label: "Volume FTD direto", value: fmtBRL(ftdVolumeBrl) },
    { label: "Redepósitos diretos", value: redeposits.toLocaleString("pt-BR") },
    { label: "Volume redep. direto", value: fmtBRL(redepositVolumeBrl) },
  ];

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
        {kpis.map((kpi) => (
          <div key={kpi.label} className="flex-1 px-4 py-3 min-w-0">
            <p className="text-[11px] font-medium uppercase tracking-wider text-wyb-muted mb-1">
              {kpi.label}
            </p>
            <p
              className="text-[23px] font-semibold text-wyb-text leading-none"
              style={{ fontVariantNumeric: "tabular-nums" }}
            >
              {kpi.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
