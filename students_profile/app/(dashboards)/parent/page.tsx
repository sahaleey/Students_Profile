"use client";

import { useState, useEffect } from "react";
import {
  Users,
  BellRing,
  ShieldAlert,
  Award,
  ChevronRight,
  Activity,
  BellOff,
} from "lucide-react";
import { fetchFirebaseToken } from "@/lib/firebase";

export default function ParentDashboard() {
  const [childrenData, setChildrenData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationStatus, setNotificationStatus] =
    useState<NotificationPermission>("default");

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    // 1. Fetch children data
    const fetchDashboard = async () => {
      try {
        const res = await fetch(
          "https://students-profile.onrender.com/parent/dashboard",
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setChildrenData(data.children);
        }
      } catch (error) {
        console.error("Failed to fetch parent dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboard();

    // 2. Check current browser notification status
    if ("Notification" in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  // 🚀 OPTION B: FIREBASE WEB PUSH PERMISSION REQUEST
  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/firebase-messaging-sw.js")
        .then((registration) => {
          console.log(
            "Service Worker registered with scope:",
            registration.scope,
          );
        })
        .catch((err) => {
          console.log("Service Worker registration failed:", err);
        });
    }
    try {
      const permission = await Notification.requestPermission();
      setNotificationStatus(permission);

      if (permission === "granted") {
        // 1. Fetch the unique device token from Google
        const fcmToken = await fetchFirebaseToken();

        if (fcmToken) {
          // 2. Send this token to your NestJS Backend!
          // The backend needs to save this string to the Parent's user row in the database
          await fetch(
            "https://students-profile.onrender.com/parent/device-token",
            {
              method: "PATCH",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${getToken()}`,
              },
              body: JSON.stringify({ token: fcmToken }),
            },
          );

          alert("Success! You will now receive live alerts on this device.");
        }
      } else {
        alert(
          "Notifications were denied. You can enable them in your browser settings.",
        );
      }
    } catch (error) {
      console.error("Error requesting permission", error);
    }
  };

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-indigo-600 font-bold animate-pulse">
        Loading Family Data...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Users size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Family Portal</h1>
            <p className="text-gray-500 mt-1 font-medium">
              Monitor your children's campus progress and discipline.
            </p>
          </div>
        </div>
      </div>

      {/* 🚀 NOTIFICATION BANNER */}
      {notificationStatus !== "granted" && (
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden">
          <BellRing
            size={100}
            className="absolute -right-10 -bottom-10 text-white/10"
          />
          <div className="relative z-10 flex items-start gap-4">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0">
              <BellOff size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Never miss an update!</h2>
              <p className="text-blue-100 text-sm mt-1 max-w-lg">
                Enable device notifications to instantly receive pop-up alerts
                if your child receives a disciplinary action or a major academic
                achievement.
              </p>
            </div>
          </div>
          <button
            onClick={requestNotificationPermission}
            className="relative z-10 whitespace-nowrap bg-white text-indigo-600 font-bold px-6 py-3 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all"
          >
            Enable Live Alerts
          </button>
        </div>
      )}

      {/* Children List */}
      <div className="space-y-8">
        {childrenData.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800">
              No Children Linked
            </h3>
            <p className="text-gray-500 mt-2">
              Please contact the campus administrator to link your child to this
              account.
            </p>
          </div>
        ) : (
          childrenData.map((childData, index) => (
            <div
              key={index}
              className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Child Header */}
              <div className="bg-gray-900 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 text-white px-3 py-1 rounded-full mb-2 inline-block">
                    Class {childData.profile.class}
                  </span>
                  <h2 className="text-2xl font-bold text-white capitalize">
                    {childData.profile.fullName}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    Admn Number: {childData.profile.username}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Total Points
                  </p>
                  <p className="text-3xl font-black text-emerald-400">
                    {childData.totalPoints}
                  </p>
                </div>
              </div>

              {/* Status Board */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50">
                {/* Disciplinary Standing */}
                <div
                  className={`p-5 rounded-2xl border ${
                    childData.activePunishments.length > 0
                      ? "bg-red-50 border-red-200 shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]"
                      : "bg-emerald-50 border-emerald-200"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <ShieldAlert
                      size={20}
                      className={
                        childData.activePunishments.length > 0
                          ? "text-red-600"
                          : "text-emerald-600"
                      }
                    />
                    <h3
                      className={`font-bold text-lg ${childData.activePunishments.length > 0 ? "text-red-900" : "text-emerald-900"}`}
                    >
                      Disciplinary Standing
                    </h3>
                  </div>

                  {childData.activePunishments.length === 0 ? (
                    <p className="text-sm font-medium text-emerald-700 flex items-center gap-2">
                      <Activity size={16} /> Clear standing. No active actions.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {childData.activePunishments.map((p: any) => (
                        <div
                          key={p.id}
                          className="bg-white p-3 rounded-xl border border-red-100"
                        >
                          <p className="font-bold text-red-800 text-sm">
                            {p.title}
                          </p>
                          <p className="text-xs text-red-600/70 mt-1 uppercase font-bold tracking-wider">
                            {p.category}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Achievements */}
                <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <Award size={20} className="text-yellow-500" />
                    <h3 className="font-bold text-gray-900 text-lg">
                      Recent Achievements
                    </h3>
                  </div>

                  {childData.recentAchievements.length === 0 ? (
                    <p className="text-sm text-gray-500 italic">
                      No recent achievements recorded.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {childData.recentAchievements.map((ach: any) => (
                        <div
                          key={ach.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100"
                        >
                          <p className="font-bold text-sm text-gray-800 capitalize truncate">
                            {ach.title}
                          </p>
                          <span className="font-black text-emerald-600 shrink-0">
                            +{ach.points}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
