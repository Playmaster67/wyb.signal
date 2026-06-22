"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from "recharts";
import { C } from "@/lib/chart-colors";

interface RetentionChartProps {
  data: { name: string; rate: number }[];
}

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number; payload: { name: string } }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-wyb-surface border border-wyb-border rounded-[8px] px-3 py-2 shadow-wyb">
      <p className="text-[11px] text-wyb-muted">{payload[0].payload.name}</p>
      <p className="text-[13px] font-semibold text-wyb-text" style={{ fontVariantNumeric: "tabular-nums" }}>
        {payload[0].value}% retenção
      </p>
    </div>
  );
}

export function RetentionChart({ data }: RetentionChartProps) {
  const sorted = [...data].sort((a, b) => b.rate - a.rate);
  const AVG = sorted.length > 0 ? Math.round(sorted.reduce((s, d) => s + d.rate, 0) / sorted.length) : 0;

  return (
    <div className="border border-wyb-border rounded-[10px] bg-wyb-surface p-4 shadow-wyb">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-wyb-muted">
          Taxa FTD → Redepósito por influencer
        </p>
        {sorted.length > 0 && (
          <span className="text-[11px] text-wyb-muted">
            Média: <span className="font-semibold text-wyb-text" style={{ fontVariantNumeric: "tabular-nums" }}>{AVG}%</span>
          </span>
        )}
      </div>
      {sorted.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-center px-6 text-[12px] text-wyb-muted">
          Nenhum influencer com FTD no período selecionado.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 40, bottom: 0, left: 0 }} barCategoryGap="30%">
            <CartesianGrid horizontal={false} stroke={C.border} strokeDasharray="0" />
            <XAxis type="number" domain={[0, 70]} allowDecimals={false} tick={{ fill: C.faint, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
            <YAxis type="category" dataKey="name" width={90} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: C.accentSoft }} />
            <ReferenceLine x={AVG} stroke={C.faint} strokeDasharray="3 3" strokeWidth={1} />
            <Bar dataKey="rate" radius={[0, 4, 4, 0]} maxBarSize={16}>
              {sorted.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.rate >= AVG ? C.pos : C.faint}
                  fillOpacity={entry.rate >= AVG ? 0.85 : 0.5}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
