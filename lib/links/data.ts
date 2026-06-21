import { createClient } from "@/lib/supabase/server";

export interface LinkInfluencer {
  id: string;
  name: string;
  utm_id: string;
  status: "active" | "inactive";
}

export interface LinkRow {
  id: string;
  influencer_id: string;
  influencer_name: string;
  utm_id: string;
  base_url: string;
  full_url: string;
  label: string;
  active: boolean;
  created_at: string;
}

export async function getLinksPageData(): Promise<{ influencers: LinkInfluencer[]; links: LinkRow[] }> {
  const supabase = await createClient();

  const [{ data: influencers }, { data: links }] = await Promise.all([
    supabase.from("influencers").select("id, name, utm_id, status").order("name"),
    supabase
      .from("affiliate_links")
      .select("id, influencer_id, utm_inf, base_url, full_url, label, active, created_at")
      .order("created_at", { ascending: false }),
  ]);

  const nameById = new Map((influencers ?? []).map((i) => [i.id, i.name]));

  return {
    influencers: influencers ?? [],
    links: (links ?? []).map((l) => ({
      id: l.id,
      influencer_id: l.influencer_id,
      influencer_name: nameById.get(l.influencer_id) ?? "—",
      utm_id: l.utm_inf,
      base_url: l.base_url,
      full_url: l.full_url,
      label: l.label ?? "",
      active: l.active,
      created_at: l.created_at.slice(0, 10),
    })),
  };
}
