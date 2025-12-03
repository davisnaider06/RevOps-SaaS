import { Sidebar } from "@/components/sidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen relative">
      <Sidebar />

      <main className="md:pl-72 bg-slate-50 min-h-screen transition-all duration-300">
        <div className="h-full p-4 md:p-8">
            {children}
        </div>
      </main>
    </div>
  );
}