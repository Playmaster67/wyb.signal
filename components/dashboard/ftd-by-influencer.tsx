"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { C } from "@/lib/chart-colors";

const data = [
  { name: "thunder_br",   ftds: 89 },
  { name: "vitinho_fx",   ftds: 74 },
  { name: "camila.odds",  ftds: 61 },
  { name: "betmaster_mx", ftds: 53 },
  { name: "lukasbet",     ftds: 44 },
  { name: "analista_cl",  ftds: 38 },
  { name: "rodrigo_vip",  ftds: 29 },
  { name: "palpiteiro",   ftds: 19 },
].sort((a, b) => b.ftds - a.ftds);

function CustomTooltip({ active, payload }: { active?: boolean; payload?: { value: number; payload: { name: string } }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-wyb-surface border border-wyb-border rounded-[8px] px-3 py-2 shadow-wyb">
      <p className="text-[11px] text-wyb-muted">{payload[0].payload.name}</p>
      <p className="text-[13px] font-semibold text-wyb-text" style={{ fontVariantNumeric: "tabular-nums" }}>
        {payload[0].value} FTDs
      </p>
    </div>
  );
}

export function FTDByInfluencer() {
  return (
    <div className="border border-wyb-border rounded-[10px] bg-wyb-surface p-4 shadow-wyb">
      <p className="text-[11px] font-medium uppercase tracking-wider text-wyb-muted mb-3">
        FTDs por influencer
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }} barCategoryGap="30%">
          <CartesianGrid horizontal={false} stroke={C.border} strokeDasharray="0" />
          <XAxis type="number" tick={{ fill: C.faint, fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis type="category" dataKey="name" width={90} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: C.accentSoft }} />
          <Bar dataKey="ftds" radius={[0, 4, 4, 0]} maxBarSize={16}>
            {data.map((entry, i) => (
              <Cell key={entry.name} fill={C.accent} fillOpacity={1 - (i / data.length) * 0.6} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
