"use client";

// Funil usa usuários únicos por etapa — não contagem de eventos.
// "Redepósitos" = FTDs únicos com ao menos 1 redeposit (deposit_number ≥ 1).
// Total de eventos de redepósito (múltiplos por usuário) aparece no KPI, não aqui.
const steps = [
  { label: "Leads",       value: 1847, pct: null },
  { label: "FTDs",        value: 312,  pct: 16.9 },
  { label: "Redepósitos", value: 201,  pct: 64.4 },
];

export function FunnelChart() {
  const max = steps[0].value;

  return (
    <div className="border border-wyb-border rounded-[10px] bg-wyb-surface p-4 shadow-wyb">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] font-medium uppercase tracking-wider text-wyb-muted">
          Funil de conversão
        </p>
        <span className="text-[11px] text-wyb-faint">usuários únicos</span>
      </div>
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
                  ↳ {step.pct}% do passo anterior
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
