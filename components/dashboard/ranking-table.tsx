"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Row {
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

const rows: Row[] = [
  { rank: 1, name: "thunder_br", utm_id: "a3k9f2", leads: 312, ftds: 89, redeposits: 201, volume_brl: 78400, conv_rate: 28.5, status: "active" },
  { rank: 2, name: "vitinho_fx", utm_id: "b7m2x1", leads: 274, ftds: 74, redeposits: 168, volume_brl: 65200, conv_rate: 27.0, status: "active" },
  { rank: 3, name: "camila.odds", utm_id: "c9p4n8", leads: 198, ftds: 61, redeposits: 140, volume_brl: 53800, conv_rate: 30.8, status: "active" },
  { rank: 4, name: "betmaster_mx", utm_id: "d2q7r3", leads: 185, ftds: 53, redeposits: 122, volume_brl: 46700, conv_rate: 28.6, status: "active" },
  { rank: 5, name: "lukasbet", utm_id: "e5s1t6", leads: 142, ftds: 44, redeposits: 98, volume_brl: 38800, conv_rate: 31.0, status: "active" },
  { rank: 6, name: "analista_cl", utm_id: "f8u3v9", leads: 134, ftds: 38, redeposits: 87, volume_brl: 33500, conv_rate: 28.4, status: "inactive" },
  { rank: 7, name: "rodrigo_vip", utm_id: "g1w6y2", leads: 109, ftds: 29, redeposits: 65, volume_brl: 25600, conv_rate: 26.6, status: "active" },
  { rank: 8, name: "palpiteiro", utm_id: "h4z9a5", leads: 78, ftds: 19, redeposits: 41, volume_brl: 16800, conv_rate: 24.4, status: "active" },
  { rank: 9, name: "Sem atribuição", utm_id: "—", leads: 415, ftds: 5, redeposits: 12, volume_brl: 4400, conv_rate: 1.2, status: "active" },
];

const numCell = "tabular-nums text-right";

export function RankingTable() {
  return (
    <div className="border border-wyb-border rounded-[10px] bg-wyb-surface overflow-hidden shadow-wyb">
      <div className="px-4 py-3 border-b border-wyb-border">
        <p className="text-[11px] font-medium uppercase tracking-wider text-wyb-muted">
          Ranking de influencers
        </p>
      </div>
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
            {rows.map((row) => {
              const isOrganic = row.name === "Sem atribuição";
              return (
                <tr
                  key={row.rank}
                  className={cn(
                    "border-b border-wyb-border last:border-0 hover:bg-wyb-surface-2 transition-colors",
                    isOrganic && "opacity-60"
                  )}
                  style={{ height: 37 }}
                >
                  <td className="px-4 text-wyb-muted">{row.rank}</td>
                  <td className="px-4 font-medium text-wyb-text whitespace-nowrap">
                    {isOrganic ? (
                      <span className="text-wyb-neutral">{row.name}</span>
                    ) : (
                      row.name
                    )}
                  </td>
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
                      row.conv_rate > 20 ? "text-wyb-pos" : row.conv_rate < 5 ? "text-wyb-neutral" : "text-wyb-text"
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
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
