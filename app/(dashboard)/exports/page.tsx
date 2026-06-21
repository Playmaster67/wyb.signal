import { ExportPanel } from "@/components/exports/export-panel";
import { getExportLogs, getExportInfluencers } from "@/lib/exports/data";

export default async function ExportsPage() {
  const [logs, influencers] = await Promise.all([getExportLogs(), getExportInfluencers()]);

  return (
    <div className="flex flex-col gap-4 p-4">
      <ExportPanel initialLogs={logs} influencers={influencers} />
    </div>
  );
}
