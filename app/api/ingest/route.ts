import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/lib/types/database";

// Lazy — instanciado apenas em runtime, não durante o build estático
function getAdmin() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// ─── Schemas de validação ─────────────────────────────────────────────────────

// GTM Server-Side não converte epoch → ISO sem JS extra no container.
// Aceita ISO 8601 ou epoch em segundos/milissegundos (number ou string numérica).
const TimestampField = z.preprocess((val) => {
  if (typeof val === "number") {
    return new Date(val < 1e12 ? val * 1000 : val).toISOString();
  }
  if (typeof val === "string" && /^\d+$/.test(val)) {
    const n = Number(val);
    return new Date(n < 1e12 ? n * 1000 : n).toISOString();
  }
  return val;
}, z.string().datetime({ offset: true }));

const BaseEvent = z.object({
  event_type:        z.enum(["lead", "ftd", "redeposit"]),
  user_id:           z.string().min(1).max(255),
  utm_inf:           z.string().max(32).optional(),
  value_brl:         z.number().nonnegative().finite(),
  value_original:    z.number().nonnegative().finite().optional(),
  currency_original: z.string().length(3).toUpperCase().optional(),
  timestamp:         TimestampField,
});

const EventSchema = z.discriminatedUnion("event_type", [
  BaseEvent.extend({ event_type: z.literal("lead") }),
  BaseEvent.extend({ event_type: z.literal("ftd") }),
  BaseEvent.extend({
    event_type:     z.literal("redeposit"),
    deposit_number: z.number().int().positive(),
  }),
]);

type ParsedEvent = z.infer<typeof EventSchema>;

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  // 1. Autenticar via ingest_secret do cliente
  const secret = req.headers.get("x-webhook-secret");
  if (!secret) {
    return NextResponse.json({ error: "Missing X-Webhook-Secret" }, { status: 401 });
  }

  const { data: client, error: clientError } = await getAdmin()
    .from("clients")
    .select("id")
    .eq("ingest_secret", secret)
    .single();

  if (clientError || !client) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const client_id = client.id;

  // 2. Parse e validação do payload
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = EventSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten().fieldErrors },
      { status: 422 }
    );
  }

  const data: ParsedEvent = parsed.data;

  // 3. Resolver utm_inf → influencer_id (orgânico se não encontrar)
  let influencer_id: string | null = null;

  if (data.utm_inf) {
    const { data: inf } = await getAdmin()
      .from("influencers")
      .select("id")
      .eq("client_id", client_id)
      .eq("utm_id", data.utm_inf)
      .single();

    influencer_id = inf?.id ?? null;
    // Se utm_inf chegou mas não foi encontrado: evento fica sem atribuição
    // (influencer deletado, UTM inválido, etc.)
  }

  // 4. Insert idempotente — duplicatas são silenciosamente ignoradas
  const { error: insertError } = await getAdmin()
    .from("events")
    .upsert(
      {
        client_id,
        event_type:        data.event_type,
        user_id:           data.user_id,
        utm_inf:           data.utm_inf ?? null,
        influencer_id,
        value_brl:         data.value_brl,
        value_original:    data.value_original    ?? null,
        currency_original: data.currency_original ?? null,
        deposit_number:    data.event_type === "redeposit" ? data.deposit_number : null,
        event_ts:          data.timestamp,
      },
      {
        onConflict:       "client_id,user_id,event_type,event_ts",
        ignoreDuplicates: true,
      }
    );

  if (insertError) {
    console.error("[ingest] DB error:", insertError.message);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

// Rejeitar explicitamente outros métodos
export function GET()    { return NextResponse.json({ error: "Method not allowed" }, { status: 405 }); }
export function PUT()    { return NextResponse.json({ error: "Method not allowed" }, { status: 405 }); }
export function DELETE() { return NextResponse.json({ error: "Method not allowed" }, { status: 405 }); }
