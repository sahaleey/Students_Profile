// src/app/(dashboards)/layout.tsx
"use client";

import {
  LayoutDashboard,
  LogOut,
  Bell,
  Menu,
  X,
  AlertOctagon,
  FileCheck,
  Trophy,
  Star,
  ClipboardList,
  Users,
  Shield,
  Calendar,
  ClipboardListIcon,
  TrophyIcon,
  FileCheck2,
  LucideTrophy,
  Layers,
  Key,
  LayoutDashboardIcon,
  Info,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { fetchFirebaseToken } from "@/lib/firebase";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  const [authUser, setAuthUser] = useState<{
    role: string | null;
    fullName: string;
    username: string;
  }>({
    role: null,
    fullName: "",
    username: "",
  });

  const [isLoaded, setIsLoaded] = useState(false);
  // 🚀 THE FIX: New state to prevent UI flashes
  const [isAuthorized, setIsAuthorized] = useState(false);

  // 1. Authenticate User
  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");

      if (!userStr) {
        setIsLoaded(true);
        router.push("/login");
        return;
      }

      const user = JSON.parse(userStr);

      setAuthUser({
        role: user.role || null,
        fullName: user.fullName || "",
        username: user.username || "",
      });
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setIsLoaded(true);
    }
  }, [router]);

  // 🚀 THE FIX: The Route Guard Bouncer
  useEffect(() => {
    // Don't check until we know who the user is
    if (!isLoaded) return;

    if (!authUser.role) {
      router.push("/login");
      return;
    }

    const role = authUser.role;
    // Extract the first part of the URL (e.g., "/admin/users" -> "admin")
    const pathSection = pathname.split("/")[1];

    // Pages anyone logged in is allowed to see
    const sharedRoutes = ["change-password", "notifications"];

    if (
      pathSection &&
      pathSection !== "" &&
      !sharedRoutes.includes(pathSection) &&
      pathSection !== role
    ) {
      console.warn(
        `Unauthorized access! Kicking ${role} out of /${pathSection}`,
      );
      // Use replace() so they can't use the back button to try again
      router.replace(`/${role}`);
    } else {
      // Badge matches the room! Open the doors.
      setIsAuthorized(true);
    }
  }, [isLoaded, authUser.role, pathname, router]);

  async function saveDeviceToken() {
    try {
      const token = await fetchFirebaseToken();

      if (!token) {
        console.log("No FCM token received");
        return;
      }

      const authToken = localStorage.getItem("token");
      if (!authToken) return;

      const existingToken = localStorage.getItem("fcm_token");

      if (existingToken === token) {
        console.log("Token already saved, skipping...");
        return;
      }

      await fetch(
        "https://students-profile.onrender.com/users/update-fcm-token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ token }),
        },
      );

      localStorage.setItem("fcm_token", token);
      console.log("Token saved to DB successfully!");
    } catch (err) {
      console.error("Failed to save FCM token:", err);
    }
  }

  const userRole = authUser.role;
  const userDisplayName = authUser.fullName || authUser.username || "User";

  useEffect(() => {
    if (isLoaded && userRole) {
      saveDeviceToken();
    }
  }, [isLoaded, userRole]);

  useEffect(() => {
    if (!isLoaded || !userRole) return;

    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "https://students-profile.onrender.com/notifications",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          const notifs = await res.json();
          const unread = notifs.filter((n: any) => !n.isRead).length;
          setUnreadCount(unread);
        }
      } catch (err) {
        console.error("Failed to fetch notification count");
      }
    };

    fetchUnreadCount();
  }, [isLoaded, userRole, pathname]);

  const getInitials = (name: string) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  type NavItem = {
    href: string;
    label: string;
    icon: LucideIcon;
  };

  let navItems: NavItem[] = [];

  if (isLoaded && userRole) {
    if (userRole === "admin") {
      navItems = [
        { href: "/admin", label: "Admin Center", icon: Shield },
        { href: "/admin/users", label: "Manage Users", icon: Users },
        { href: "/admin/calendar", label: "Calendar", icon: Calendar },
        {
          href: "/admin/reports",
          label: "System Reports",
          icon: ClipboardList,
        },
        { href: "/admin/parents", label: "Link Parents", icon: Users },
      ];
    } else if (userRole === "usthad") {
      navItems = [
        { href: "/usthad", label: "Overview", icon: LayoutDashboard },
        {
          href: "/usthad/punishments",
          label: "Punishments",
          icon: AlertOctagon,
        },
        { href: "/usthad/attachments", label: "Attachments", icon: FileCheck },
        { href: "/usthad/achievements", label: "Achievements", icon: Trophy },
        { href: "/usthad/students", label: "Students Status", icon: Info },
      ];
    } else if (userRole === "student") {
      navItems = [
        { href: "/student", label: "My Portal", icon: LayoutDashboard },
        { href: "/student/tasks", label: "Action Tasks", icon: ClipboardList },
        { href: "/student/works", label: "Achievements", icon: Star },
        {
          href: "/student/archive",
          label: "Program Results",
          icon: LucideTrophy,
        },
      ];
    } else if (userRole === "subwing") {
      navItems = [
        {
          href: "/subwing/programs",
          label: "Programs",
          icon: ClipboardListIcon,
        },
        { href: "/subwing/results", label: "Results", icon: TrophyIcon },
        {
          href: "/subwing/archive",
          label: "Published Results",
          icon: FileCheck2,
        },
      ];
    } else if (userRole === "hisan") {
      navItems = [
        { href: "/hisan", label: "Dashboard", icon: LayoutDashboardIcon },
        { href: "/hisan/results", label: "Global Results", icon: Layers },
        { href: "/hisan/points", label: "Points Directory", icon: Trophy },
        { href: "/hisan/star-students", label: "Star Students", icon: Star },
      ];
    } else if (userRole === "parent") {
      navItems = [{ href: "/parent", label: "My Children", icon: Users }];
    }
  }

  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // 🚀 THE FIX: Render a secure loading screen until the Bouncer says it's okay
  if (!isLoaded || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#004643]">
        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-[#fafafa] via-white to-[#fafafa] flex relative overflow-hidden">
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed top-4 left-4 z-50 md:hidden bg-[#004643] text-white p-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <Menu size={20} />
      </button>

      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={closeSidebar}
        />
      )}

      <aside
        className={`fixed md:relative z-50 w-72 h-screen overflow-y-auto bg-gradient-to-b from-[#004643] to-[#003634] text-white flex flex-col transform transition-all duration-300 ease-out shadow-2xl ${
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full  md:translate-x-0"
        }`}
      >
        <div className="relative p-6 border-b border-white/10">
          <div className="absolute top-4 right-4 md:hidden">
            <button onClick={closeSidebar}>
              <X size={20} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
              {userRole === "admin" ? (
                <Shield size={20} />
              ) : (
                <LayoutDashboard size={20} />
              )}
            </div>
            <div>
              <h1 className="text-xl font-bold">Campus Portal</h1>
              <p className="text-xs text-white/60 capitalize">
                {!isLoaded ? "Loading..." : userRole}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1.5">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${isActive ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10"}`}
              >
                <item.icon size={18} />
                <span className="text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Link
            href="/change-password"
            onClick={closeSidebar}
            className={`mb-2 flex items-center gap-3 px-4 py-3 w-full rounded-xl transition-colors ${
              pathname === "/change-password"
                ? "bg-white/20 text-white"
                : "text-white/70 hover:text-white hover:bg-white/10"
            }`}
          >
            <Key size={18} />
            <span className="text-sm">Change Password</span>
          </Link>

          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/70 border-b border-gray-200/50 flex items-center justify-between px-4 md:px-8 py-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="md:hidden w-10" />
            <div className="hidden md:block">
              <h2 className="text-sm font-medium text-[#004643]/60">
                Welcome,
              </h2>
              <p className="text-lg font-semibold text-[#004643] capitalize">
                {userDisplayName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/notifications"
              className="relative p-2.5 rounded-xl bg-white/80 backdrop-blur-sm text-gray-600 hover:text-[#004643] hover:bg-[#004643]/10 transition-all duration-200 shadow-sm hover:shadow"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white border border-red-600 animate-pulse"></span>
              )}
            </Link>

            <div className="flex items-center gap-3 pl-3 border-l border-gray-200">
              <div className="w-9 h-9 bg-gradient-to-br from-[#004643] to-[#00665e] rounded-xl flex items-center justify-center text-white font-semibold shadow-md">
                {getInitials(userDisplayName)}
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-[#004643] capitalize">
                  {userDisplayName}
                </p>
                <p className="text-xs text-[#004643]/60 capitalize">
                  {userRole}
                </p>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="animate-fadeInUp">{children}</div>
        </div>
      </main>
    </div>
  );
}
