import { SidebarTrigger }    from "@/components/ui/sidebar";
import { KPIStrip }          from "@/components/dashboard/kpi-strip";
import { OrganicStrip }      from "@/components/dashboard/organic-strip";
import { TimelineChart }     from "@/components/dashboard/timeline-chart";
import { FunnelChart }       from "@/components/dashboard/funnel-chart";
import { FTDByInfluencer }   from "@/components/dashboard/ftd-by-influencer";
import { RankingTable }      from "@/components/dashboard/ranking-table";
import { AvgTicketChart }    from "@/components/dashboard/avg-ticket-chart";
import { RetentionChart }    from "@/components/dashboard/retention-chart";
import { ConversionHeatmap } from "@/components/dashboard/conversion-heatmap";
import { PeriodFilter }      from "@/components/dashboard/period-filter";
import { getDashboardData }  from "@/lib/dashboard/data";

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="flex flex-col min-h-screen bg-wyb-bg">
      {/* Topbar */}
      <header className="flex items-center justify-between px-4 h-12 border-b border-wyb-border bg-wyb-surface shrink-0 shadow-wyb">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-wyb-muted hover:text-wyb-text" />
          <span className="text-[13px] font-medium text-wyb-text">Dashboard</span>
        </div>
        <PeriodFilter />
      </header>

      <main className="flex-1 p-4 space-y-4">
        {/* KPIs globais — todos os eventos, atribuídos ou não */}
        <KPIStrip
          leads={data.leadsCount}
          ftds={data.ftdsCount}
          redeposits={data.redepositsCount}
          volumeBrl={data.volumeBrl}
          leadToFtdRate={data.leadToFtdRate}
        />

        {/* Tráfego direto — eventos sem utm_inf */}
        <OrganicStrip
          leads={data.organic.leadsCount}
          ftds={data.organic.ftdsCount}
          ftdVolumeBrl={data.organic.ftdVolumeBrl}
          redeposits={data.organic.redepositsCount}
          redepositVolumeBrl={data.organic.redepositVolumeBrl}
        />

        {/* Linha temporal + funil */}
        <div className="grid grid-cols-[1fr_300px] gap-4">
          <TimelineChart data={data.timeline} />
          <FunnelChart
            leadUsers={data.uniqueLeadUsers}
            ftdUsers={data.uniqueFtdUsers}
            redepositUsers={data.uniqueRedepositUsers}
          />
        </div>

        {/* Ticket médio + Retenção — dependem de atribuição a influencer */}
        <div className="grid grid-cols-2 gap-4">
          <AvgTicketChart data={[]} />
          <RetentionChart data={[]} />
        </div>

        {/* Heatmap + FTDs por influencer */}
        <div className="grid grid-cols-[1fr_280px] gap-4">
          <ConversionHeatmap grid={data.heatmap} />
          <FTDByInfluencer data={[]} />
        </div>

        {/* Ranking — linhas de influencer vazias até existir atribuição real */}
        <RankingTable
          influencerRows={[]}
          organic={{
            leads: data.organic.leadsCount,
            ftds: data.organic.ftdsCount,
            redeposits: data.organic.redepositsCount,
            volume_brl: data.organic.ftdVolumeBrl + data.organic.redepositVolumeBrl,
          }}
        />
      </main>
    </div>
  );
}
