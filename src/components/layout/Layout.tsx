import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Outlet } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";

export function Layout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset className="transition-all duration-200 ease-linear">
        <div className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/40">
          <Header />
        </div>
        <main className="flex-1 p-4 overflow-auto">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
