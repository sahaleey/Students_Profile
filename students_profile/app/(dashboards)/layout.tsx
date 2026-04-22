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
  Sparkles,
  Clock,
  FileText,
  Coins,
  Award,
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
  const [specialHighlight, setSpecialHighlight] = useState<any>(null);

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

    const fetchDashboardGlobals = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch Unread Notifications
        const notifRes = await fetch(
          "https://students-profile.onrender.com/notifications",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (notifRes.ok) {
          let notifs = [];
          try {
            const text = await notifRes.text();
            notifs = text ? JSON.parse(text) : [];
          } catch (e) {
            console.error("Invalid notifications JSON");
          }
          setUnreadCount(notifs.filter((n: any) => !n.isRead).length);
        }

        // 🚀 Fetch Global Special Highlight
        const highlightRes = await fetch(
          "https://students-profile.onrender.com/usthad/special-highlight",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (highlightRes.ok) {
          try {
            const text = await highlightRes.text();
            const data = text ? JSON.parse(text) : null;
            setSpecialHighlight(data);
          } catch (e) {
            console.error("Invalid highlight JSON");
            setSpecialHighlight(null);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchDashboardGlobals();
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
        { href: "/admin/arrivals", label: "Arrival Control", icon: Clock },
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
        { href: "/usthad/class-report", label: "Class Reports", icon: Users },
        { href: "/usthad/arrivals", label: "Leave Arrivals", icon: Clock },
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
    } else if (userRole === "staff") {
      // 🚀 1. Get the department from localStorage
      let userDept = "Staff";
      if (typeof window !== "undefined") {
        try {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            const userObj = JSON.parse(userStr);
            userDept = userObj.department || "Staff";
          }
        } catch (e) {
          console.error("Failed to parse user for department");
        }
      }

      // 🚀 2. Base items for ALL staff
      navItems = [
        {
          href: "/staff",
          label: `${userDept} Dashboard`,
          icon: LayoutDashboard,
        },
        {
          href: "/staff/achievements",
          label: "Record Achievement",
          icon: Award,
        },
      ];

      // 🚀 3. Add specific routes based on their department!
      if (userDept === "Library") {
        navItems.push({
          href: "/staff/fines",
          label: "Library Fines",
          icon: Coins,
        });
      }

      if (userDept === "Outreach" || userDept === "Welfare") {
        navItems.push({
          href: "/staff/programs",
          label: "Manage Programs",
          icon: ClipboardList,
        });
      }
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

        {/* 🌟 THE GLOBAL SPOTLIGHT BANNER 🌟 */}
        {/* We check if it exists, AND we ensure the user is NOT an admin */}
        {specialHighlight && userRole !== "admin" && (
          <div className="mx-4 md:mx-8 mt-6 mb-2 relative group">
            {/* Animated gradient border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse"></div>

            {/* Main card */}
            <div className="relative bg-gradient-to-br from-white/95 to-white/90 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-400/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              {/* Decorative corner accents */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-transparent rounded-bl-2xl"></div>
              <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-amber-500/20 to-transparent rounded-tr-2xl"></div>

              <div className="p-4 md:p-6 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="relative">
                        <Star
                          size={16}
                          className="text-yellow-500 fill-yellow-500 animate-pulse"
                        />
                        <div className="absolute inset-0 bg-yellow-400 blur-md opacity-50 animate-ping"></div>
                      </div>
                      <span className="text-xs font-bold text-amber-600 uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded-full">
                        Campus Spotlight
                      </span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full animate-pulse">
                        Featured
                      </span>
                    </div>

                    <h2 className="text-2xl md:text-3xl font-black bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent capitalize">
                      {specialHighlight.studentName}
                    </h2>

                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      <p className="text-sm md:text-base text-gray-600 font-medium">
                        Recognized for:
                      </p>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#004643]/10 to-[#00665e]/10 rounded-full border border-[#004643]/20">
                        <span className="font-bold text-[#004643] text-sm">
                          Work: {specialHighlight.title}
                        </span>
                      </span>
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full shadow-md">
                        <Trophy size={12} className="text-white" />
                        <span className="text-xs font-black text-white">
                          +{specialHighlight.points} pts
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Right content - Award badge */}
                  <div className="flex items-center gap-3 sm:pl-4 sm:border-l-2 border-gradient-to-b from-yellow-400 to-amber-500">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg transform rotate-3 group-hover:rotate-6 transition-transform duration-300">
                        <Trophy size={24} className="text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white"></div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">
                        Awarded by
                      </p>
                      <p className="text-sm font-bold text-gray-700 capitalize">
                        {specialHighlight.awardedBy}
                      </p>
                      <div className="flex items-center gap-1 justify-end mt-0.5">
                        <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                        <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="animate-fadeInUp">{children}</div>
        </div>
      </main>
    </div>
  );
}
