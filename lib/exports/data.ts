import { createClient } from "@/lib/supabase/server";

export interface ExportLogRow {
  id: string;
  exported_at: string;
  filters: { period_days: number; event_type: string; influencer: string; attribution: string };
  row_count: number;
  format: "csv" | "xlsx";
}

export interface ExportInfluencer {
  id: string;
  name: string;
}

export async function getExportLogs(): Promise<ExportLogRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("export_logs")
    .select("id, exported_at, filters, row_count, format")
    .order("exported_at", { ascending: false })
    .limit(20);

  return (data ?? []) as ExportLogRow[];
}

export async function getExportInfluencers(): Promise<ExportInfluencer[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("influencers").select("id, name").order("name");
  return data ?? [];
}
