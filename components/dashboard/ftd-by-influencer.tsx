"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { C } from "@/lib/chart-colors";

interface FTDByInfluencerProps {
  data: { name: string; ftds: number }[];
}

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

export function FTDByInfluencer({ data }: FTDByInfluencerProps) {
  const sorted = [...data].sort((a, b) => b.ftds - a.ftds);

  return (
    <div className="border border-wyb-border rounded-[10px] bg-wyb-surface p-4 shadow-wyb">
      <p className="text-[11px] font-medium uppercase tracking-wider text-wyb-muted mb-3">
        FTDs por influencer
      </p>
      {sorted.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-center px-6 text-[12px] text-wyb-muted">
          Nenhum FTD atribuído a influencer no período selecionado.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={sorted} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 0 }} barCategoryGap="30%">
            <CartesianGrid horizontal={false} stroke={C.border} strokeDasharray="0" />
            <XAxis type="number" tick={{ fill: C.faint, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis type="category" dataKey="name" width={90} tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: C.accentSoft }} />
            <Bar dataKey="ftds" radius={[0, 4, 4, 0]} maxBarSize={16}>
              {sorted.map((entry, i) => (
                <Cell key={entry.name} fill={C.accent} fillOpacity={1 - (i / sorted.length) * 0.6} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
