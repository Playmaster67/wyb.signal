"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_BASE_URL = "https://dios.bet/";

function genUtmId() {
  return Math.random().toString(36).slice(2, 8);
}

function buildFullUrl(base: string, utmId: string) {
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}utm_inf=${utmId}`;
}

export async function createInfluencerAction(name: string, country: string) {
  const supabase = await createClient();

  const { data: clientId, error: clientError } = await supabase.rpc("get_my_client_id");
  if (clientError || !clientId) {
    return { error: "Não foi possível identificar o seu client." };
  }

  // utm_id é único por client — tenta de novo em caso de colisão rara
  for (let attempt = 0; attempt < 5; attempt++) {
    const utmId = genUtmId();
    const { data: influencer, error } = await supabase
      .from("influencers")
      .insert({
        client_id: clientId,
        name,
        country: country || null,
        utm_id: utmId,
        status: "active",
      })
      .select("id")
      .single();

    if (!error && influencer) {
      // Já cria o link padrão pronto pra uso — evita o operador ter que
      // montar a URL na mão na aba Links.
      const { error: linkError } = await supabase.from("affiliate_links").insert({
        client_id: clientId,
        influencer_id: influencer.id,
        utm_inf: utmId,
        base_url: DEFAULT_BASE_URL,
        full_url: buildFullUrl(DEFAULT_BASE_URL, utmId),
        label: "Link padrão",
        active: true,
      });

      if (linkError) {
        console.error("[influencers] default link insert error:", linkError.message);
      }

      revalidatePath("/influencers");
      revalidatePath("/links");
      return { error: null };
    }
    if (error && error.code !== "23505") {
      return { error: error.message };
    }
  }

  return { error: "Não foi possível gerar um UTM ID único. Tente de novo." };
}

export async function toggleInfluencerStatusAction(id: string, newStatus: "active" | "inactive") {
  const supabase = await createClient();
  const { error } = await supabase.from("influencers").update({ status: newStatus }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/influencers");
  return { error: null };
}
