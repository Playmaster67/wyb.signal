import { createClient } from "@/lib/supabase/server";
import type { DayRange } from "@/lib/date-range";

interface EventRow {
  event_type: "lead" | "ftd" | "redeposit";
  value_brl: number;
  user_id: string;
  influencer_id: string | null;
  event_ts: string;
}

interface InfluencerRow {
  id: string;
  name: string;
  utm_id: string;
  status: "active" | "inactive";
}

export interface InfluencerBreakdown {
  id: string;
  name: string;
  utm_id: string;
  status: "active" | "inactive";
  leads: number;
  ftds: number;
  redeposits: number;
  volumeBrl: number;
  avgTicket: number;
  retentionRate: number;
  convRate: number;
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
  influencerBreakdown: InfluencerBreakdown[];
}

function sumValue(rows: EventRow[]) {
  return rows.reduce((s, e) => s + e.value_brl, 0);
}

export async function getDashboardData(range: DayRange): Promise<DashboardData> {
  const supabase = await createClient();

  const [eventsResult, influencersResult] = await Promise.all([
    supabase
      .from("events")
      .select("event_type, value_brl, user_id, influencer_id, event_ts")
      .gte("event_ts", `${range.from}T00:00:00.000Z`)
      .lte("event_ts", `${range.to}T23:59:59.999Z`),
    supabase.from("influencers").select("id, name, utm_id, status"),
  ]);

  if (eventsResult.error) {
    console.error("[dashboard] events query error:", eventsResult.error.message);
  }
  if (influencersResult.error) {
    console.error("[dashboard] influencers query error:", influencersResult.error.message);
  }

  const events: EventRow[] = eventsResult.data ?? [];
  const influencers: InfluencerRow[] = influencersResult.data ?? [];

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

  // Quebra por influencer — agrupa todos os eventos atribuídos (influencer_id != null)
  interface Bucket {
    leadUsers: Set<string>;
    ftdEvents: EventRow[];
    ftdUsers: Set<string>;
    redepositEvents: EventRow[];
    redepositUsers: Set<string>;
  }
  const byInfluencer = new Map<string, Bucket>();

  for (const e of events) {
    if (!e.influencer_id) continue;
    let bucket = byInfluencer.get(e.influencer_id);
    if (!bucket) {
      bucket = {
        leadUsers: new Set(),
        ftdEvents: [],
        ftdUsers: new Set(),
        redepositEvents: [],
        redepositUsers: new Set(),
      };
      byInfluencer.set(e.influencer_id, bucket);
    }
    if (e.event_type === "lead") bucket.leadUsers.add(e.user_id);
    if (e.event_type === "ftd") {
      bucket.ftdEvents.push(e);
      bucket.ftdUsers.add(e.user_id);
    }
    if (e.event_type === "redeposit") {
      bucket.redepositEvents.push(e);
      bucket.redepositUsers.add(e.user_id);
    }
  }

  const influencerBreakdown: InfluencerBreakdown[] = influencers
    .map((inf) => {
      const b = byInfluencer.get(inf.id);
      const infLeads      = b?.leadUsers.size ?? 0;
      const infFtds        = b?.ftdEvents.length ?? 0;
      const infRedeposits  = b?.redepositEvents.length ?? 0;
      const ftdVolume      = b ? sumValue(b.ftdEvents) : 0;
      const redepositVolume = b ? sumValue(b.redepositEvents) : 0;
      const ftdUsersCount       = b?.ftdUsers.size ?? 0;
      const redepositUsersCount = b?.redepositUsers.size ?? 0;

      return {
        id:            inf.id,
        name:          inf.name,
        utm_id:        inf.utm_id,
        status:        inf.status,
        leads:         infLeads,
        ftds:          infFtds,
        redeposits:    infRedeposits,
        volumeBrl:     ftdVolume + redepositVolume,
        avgTicket:     infFtds > 0 ? ftdVolume / infFtds : 0,
        retentionRate: ftdUsersCount > 0 ? (redepositUsersCount / ftdUsersCount) * 100 : 0,
        convRate:      infLeads > 0 ? (infFtds / infLeads) * 100 : 0,
      };
    })
    .sort((a, b) => b.ftds - a.ftds);

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
    influencerBreakdown,
  };
}
