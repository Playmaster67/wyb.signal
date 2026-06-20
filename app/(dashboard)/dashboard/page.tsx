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

export default function DashboardPage() {
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
        {/* KPIs de influencers */}
        <KPIStrip />

        {/* Tráfego direto — eventos sem utm_inf */}
        <OrganicStrip />

        {/* Linha temporal + funil */}
        <div className="grid grid-cols-[1fr_300px] gap-4">
          <TimelineChart />
          <FunnelChart />
        </div>

        {/* Ticket médio + Retenção */}
        <div className="grid grid-cols-2 gap-4">
          <AvgTicketChart />
          <RetentionChart />
        </div>

        {/* Heatmap + FTDs por influencer */}
        <div className="grid grid-cols-[1fr_280px] gap-4">
          <ConversionHeatmap />
          <FTDByInfluencer />
        </div>

        {/* Ranking */}
        <RankingTable />
      </main>
    </div>
  );
}
