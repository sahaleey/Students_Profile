"use client";

import { LayoutDashboard, LogOut, Bell, User, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const [authUser, setAuthUser] = useState<{
    role: string | null;
    name: string;
  }>({
    role: null,
    name: "",
  });

  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const auth = localStorage.getItem("auth");

      if (!auth) {
        setIsLoaded(true);
        return;
      }

      const user = JSON.parse(auth);

      setAuthUser({
        role: typeof user.role === "string" ? user.role : null,
        name: typeof user.name === "string" ? user.name : "",
      });
    } catch {
      localStorage.removeItem("auth");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const userRole = authUser.role;
  const userName = authUser.name;

  const navItems =
    !isLoaded || userRole === null
      ? []
      : [
          {
            href: userRole === "teacher" ? "/usthad" : "/student",
            label: "Dashboard",
            icon: LayoutDashboard,
          },
          ...(userRole === "teacher"
            ? [
                { href: "/usthad/students", label: "Students", icon: User },
                { href: "/usthad/attendance", label: "Attendance", icon: Bell },
              ]
            : [{ href: "/student/grades", label: "Grades", icon: User }]),
        ];

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafafa] via-white to-[#fafafa] flex relative overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-[#004643] text-white p-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Menu size={20} />
      </button>

      {/* Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-50 w-72 bg-gradient-to-b from-[#004643] to-[#003634] text-white flex flex-col
          transform transition-all duration-300 ease-out shadow-2xl
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="relative p-6 border-b border-white/10">
          <div className="absolute top-4 right-4 md:hidden">
            <button onClick={closeSidebar}>
              <X size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold">Campus Portal</h1>
              <p className="text-xs text-white/60 capitalize">
                {!isLoaded ? "Loading..." : userRole}
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition
                  ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "text-white/70 hover:bg-white/10"
                  }
                `}
              >
                <item.icon size={18} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={() => {
              localStorage.removeItem("auth");
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 px-4 py-3 w-full text-white/70 hover:text-white hover:bg-white/10 rounded-xl"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}

      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-gray-200/50 flex items-center justify-between px-4 md:px-8 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-10" />{" "}
            {/* Spacer for mobile menu button */}
            <div className="hidden md:block">
              <h2 className="text-sm font-medium text-[#004643]/60">
                Welcome back,
              </h2>

              <p className="text-lg font-semibold text-[#004643]">
                {userName || "Loading..."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification Button */}

            <button className="relative p-2.5 rounded-xl bg-white/80 backdrop-blur-sm text-gray-600 hover:text-[#004643] hover:bg-[#004643]/10 transition-all duration-200 shadow-sm hover:shadow">
              <Bell size={18} />

              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white"></span>
            </button>

            {/* User Avatar */}

            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="w-9 h-9 bg-gradient-to-br from-[#004643] to-[#00665e] rounded-xl flex items-center justify-center text-white font-semibold shadow-md">
                {userRole === "teacher" ? "UR" : "S"}
              </div>

              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-[#004643]">
                  {userRole === "teacher" ? "Usthad Rashid" : "Sahaleey"}
                </p>

                <p className="text-xs text-[#004643]/60 capitalize">
                  {userRole}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="animate-fadeInUp">{children}</div>
        </div>
      </main>
    </div>
  );
}
