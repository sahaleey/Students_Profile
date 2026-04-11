"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCircle2, AlertOctagon, Info, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export default function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const getToken = () => localStorage.getItem("token");

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await fetch("http://localhost:3001/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) setNotifications(await res.json());
    } catch (error) {
      console.error("Failed to fetch notifications");
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark single as read
  const handleMarkAsRead = async (notif: Notification) => {
    if (!notif.isRead) {
      try {
        await fetch(`http://localhost:3001/notifications/${notif.id}/read`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${getToken()}` },
        });

        // Optimistic update
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)),
        );
      } catch (error) {
        console.error("Failed to mark as read");
      }
    }

    // Navigate if there is a link
    if (notif.link) {
      setIsOpen(false);
      router.push(notif.link);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      await fetch("http://localhost:3001/notifications/read-all", {
        method: "PATCH",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Failed to mark all as read");
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return <CheckCircle2 size={16} className="text-emerald-500" />;
      case "WARNING":
        return <AlertOctagon size={16} className="text-red-500" />;
      default:
        return <Info size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* BELL ICON BUTTON */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl bg-white/80 backdrop-blur-sm text-gray-600 hover:text-[#004643] hover:bg-[#004643]/10 transition-all duration-200 shadow-sm hover:shadow"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white animate-pulse" />
        )}
      </button>

      {/* DROPDOWN PANEL */}
      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 animate-fadeInUp origin-top-right">
          {/* Header */}
          <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-bold text-gray-800 flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full">
                  {unreadCount} New
                </span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-[#004643] font-medium hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                <Bell size={32} className="mx-auto mb-3 opacity-20" />
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleMarkAsRead(notif)}
                    className={`p-4 flex gap-3 cursor-pointer transition-colors ${notif.isRead ? "bg-white opacity-60" : "bg-blue-50/30 hover:bg-blue-50"}`}
                  >
                    <div className="mt-1 flex-shrink-0">
                      {getIcon(notif.type)}
                    </div>
                    <div>
                      <h4
                        className={`text-sm ${notif.isRead ? "font-medium text-gray-700" : "font-bold text-gray-900"}`}
                      >
                        {notif.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-2">
                        {new Date(notif.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 bg-[#004643] rounded-full self-center ml-auto" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
