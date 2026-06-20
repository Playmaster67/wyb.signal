import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider defaultOpen>
      <AppSidebar />
      <SidebarInset className="bg-wyb-bg min-h-screen">
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
