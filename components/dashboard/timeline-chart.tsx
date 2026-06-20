"use client";

import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";
import { C } from "@/lib/chart-colors";

interface TimelineChartProps {
  data: { date: string; leads: number; ftds: number }[];
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-wyb-surface border border-wyb-border rounded-[8px] px-3 py-2 shadow-wyb space-y-1">
      <p className="text-[11px] text-wyb-faint">{label}</p>
      {payload.map((p) => (
        <div key={p.name} className="flex items-center gap-2">
          <span className="size-2 rounded-full shrink-0" style={{ background: p.color }} />
          <span className="text-[11px] text-wyb-muted capitalize">{p.name}</span>
          <span className="text-[13px] font-semibold text-wyb-text ml-auto pl-3" style={{ fontVariantNumeric: "tabular-nums" }}>
            {p.value}
          </span>
        </div>
      ))}
    </div>
  );
}

export function TimelineChart({ data }: TimelineChartProps) {
  return (
    <div className="border border-wyb-border rounded-[10px] bg-wyb-surface p-4 shadow-wyb">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-medium uppercase tracking-wider text-wyb-muted">
          Leads e FTDs — linha temporal
        </p>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-wyb-muted">
            <span className="size-2 rounded-full" style={{ background: C.accent }} />
            Leads
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-wyb-muted">
            <span className="size-2 rounded-full" style={{ background: C.pos }} />
            FTDs
          </span>
        </div>
      </div>
      {data.length === 0 ? (
        <div className="h-[180px] flex items-center justify-center text-[12px] text-wyb-muted">
          Nenhum evento registrado no período selecionado.
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.accent} stopOpacity={0.08} />
                <stop offset="100%" stopColor={C.accent} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="ftdsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={C.pos} stopOpacity={0.08} />
                <stop offset="100%" stopColor={C.pos} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={C.border} strokeDasharray="0" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: C.faint, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: C.faint, fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="leads" stroke={C.accent} strokeWidth={1.5} fill="url(#leadsGrad)" dot={false} activeDot={{ r: 3, fill: C.accent }} />
            <Area type="monotone" dataKey="ftds"  stroke={C.pos}    strokeWidth={1.5} fill="url(#ftdsGrad)"  dot={false} activeDot={{ r: 3, fill: C.pos }}    />
          </AreaChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
