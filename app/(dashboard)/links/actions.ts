"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createLinkAction(influencerId: string, baseUrl: string, label: string) {
  const supabase = await createClient();

  const { data: clientId, error: clientError } = await supabase.rpc("get_my_client_id");
  if (clientError || !clientId) {
    return { error: "Não foi possível identificar o seu client." };
  }

  const { data: influencer, error: infError } = await supabase
    .from("influencers")
    .select("utm_id")
    .eq("id", influencerId)
    .single();

  if (infError || !influencer) {
    return { error: "Influencer não encontrado." };
  }

  const sep = baseUrl.includes("?") ? "&" : "?";
  const fullUrl = `${baseUrl}${sep}utm_inf=${influencer.utm_id}`;

  const { error } = await supabase.from("affiliate_links").insert({
    client_id: clientId,
    influencer_id: influencerId,
    utm_inf: influencer.utm_id,
    base_url: baseUrl,
    full_url: fullUrl,
    label: label || null,
    active: true,
  });

  if (error) return { error: error.message };

  revalidatePath("/links");
  return { error: null };
}

export async function toggleLinkActiveAction(id: string, active: boolean) {
  const supabase = await createClient();
  const { error } = await supabase.from("affiliate_links").update({ active }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/links");
  return { error: null };
}
