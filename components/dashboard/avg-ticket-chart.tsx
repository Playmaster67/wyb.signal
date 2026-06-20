"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { C } from "@/lib/chart-colors";

const data = [
  { name: "camila.odds",  ticket: 883 },
  { name: "analista_cl",  ticket: 882 },
  { name: "vitinho_fx",   ticket: 881 },
  { name: "lukasbet",     ticket: 409 },
  { name: "betmaster_mx", ticket: 306 },
  { name: "thunder_br",   ticket: 148 },
  { name: "rodrigo_vip",  ticket: 110 },
  { name: "palpiteiro",   ticket: 95  },
].sort((a, b) => b.ticket - a.ticket);

const AVG = Math.round(data.reduce((s, d) => s + d.ticket, 0) / data.length);

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number; payload: { name: string } }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-wyb-surface border border-wyb-border rounded-[8px] px-3 py-2 shadow-wyb">
      <p className="text-[11px] text-wyb-muted">{payload[0].payload.name}</p>
      <p className="text-[13px] font-semibold text-wyb-text" style={{ fontVariantNumeric: "tabular-nums" }}>
        R$ {payload[0].value.toLocaleString("pt-BR")}
      </p>
    </div>
  );
}

export function AvgTicketChart() {
  return (
    <div className="border border-wyb-border rounded-[10px] bg-wyb-surface p-4 shadow-wyb">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-wyb-muted">
          Ticket médio FTD por influencer
        </p>
        <span className="text-[11px] text-wyb-muted">
          Média: <span className="font-semibold text-wyb-text" style={{ fontVariantNumeric: "tabular-nums" }}>R$ {AVG.toLocaleString("pt-BR")}</span>
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }} barCategoryGap="30%">
          <CartesianGrid horizontal={false} stroke={C.border} strokeDasharray="0" />
          <XAxis type="number" tick={{ fill: C.faint, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `R$${v}`} />
          <YAxis type="category" dataKey="name" width={90} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: C.accentSoft }} />
          <ReferenceLine x={AVG} stroke={C.faint} strokeDasharray="3 3" strokeWidth={1} />
          <Bar dataKey="ticket" radius={[0, 4, 4, 0]} maxBarSize={16}>
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.ticket >= AVG ? C.accent : C.faint}
                fillOpacity={entry.ticket >= AVG ? 0.85 : 0.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
