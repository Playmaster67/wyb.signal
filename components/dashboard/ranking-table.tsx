"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InfluencerRow {
  rank: number;
  name: string;
  utm_id: string;
  leads: number;
  ftds: number;
  redeposits: number;
  volume_brl: number;
  conv_rate: number;
  status: "active" | "inactive";
}

interface OrganicRow {
  leads: number;
  ftds: number;
  redeposits: number;
  volume_brl: number;
}

interface RankingTableProps {
  influencerRows: InfluencerRow[];
  organic: OrganicRow;
}

const numCell = "tabular-nums text-right";

export function RankingTable({ influencerRows, organic }: RankingTableProps) {
  const hasOrganic = organic.leads > 0 || organic.ftds > 0 || organic.redeposits > 0;
  const isEmpty = influencerRows.length === 0 && !hasOrganic;
  const organicConvRate = organic.leads > 0 ? (organic.ftds / organic.leads) * 100 : 0;

  return (
    <div className="border border-wyb-border rounded-[10px] bg-wyb-surface overflow-hidden shadow-wyb">
      <div className="px-4 py-3 border-b border-wyb-border">
        <p className="text-[11px] font-medium uppercase tracking-wider text-wyb-muted">
          Ranking de influencers
        </p>
      </div>
      {isEmpty ? (
        <div className="py-8 text-center text-[12px] text-wyb-muted">
          Nenhum evento registrado no período selecionado.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[13px]" style={{ fontVariantNumeric: "tabular-nums" }}>
            <thead>
              <tr className="border-b border-wyb-border">
                {["#", "Influencer", "UTM ID", "Leads", "FTDs", "Redep.", "Volume BRL", "Conv. %", "Status"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2 text-[11px] font-medium uppercase tracking-wider text-wyb-muted text-left whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {influencerRows.map((row) => (
                <tr
                  key={row.rank}
                  className="border-b border-wyb-border last:border-0 hover:bg-wyb-surface-2 transition-colors"
                  style={{ height: 37 }}
                >
                  <td className="px-4 text-wyb-muted">{row.rank}</td>
                  <td className="px-4 font-medium text-wyb-text whitespace-nowrap">{row.name}</td>
                  <td className="px-4 text-wyb-muted font-mono text-[12px]">{row.utm_id}</td>
                  <td className={cn("px-4 text-wyb-text", numCell)}>{row.leads.toLocaleString("pt-BR")}</td>
                  <td className={cn("px-4 font-semibold text-wyb-text", numCell)}>{row.ftds}</td>
                  <td className={cn("px-4 text-wyb-text", numCell)}>{row.redeposits}</td>
                  <td className={cn("px-4 text-wyb-text", numCell)}>
                    R$ {row.volume_brl.toLocaleString("pt-BR")}
                  </td>
                  <td
                    className={cn(
                      "px-4 font-medium",
                      numCell,
                      row.conv_rate > 20 ? "text-wyb-pos" : "text-wyb-text"
                    )}
                  >
                    {row.conv_rate.toFixed(1)}%
                  </td>
                  <td className="px-4">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[11px] px-1.5 py-0 h-5 rounded-[4px] border",
                        row.status === "active"
                          ? "border-wyb-pos/30 text-wyb-pos bg-wyb-pos/5"
                          : "border-amber-500/30 text-amber-400 bg-amber-500/5"
                      )}
                    >
                      {row.status === "active" ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                </tr>
              ))}
              {hasOrganic && (
                <tr className="border-b border-wyb-border last:border-0 hover:bg-wyb-surface-2 transition-colors opacity-60" style={{ height: 37 }}>
                  <td className="px-4 text-wyb-muted">{influencerRows.length + 1}</td>
                  <td className="px-4 font-medium whitespace-nowrap">
                    <span className="text-wyb-neutral">Sem atribuição</span>
                  </td>
                  <td className="px-4 text-wyb-muted font-mono text-[12px]">—</td>
                  <td className={cn("px-4 text-wyb-text", numCell)}>{organic.leads.toLocaleString("pt-BR")}</td>
                  <td className={cn("px-4 font-semibold text-wyb-text", numCell)}>{organic.ftds}</td>
                  <td className={cn("px-4 text-wyb-text", numCell)}>{organic.redeposits}</td>
                  <td className={cn("px-4 text-wyb-text", numCell)}>
                    R$ {organic.volume_brl.toLocaleString("pt-BR")}
                  </td>
                  <td className={cn("px-4 font-medium text-wyb-neutral", numCell)}>
                    {organicConvRate.toFixed(1)}%
                  </td>
                  <td className="px-4">
                    <Badge
                      variant="outline"
                      className="text-[11px] px-1.5 py-0 h-5 rounded-[4px] border border-wyb-border text-wyb-neutral bg-transparent"
                    >
                      —
                    </Badge>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
