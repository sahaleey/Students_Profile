import { LayoutDashboard, LogOut, Bell } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fafafa] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#004643] text-white flex flex-col hidden md:flex">
        <div className="p-6 font-bold text-2xl tracking-wider border-b border-white/10">
          PORTAL
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {/* We will make these links dynamic later based on role */}
          <Link
            href="/usthad"
            className="flex items-center gap-3 p-3 bg-white/10 rounded-xl transition-colors"
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Dashboard</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-white/10">
          <button className="flex items-center gap-3 p-3 text-white/70 hover:text-white transition-colors w-full">
            <LogOut size={20} />
            <Link href="/login" className="font-medium">
              Logout
            </Link>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-end px-6">
          <button className="p-2 relative text-gray-500 hover:text-[#004643]">
            <Bell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
        </header>

        {/* Page Content injected here */}
        <div className="p-6 overflow-y-auto">{children}</div>
      </main>
    </div>
  );
}
