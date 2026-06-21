import { createClient } from "@/lib/supabase/server";
import type { DayRange } from "@/lib/date-range";

interface EventRow {
  event_type: "lead" | "ftd" | "redeposit";
  value_brl: number;
  user_id: string;
  influencer_id: string | null;
  event_ts: string;
}

export interface DashboardData {
  leadsCount: number;
  ftdsCount: number;
  redepositsCount: number;
  volumeBrl: number;
  leadToFtdRate: number;
  uniqueLeadUsers: number;
  uniqueFtdUsers: number;
  uniqueRedepositUsers: number;
  organic: {
    leadsCount: number;
    ftdsCount: number;
    ftdVolumeBrl: number;
    redepositsCount: number;
    redepositVolumeBrl: number;
  };
  timeline: { date: string; leads: number; ftds: number }[];
  heatmap: number[][];
}

function sumValue(rows: EventRow[]) {
  return rows.reduce((s, e) => s + e.value_brl, 0);
}

export async function getDashboardData(range: DayRange): Promise<DashboardData> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .select("event_type, value_brl, user_id, influencer_id, event_ts")
    .gte("event_ts", `${range.from}T00:00:00.000Z`)
    .lte("event_ts", `${range.to}T23:59:59.999Z`);

  if (error) {
    console.error("[dashboard] query error:", error.message);
  }
  const events: EventRow[] = data ?? [];

  const leads       = events.filter((e) => e.event_type === "lead");
  const ftds         = events.filter((e) => e.event_type === "ftd");
  const redeposits   = events.filter((e) => e.event_type === "redeposit");

  const organicLeads      = leads.filter((e) => e.influencer_id === null);
  const organicFtds        = ftds.filter((e) => e.influencer_id === null);
  const organicRedeposits  = redeposits.filter((e) => e.influencer_id === null);

  // Linha temporal — leads/ftds por dia (event_ts, não received_at)
  const byDate = new Map<string, { leads: number; ftds: number }>();
  for (const e of events) {
    if (e.event_type !== "lead" && e.event_type !== "ftd") continue;
    const date = e.event_ts.slice(0, 10);
    const entry = byDate.get(date) ?? { leads: 0, ftds: 0 };
    if (e.event_type === "lead") entry.leads++;
    else entry.ftds++;
    byDate.set(date, entry);
  }
  const timeline = [...byDate.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, v]) => ({ date: `${date.slice(8, 10)}/${date.slice(5, 7)}`, ...v }));

  // Heatmap — FTDs por dia da semana × bloco de 3h
  const heatmap = Array.from({ length: 7 }, () => Array(8).fill(0));
  for (const e of ftds) {
    const d = new Date(e.event_ts);
    heatmap[d.getUTCDay()][Math.floor(d.getUTCHours() / 3)]++;
  }

  return {
    leadsCount: leads.length,
    ftdsCount: ftds.length,
    redepositsCount: redeposits.length,
    volumeBrl: sumValue(ftds) + sumValue(redeposits),
    leadToFtdRate: leads.length > 0 ? (ftds.length / leads.length) * 100 : 0,
    uniqueLeadUsers: new Set(leads.map((e) => e.user_id)).size,
    uniqueFtdUsers: new Set(ftds.map((e) => e.user_id)).size,
    uniqueRedepositUsers: new Set(redeposits.map((e) => e.user_id)).size,
    organic: {
      leadsCount: organicLeads.length,
      ftdsCount: organicFtds.length,
      ftdVolumeBrl: sumValue(organicFtds),
      redepositsCount: organicRedeposits.length,
      redepositVolumeBrl: sumValue(organicRedeposits),
    },
    timeline,
    heatmap,
  };
}
