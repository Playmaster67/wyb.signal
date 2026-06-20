"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Hash,
  Link2,
  FileDown,
  Signal,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const nav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Influencers", href: "/influencers", icon: Users },
  { label: "UTM", href: "/utm", icon: Hash },
  { label: "Links", href: "/links", icon: Link2 },
  { label: "Exportação", href: "/exports", icon: FileDown },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="px-4 py-3 border-b border-wyb-border">
        <div className="flex items-center gap-2">
          <Signal className="size-4 text-wyb-accent shrink-0" />
          <span className="font-semibold text-[13px] tracking-tight text-wyb-text group-data-[collapsible=icon]:hidden">
            WYB Signal
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {nav.map((item) => {
                const active = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={item.label}
                      className={cn(
                        "text-wyb-muted hover:text-wyb-text hover:bg-wyb-surface-2 rounded-[8px]",
                        active && "text-wyb-accent bg-wyb-accent-soft font-medium"
                      )}
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
