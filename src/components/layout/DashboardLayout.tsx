import { Outlet } from "react-router-dom";
import Header from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/StarSidebar";

export default function DashboardLayout() {
  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
