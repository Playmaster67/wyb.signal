"use server";

import { createClient } from "@/lib/supabase/server";

export async function getExportPreviewAction(
  periodDays: number,
  eventType: "all" | "lead" | "ftd" | "redeposit",
  influencerId: string,
  attribution: "all" | "attributed" | "organic"
) {
  const supabase = await createClient();
  const since = new Date(Date.now() - periodDays * 86_400_000).toISOString();

  let query = supabase
    .from("events")
    .select("id", { count: "exact", head: true })
    .gte("event_ts", since);

  if (eventType !== "all") query = query.eq("event_type", eventType);
  if (influencerId !== "all") query = query.eq("influencer_id", influencerId);
  if (attribution === "attributed") query = query.not("influencer_id", "is", null);
  if (attribution === "organic") query = query.is("influencer_id", null);

  const { count, error } = await query;

  if (error) return { count: 0, error: error.message };
  return { count: count ?? 0, error: null };
}
