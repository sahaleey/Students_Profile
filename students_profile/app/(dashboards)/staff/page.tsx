"use client";

import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Award,
  Users,
  BookOpen,
  HeartHandshake,
  Coins,
  Clock,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function StaffDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "https://students-profile.onrender.com/staff/dashboard",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) setData(await res.json());
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading)
    return (
      <div className="text-center mt-20 animate-pulse font-bold text-indigo-600">
        Loading Portal...
      </div>
    );
  if (!data)
    return (
      <div className="text-center mt-20 text-red-500">
        Error loading dashboard.
      </div>
    );

  const isLibrary = data.department === "Library";
  const isOutreach = data.department === "Outreach";
  const isWelfare = data.department === "Welfare";

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeInUp">
      {/* Dynamic Header */}
      <div
        className={`p-8 rounded-3xl border shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 ${
          isLibrary
            ? "bg-amber-50 border-amber-200"
            : isOutreach
              ? "bg-blue-50 border-blue-200"
              : "bg-rose-50 border-rose-200"
        }`}
      >
        <div className="flex items-center gap-5">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md ${
              isLibrary
                ? "bg-amber-500"
                : isOutreach
                  ? "bg-blue-600"
                  : "bg-rose-500"
            }`}
          >
            {isLibrary ? (
              <BookOpen size={32} />
            ) : isOutreach ? (
              <Users size={32} />
            ) : (
              <HeartHandshake size={32} />
            )}
          </div>
          <div>
            <h1
              className={`text-3xl font-black ${isLibrary ? "text-amber-900" : isOutreach ? "text-blue-900" : "text-rose-900"}`}
            >
              {data.department} Department
            </h1>
            <p className="text-gray-600 font-medium mt-1">
              {isLibrary
                ? "Manage books, library programs, and issue fines."
                : "Log student publications, outreach activities, and welfare achievements."}
            </p>
          </div>
        </div>
        <Link
          href="/staff/achievements"
          className={`px-6 py-3 rounded-xl font-bold text-white shadow-md transition-transform hover:scale-105 ${
            isLibrary
              ? "bg-amber-600 hover:bg-amber-700"
              : isOutreach
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-rose-600 hover:bg-rose-700"
          }`}
        >
          + Record Achievement
        </Link>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">
              Achievements Logged
            </p>
            <p className="text-2xl font-black text-gray-900">
              {data.stats.totalAchievements}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
          <div className="p-4 bg-indigo-100 text-indigo-600 rounded-xl">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase">
              Total Points Given
            </p>
            <p className="text-2xl font-black text-gray-900">
              {data.stats.totalPointsGiven}
            </p>
          </div>
        </div>
        {isLibrary && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="p-4 bg-amber-100 text-amber-600 rounded-xl">
              <Coins size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-500 uppercase">
                Fines Issued
              </p>
              <p className="text-2xl font-black text-gray-900">
                {data.stats.totalFinesIssued}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 p-5 border-b border-gray-200 flex items-center gap-2">
          <Clock size={20} className="text-gray-500" />
          <h2 className="font-bold text-lg text-gray-800">
            Recent Department Activity
          </h2>
        </div>
        <div className="divide-y divide-gray-100">
          {data.recentActivities.length === 0 ? (
            <p className="p-8 text-center text-gray-500">
              No recent activity recorded by you.
            </p>
          ) : (
            data.recentActivities.map((act: any) => (
              <div
                key={act.id}
                className="p-5 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2.5 rounded-xl ${act.type === "Achievement" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}
                  >
                    {act.type === "Achievement" ? (
                      <Award size={20} />
                    ) : (
                      <Coins size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{act.title}</h3>
                    <p className="text-sm text-gray-500">
                      Awarded to:{" "}
                      <span className="font-bold text-gray-700 capitalize">
                        {act.studentName}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {act.type === "Achievement" ? (
                    <span className="font-black text-emerald-600 text-lg">
                      +{act.points} pts
                    </span>
                  ) : (
                    <span className="font-black text-amber-600 text-sm bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                      FINE
                    </span>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(act.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
