// src/components/layout/Layout.tsx
import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";

export function Layout() {
  return (
    <SidebarProvider defaultOpen={true}>
      <AppSidebar />
      <SidebarInset>
        {/* Header floats above content */}
        <Header />
        {/* Main content with top padding to account for floating header */}
        <main className="flex-1 overflow-auto p-4 pt-20 transition-all duration-200 ease-linear">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
