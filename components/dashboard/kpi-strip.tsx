"use client";

interface KPIStripProps {
  leads: number;
  ftds: number;
  redeposits: number;
  volumeBrl: number;
  leadToFtdRate: number;
}

interface KPI {
  label: string;
  value: string;
}

function KPICard({ kpi }: { kpi: KPI }) {
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
    </div>
  );
}

export function KPIStrip({ leads, ftds, redeposits, volumeBrl, leadToFtdRate }: KPIStripProps) {
  const kpis: KPI[] = [
    { label: "FTDs", value: ftds.toLocaleString("pt-BR") },
    { label: "Leads", value: leads.toLocaleString("pt-BR") },
    { label: "Redepósitos", value: redeposits.toLocaleString("pt-BR") },
    { label: "Volume BRL", value: `R$ ${volumeBrl.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` },
    { label: "Taxa Lead→FTD", value: `${leadToFtdRate.toFixed(1).replace(".", ",")}%` },
  ];

  return (
    <div className="flex divide-x divide-wyb-border border border-wyb-border rounded-[10px] bg-wyb-surface overflow-hidden shadow-wyb">
      {kpis.map((kpi) => (
        <KPICard key={kpi.label} kpi={kpi} />
      ))}
    </div>
  );
}
