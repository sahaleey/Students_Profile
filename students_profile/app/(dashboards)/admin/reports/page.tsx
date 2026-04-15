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

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 shadow-sm"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <BarChart3 size={24} className="text-white" />
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
              Active Punishments
            </p>
            <p className="text-3xl font-black text-gray-900">
              {report.activePunishments}
            </p>
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-gray-900 to-indigo-900 p-6 text-white flex justify-between items-center">
          <h2 className="font-bold text-xl flex items-center gap-2">
            <Medal size={24} className="text-yellow-400" /> All-Time Top 5
            Students
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {report.topStudents.length === 0 ? (
            <p className="p-8 text-center text-gray-500 font-medium">
              No points awarded yet.
            </p>
          ) : (
            report.topStudents.map((student: any, idx: number) => (
              <div
                key={idx}
                className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-6">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                      idx === 0
                        ? "bg-yellow-100 text-yellow-700 ring-2 ring-yellow-400"
                        : idx === 1
                          ? "bg-gray-200 text-gray-700"
                          : idx === 2
                            ? "bg-orange-100 text-orange-800"
                            : "bg-indigo-50 text-indigo-700"
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-gray-900 capitalize">
                      {student.name}
                    </h3>
                    <p className="text-sm text-gray-500 font-medium">
                      Class: {student.class}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-black text-3xl text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-emerald-600">
                    {student.points}
                  </span>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Total Points
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
