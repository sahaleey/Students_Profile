"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Users,
  ShieldAlert,
  Trophy,
  GraduationCap,
  ArrowLeft,
  Medal,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";

export default function SystemReportPage() {
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const res = await fetch(
          "https://students-profile.onrender.com/admin/report",
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          },
        );
        if (res.ok) setReport(await res.json());
      } catch (err) {
        console.error("Failed to load report");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-indigo-600 font-bold animate-pulse">
        Loading Analytics...
      </div>
    );
  if (!report)
    return (
      <div className="text-center text-red-500 mt-10">Failed to load data.</div>
    );

  // Helper function to render a leaderboard row beautifully
  const renderLeaderboardRow = (
    student: any,
    idx: number,
    isMonthly: boolean,
  ) => (
    <div
      key={idx}
      className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors group"
    >
      <div className="flex items-center gap-6">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl shadow-sm transition-transform group-hover:scale-110 ${
            idx === 0
              ? "bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700 ring-2 ring-yellow-400"
              : idx === 1
                ? "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-700 ring-2 ring-gray-300"
                : idx === 2
                  ? "bg-gradient-to-br from-orange-50 to-orange-100 text-orange-800 ring-2 ring-orange-300"
                  : isMonthly
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-indigo-50 text-indigo-700"
          }`}
        >
          #{idx + 1}
        </div>
        <div>
          <h3 className="font-bold text-xl text-gray-900 capitalize group-hover:text-indigo-600 transition-colors">
            {student.name}
          </h3>
          <p className="text-sm text-gray-500 font-medium">
            Class: {student.class}
          </p>
        </div>
      </div>
      <div className="text-right">
        <span
          className={`font-black text-3xl text-transparent bg-clip-text bg-gradient-to-br ${isMonthly ? "from-emerald-500 to-teal-700" : "from-indigo-600 to-purple-600"}`}
        >
          {isMonthly ? student.currentMonthPoints : student.points}
        </span>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
          {isMonthly ? "Monthly Points" : "Total Points"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 shadow-sm hover:shadow-md"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <BarChart3 size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">System Report</h1>
          <p className="text-gray-500 mt-1 font-medium">
            Campus-wide analytics and performance leaderboards.
          </p>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
            <GraduationCap size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Active Students
            </p>
            <p className="text-3xl font-black text-gray-900">
              {report.studentsCount}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
            <Users size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Active Usthads
            </p>
            <p className="text-3xl font-black text-gray-900">
              {report.usthadsCount}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-emerald-50 text-emerald-600 rounded-xl">
            <Trophy size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Total Points Given
            </p>
            <p className="text-3xl font-black text-gray-900">
              {report.totalPointsAwarded}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-5 hover:shadow-md transition-shadow">
          <div className="p-4 bg-red-50 text-red-600 rounded-xl">
            <ShieldAlert size={28} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
              Active Actions
            </p>
            <p className="text-3xl font-black text-gray-900">
              {report.activePunishments}
            </p>
          </div>
        </div>
      </div>

      {/* 🚀 LEADERBOARD 1: TOP 10 OF THE MONTH */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden transform transition-all hover:shadow-lg">
        <div className="bg-gradient-to-r from-emerald-600 to-teal-800 p-6 text-white flex justify-between items-center">
          <h2 className="font-bold text-2xl flex items-center gap-3">
            <CalendarDays size={28} className="text-emerald-200" /> Top 10
            Students of the Month
          </h2>
          <span className="bg-white/20 px-4 py-1.5 rounded-full text-sm font-bold backdrop-blur-sm">
            {report.activeMonthName || "Current Month"}
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {!report.topStudentsMonth || report.topStudentsMonth.length === 0 ? (
            <p className="p-12 text-center text-gray-500 font-medium text-lg">
              No points awarded this month yet.
            </p>
          ) : (
            report.topStudentsMonth
              .slice(0, 10)
              .map((student: any, idx: number) =>
                renderLeaderboardRow(student, idx, true),
              )
          )}
        </div>
      </div>

      {/* 🚀 LEADERBOARD 2: ALL-TIME TOP 5 */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden opacity-90 hover:opacity-100 transition-opacity">
        <div className="bg-gradient-to-r from-gray-900 to-indigo-950 p-6 text-white flex justify-between items-center">
          <h2 className="font-bold text-xl flex items-center gap-3 text-gray-100">
            <Medal size={24} className="text-yellow-500" /> All-Time Top 5
            Legends
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {!report.topStudents || report.topStudents.length === 0 ? (
            <p className="p-8 text-center text-gray-500 font-medium">
              No points awarded yet.
            </p>
          ) : (
            report.topStudents
              .slice(0, 5)
              .map((student: any, idx: number) =>
                renderLeaderboardRow(student, idx, false),
              )
          )}
        </div>
      </div>
    </div>
  );
}
