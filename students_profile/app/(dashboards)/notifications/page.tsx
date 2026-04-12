"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Check,
  Trash2,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const getToken = () => localStorage.getItem("token");

  const fetchNotifications = async () => {
    try {
      const res = await fetch(
        "https://students-profile.onrender.com/notifications",
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (res.ok) {
        setNotifications(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch notifications");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent clicking the row if they just click the checkmark
    try {
      const res = await fetch(
        `https://students-profile.onrender.com/notifications/${id}/read`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (res.ok) {
        setNotifications(
          notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
      }
    } catch (error) {
      console.error("Failed to mark as read");
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch(
        "https://students-profile.onrender.com/notifications/read-all",
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (res.ok) {
        setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
      }
    } catch (error) {
      console.error("Failed to mark all as read");
    }
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      // Optimistically mark as read in UI
      setNotifications(
        notifications.map((n) =>
          n.id === notif.id ? { ...n, isRead: true } : n,
        ),
      );
      // Tell backend in the background
      fetch(
        `https://students-profile.onrender.com/notifications/${notif.id}/read`,
        {
          method: "PATCH",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      ).catch(console.error);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-[#004643] font-bold animate-pulse">
        Loading Notifications...
      </div>
    );
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

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Check size={16} /> Mark all as read
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            Inbox
            {unreadCount > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                {unreadCount} New
              </span>
            )}
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {notifications.length === 0 ? (
            <div className="p-12 text-center text-gray-400">
              <Bell size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium text-lg">You're all caught up!</p>
              <p className="text-sm mt-1">No notifications to display.</p>
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
                  className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${getBgColor(notif.type)}`}
                >
                  {getIcon(notif.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3
                      className={`font-bold text-gray-900 truncate ${!notif.isRead ? "text-lg" : ""}`}
                    >
                      {notif.title}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap pt-1">
                      {new Date(notif.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p
                    className={`text-sm text-gray-600 ${!notif.isRead ? "font-medium text-gray-800" : ""}`}
                  >
                    {notif.message}
                  </p>

                  {notif.link && (
                    <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800">
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
                    <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
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
