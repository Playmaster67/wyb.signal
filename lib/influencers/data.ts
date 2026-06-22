import { createClient } from "@/lib/supabase/server";
import type { Influencer } from "@/components/influencers/influencer-list";

export async function getInfluencers(): Promise<Influencer[]> {
  const supabase = await createClient();

  const [{ data: influencers }, { data: links }, { data: events }] = await Promise.all([
    supabase
      .from("influencers")
      .select("id, name, country, utm_id, status, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("affiliate_links").select("influencer_id"),
    supabase.from("events").select("event_type, influencer_id"),
  ]);

  const linksCount = new Map<string, number>();
  for (const l of links ?? []) {
    if (!l.influencer_id) continue;
    linksCount.set(l.influencer_id, (linksCount.get(l.influencer_id) ?? 0) + 1);
  }

  const leadCount       = new Map<string, number>();
  const ftdCount         = new Map<string, number>();
  const redepositCount   = new Map<string, number>();
  for (const e of events ?? []) {
    if (!e.influencer_id) continue;
    const target =
      e.event_type === "lead" ? leadCount :
      e.event_type === "ftd" ? ftdCount :
      redepositCount;
    target.set(e.influencer_id, (target.get(e.influencer_id) ?? 0) + 1);
  }

  return (influencers ?? []).map((inf) => ({
    id: inf.id,
    name: inf.name,
    country: inf.country ?? "",
    utm_id: inf.utm_id,
    status: inf.status,
    links_count: linksCount.get(inf.id) ?? 0,
    total_leads: leadCount.get(inf.id) ?? 0,
    total_ftds: ftdCount.get(inf.id) ?? 0,
    total_redeposits: redepositCount.get(inf.id) ?? 0,
    created_at: inf.created_at.slice(0, 10),
  }));
}
