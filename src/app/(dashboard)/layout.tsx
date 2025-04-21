import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/ui/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 p-6 pt-4 container mx-auto max-w-7xl">
          {children}
        </main>
      </div>
    </div>
  );
}
