import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { createClient } from "@/lib/supabase/server";

const MAX_ROWS = 50_000;

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const EVENT_TYPES = ["lead", "ftd", "redeposit"] as const;
  type EventTypeFilter = (typeof EVENT_TYPES)[number] | "all";

  const periodDays   = Number(searchParams.get("period") ?? "30");
  const eventTypeRaw = searchParams.get("event_type") ?? "all";
  const eventType: EventTypeFilter = EVENT_TYPES.includes(eventTypeRaw as (typeof EVENT_TYPES)[number])
    ? (eventTypeRaw as (typeof EVENT_TYPES)[number])
    : "all";
  const influencerId = searchParams.get("influencer_id") ?? "all";
  const attribution   = searchParams.get("attribution") ?? "all";
  const format        = searchParams.get("format") === "xlsx" ? "xlsx" : "csv";

  const since = new Date(Date.now() - periodDays * 86_400_000).toISOString();

  let query = supabase
    .from("events")
    .select("id, event_type, user_id, utm_inf, influencer_id, value_brl, deposit_number, event_ts")
    .gte("event_ts", since)
    .order("event_ts", { ascending: false })
    .limit(MAX_ROWS);

  if (eventType !== "all") query = query.eq("event_type", eventType);
  if (influencerId !== "all") query = query.eq("influencer_id", influencerId);
  if (attribution === "attributed") query = query.not("influencer_id", "is", null);
  if (attribution === "organic") query = query.is("influencer_id", null);

  const { data: events, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = events ?? [];

  let influencerName = "Todos os influencers";
  if (influencerId !== "all") {
    const { data: inf } = await supabase.from("influencers").select("name").eq("id", influencerId).single();
    influencerName = inf?.name ?? "—";
  }

  const { data: clientId } = await supabase.rpc("get_my_client_id");
  if (clientId) {
    await supabase.from("export_logs").insert({
      client_id: clientId,
      filters:   { period_days: periodDays, event_type: eventType, influencer: influencerName, attribution },
      row_count: rows.length,
      format,
    });
  }

  const exportRows = rows.map((e) => ({
    event_id:       e.id,
    event_type:     e.event_type,
    user_id:        e.user_id,
    utm_inf:        e.utm_inf ?? "",
    value_brl:      e.value_brl,
    deposit_number: e.deposit_number ?? "",
    event_ts:       e.event_ts,
  }));

  const datePart = new Date().toISOString().split("T")[0];

  if (format === "csv") {
    const header = ["event_id", "event_type", "user_id", "utm_inf", "value_brl", "deposit_number", "event_ts"].join(",");
    const csv = [header, ...exportRows.map((r) => Object.values(r).join(","))].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="wyb_export_${datePart}.csv"`,
      },
    });
  }

  const worksheet = XLSX.utils.json_to_sheet(exportRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Eventos");
  const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="wyb_export_${datePart}.xlsx"`,
    },
  });
}
