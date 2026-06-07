"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Check,
  ArrowRight,
  RefreshCw, // 🚀 Added refresh icon
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SkeletonCard from "@/components/shared/SkeletonCard";

interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "WARNING" | "SUCCESS" | "ERROR";
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // 🚀 Added refreshing state
  const router = useRouter();

  // 🚀 Best Practice: Support Vercel deployments!
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const getToken = () => localStorage.getItem("token");

  const fetchNotifications = async (showToast = false) => {
    if (showToast) setIsRefreshing(true);
    try {
      const token = getToken();
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_URL}/notifications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (res.ok) {
        setNotifications(await res.json());
        if (showToast) toast.success("Inbox refreshed!");
      } else {
        throw new Error("Failed to fetch");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load notifications.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setNotifications(
        notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      );

      const res = await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) throw new Error("Failed");
    } catch (error) {
      console.error(error);
      fetchNotifications();
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      toast.success("All caught up!");

      const res = await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (!res.ok) throw new Error("Failed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to mark all as read.");
      fetchNotifications();
    }
  };

  const handleNotificationClick = async (notif: NotificationRecord) => {
    if (!notif.isRead) {
      setNotifications(
        notifications.map((n) =>
          n.id === notif.id ? { ...n, isRead: true } : n,
        ),
      );
      fetch(`${API_URL}/notifications/${notif.id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      }).catch(console.error);
    }

    if (notif.link) {
      router.push(notif.link);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "WARNING":
        return <AlertTriangle size={20} className="text-orange-500" />;
      case "SUCCESS":
        return <CheckCircle2 size={20} className="text-emerald-500" />;
      case "ERROR":
        return <AlertTriangle size={20} className="text-red-500" />;
      default:
        return <Info size={20} className="text-blue-500" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "WARNING":
        return "bg-orange-50";
      case "SUCCESS":
        return "bg-emerald-50";
      case "ERROR":
        return "bg-red-50";
      default:
        return "bg-blue-50";
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const SkeletonRow = () => {
    return (
      <div className="p-5 flex items-start gap-4 animate-pulse bg-white border-b border-gray-100">
        {/* Icon Circle */}
        <div className="shrink-0 w-10 h-10 rounded-full bg-gray-200"></div>

        {/* Text Content */}
        <div className="flex-1 space-y-3 py-1">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>

        {/* Right Action Button */}
        <div className="shrink-0 w-8 h-8 rounded-full bg-gray-200"></div>
      </div>
    );
  };
  if (isLoading) {
    return <>{SkeletonRow()}</>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#004643] to-[#00665e] rounded-2xl flex items-center justify-center shadow-lg">
            <Bell size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-500 mt-1 font-medium">
              Stay updated with your campus activities.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* 🚀 NEW: Manual Refresh Button */}
          <button
            onClick={() => fetchNotifications(true)}
            disabled={isRefreshing}
            className="p-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
            title="Refresh Inbox"
          >
            <RefreshCw
              size={18}
              className={isRefreshing ? "animate-spin" : ""}
            />
          </button>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
            >
              <Check size={16} /> Mark all read
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            Inbox
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm animate-in zoom-in">
                {unreadCount} New
              </span>
            )}
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {isLoading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Bell size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium text-lg text-gray-600">
                You're all caught up!
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-5 flex items-start gap-4 transition-all duration-200 cursor-pointer ${
                  notif.isRead
                    ? "bg-white hover:bg-gray-50 opacity-70"
                    : "bg-blue-50/30 hover:bg-blue-50/50"
                }`}
              >
                {/* Icon */}
                <div
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getBgColor(
                    notif.type,
                  )}`}
                >
                  {getIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3
                      className={`font-bold text-gray-900 truncate ${
                        !notif.isRead ? "text-lg" : ""
                      }`}
                    >
                      {notif.title}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap pt-1">
                      {new Date(notif.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p
                    className={`text-sm text-gray-600 ${
                      !notif.isRead ? "font-medium text-gray-800" : ""
                    }`}
                  >
                    {notif.message}
                  </p>

                  {notif.link && (
                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                      View Details <ArrowRight size={12} />
                    </div>
                  )}
                </div>

                {/* Actions */}
                {!notif.isRead && (
                  <button
                    onClick={(e) => handleMarkAsRead(notif.id, e)}
                    className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-100 transition-colors"
                    title="Mark as read"
                  >
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full shadow-sm" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
