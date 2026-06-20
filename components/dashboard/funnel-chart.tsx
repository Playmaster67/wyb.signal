"use client";

interface FunnelChartProps {
  leadUsers: number;
  ftdUsers: number;
  redepositUsers: number;
}

export function FunnelChart({ leadUsers, ftdUsers, redepositUsers }: FunnelChartProps) {
  const steps = [
    { label: "Leads",       value: leadUsers,      pct: null as number | null },
    { label: "FTDs",        value: ftdUsers,        pct: leadUsers > 0 ? (ftdUsers / leadUsers) * 100 : 0 },
    { label: "Redepósitos", value: redepositUsers,  pct: ftdUsers > 0 ? (redepositUsers / ftdUsers) * 100 : 0 },
  ];
  const max = Math.max(steps[0].value, 1);

  return (
    <div className="border border-wyb-border rounded-[10px] bg-wyb-surface p-4 shadow-wyb">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-wyb-muted">
          Funil de conversão
        </p>
        <span className="text-[11px] text-wyb-faint">usuários únicos</span>
      </div>
      {leadUsers === 0 ? (
        <div className="py-10 text-center text-[12px] text-wyb-muted">
          Nenhum lead registrado no período selecionado.
        </div>
      ) : (
        <div className="space-y-2">
          {steps.map((step, i) => {
            const width = (step.value / max) * 100;
            return (
              <div key={step.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[12px] text-wyb-muted">{step.label}</span>
                  <span
                    className="text-[13px] font-semibold text-wyb-text tabular-nums"
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {step.value.toLocaleString("pt-BR")}
                  </span>
                </div>
                <div className="h-6 bg-wyb-surface-2 rounded-[4px] overflow-hidden">
                  <div
                    className="h-full bg-wyb-accent rounded-[4px] transition-all"
                    style={{ width: `${width}%`, opacity: 1 - i * 0.22 }}
                  />
                </div>
                {step.pct !== null && (
                  <p className="text-[11px] text-wyb-muted mt-0.5">
                    ↳ {step.pct.toFixed(1)}% do passo anterior
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
