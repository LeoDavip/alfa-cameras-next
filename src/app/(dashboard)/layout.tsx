import { Sidebar } from "@/components/layout/sidebar";
import { MobileHeader } from "@/components/layout/mobile-header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <MobileHeader />
      <main className="flex-1 md:ml-64 pt-14 md:pt-0 p-6">{children}</main>
    </div>
  );
}
