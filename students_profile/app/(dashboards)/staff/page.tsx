"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  Users,
  HeartHandshake,
  Coins,
  Clock,
  Award,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function StaffDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/staff/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setData(await res.json());
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-8 h-8 border-4 border-[#004643] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!data)
    return (
      <div className="text-center mt-20 text-red-500 font-bold">
        Error loading unified dashboard.
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeInUp">
      {/* 🌟 UNIFIED MASTER HEADER */}
      <div className="p-8 rounded-3xl border border-[#004643]/20 bg-gradient-to-br from-[#004643]/5 to-[#00665e]/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#004643] to-[#00665e] flex items-center justify-center text-white shadow-lg">
            <Sparkles size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-[#004643]">
              Central Staff Portal
            </h1>
            <p className="text-gray-600 font-medium mt-1">
              Manage Library, Outreach, and Welfare departments from one place.
            </p>
          </div>
        </div>
      </div>

      {/* 🗂️ THE 3 DEPARTMENT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 1. Library Card */}
        <div className="bg-white rounded-3xl p-6 border border-amber-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center mb-4">
            <BookOpen size={24} />
          </div>
          <h2 className="text-xl font-bold text-amber-900 mb-2">Library</h2>
          <p className="text-sm text-gray-500 mb-6 min-h-[40px]">
            Manage books, reading programs, and track library discipline.
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href="/staff/achievements?dept=Library"
              className="w-full flex items-center justify-between px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium text-sm"
            >
              Record Achievement <ArrowRight size={16} />
            </Link>
            <Link
              href="/staff/fines"
              className="w-full flex items-center justify-between px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm"
            >
              Issue Library Fine <Coins size={16} />
            </Link>
          </div>
        </div>

        {/* 2. Outreach Card */}
        <div className="bg-white rounded-3xl p-6 border border-blue-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-4">
            <Users size={24} />
          </div>
          <h2 className="text-xl font-bold text-blue-900 mb-2">Outreach</h2>
          <p className="text-sm text-gray-500 mb-6 min-h-[40px]">
            Log student publications and public communication activities.
          </p>
          <div className="flex flex-col gap-2 mt-auto">
            <Link
              href="/staff/achievements?dept=Outreach"
              className="w-full flex items-center justify-between px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors font-medium text-sm"
            >
              Record Achievement <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* 3. Welfare Card */}
        <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mb-4">
            <HeartHandshake size={24} />
          </div>
          <h2 className="text-xl font-bold text-rose-900 mb-2">Welfare</h2>
          <p className="text-sm text-gray-500 mb-6 min-h-[40px]">
            Track social work, volunteering, and student support initiatives.
          </p>
          <div className="flex flex-col gap-2 mt-auto">
            <Link
              href="/staff/achievements?dept=Welfare"
              className="w-full flex items-center justify-between px-4 py-2 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 transition-colors font-medium text-sm"
            >
              Record Achievement <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* 📊 OVERALL STATS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-emerald-100 text-emerald-600 rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">
              Total Achievements Logged
            </p>
            <p className="text-2xl font-black text-gray-900">
              {data.stats?.totalAchievements || 0}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-[#004643]/10 text-[#004643] rounded-xl">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">
              Total Points Distributed
            </p>
            <p className="text-2xl font-black text-gray-900">
              {data.stats?.totalPointsGiven || 0}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div className="p-4 bg-amber-100 text-amber-600 rounded-xl">
            <Coins size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase">
              Total Fines Issued
            </p>
            <p className="text-2xl font-black text-gray-900">
              {data.stats?.totalFinesIssued || 0}
            </p>
          </div>
        </div>
      </div>

      {/* 🕒 GLOBAL RECENT ACTIVITY */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 p-5 border-b border-gray-100 flex items-center gap-2">
          <Clock size={20} className="text-gray-500" />
          <h2 className="font-bold text-lg text-gray-800">
            Combined Recent Activity
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {!data.recentActivities || data.recentActivities.length === 0 ? (
            <p className="p-8 text-center text-gray-500">
              No recent activity recorded yet.
            </p>
          ) : (
            data.recentActivities.map((act: any) => (
              <div
                key={act.id}
                className="p-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${act.type === "Achievement" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"}`}
                  >
                    {act.type === "Achievement" ? (
                      <Award size={20} />
                    ) : (
                      <Coins size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{act.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Student:{" "}
                      <span className="font-bold text-gray-700 capitalize">
                        {act.studentName}
                      </span>
                      {act.department && ` • Dept: ${act.department}`}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {act.type === "Achievement" ? (
                    <span className="font-black text-emerald-600">
                      +{act.points} pts
                    </span>
                  ) : (
                    <span className="font-black text-amber-600 text-xs bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                      FINE
                    </span>
                  )}
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mt-1">
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
