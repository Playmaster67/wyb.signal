"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function genUtmId() {
  return Math.random().toString(36).slice(2, 8);
}

export async function createInfluencerAction(name: string, country: string) {
  const supabase = await createClient();

  const { data: clientId, error: clientError } = await supabase.rpc("get_my_client_id");
  if (clientError || !clientId) {
    return { error: "Não foi possível identificar o seu client." };
  }

  // utm_id é único por client — tenta de novo em caso de colisão rara
  for (let attempt = 0; attempt < 5; attempt++) {
    const { error } = await supabase.from("influencers").insert({
      client_id: clientId,
      name,
      country: country || null,
      utm_id: genUtmId(),
      status: "active",
    });

    if (!error) {
      revalidatePath("/influencers");
      return { error: null };
    }
    if (error.code !== "23505") {
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
