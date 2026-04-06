"use client";

import { FileCheck, AlertTriangle, Trophy, Activity, Star } from "lucide-react";
import Link from "next/link";

export default function UsthadDashboard() {
  const stats = {
    punishmentsAssigned: 44,
    attachmentsVerified: 128,
    achievementsAwarded: 85,
    totalPointsGiven: 4250,
  };

  const usthad = {
    name: "Usthad Rashid",
    role: "Teacher",
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 space-y-8">
      {/* HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#004643]">
            {usthad.name}
          </h1>
          <span className="text-xs bg-[#004643]/10 text-[#004643] px-2 py-1 rounded-full font-semibold">
            {usthad.role}
          </span>
        </div>
        <p className="text-sm sm:text-base text-gray-500">
          Welcome back, manage discipline, evaluate students, and reward
          excellence
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {[
          {
            label: "Punishments",
            value: stats.punishmentsAssigned,
            icon: AlertTriangle,
            color: "red",
          },
          {
            label: "Verified",
            value: stats.attachmentsVerified,
            icon: FileCheck,
            color: "blue",
          },
          {
            label: "Achievements",
            value: stats.achievementsAwarded,
            icon: Trophy,
            color: "emerald",
          },
          {
            label: "Pts Given",
            value: stats.totalPointsGiven,
            icon: Star,
            color: "primary",
          },
        ].map((item, i) => (
          <div
            key={i}
            className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3 sm:gap-4"
          >
            <div
              className={`p-2 sm:p-3 rounded-xl ${
                item.color === "red"
                  ? "bg-red-50 text-red-600"
                  : item.color === "blue"
                    ? "bg-blue-50 text-blue-600"
                    : item.color === "emerald"
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-[#004643]/10 text-[#004643]"
              }`}
            >
              <item.icon size={18} />
            </div>
            <div>
              <p className="text-[10px] sm:text-xs text-gray-500 font-bold uppercase tracking-wider">
                {item.label}
              </p>
              <p className="text-xl sm:text-2xl font-black text-gray-800">
                {item.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ACTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Link
          href="/usthad/punishments"
          className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-red-200 transition-all group"
        >
          <div className="p-3 bg-red-50 rounded-xl w-fit mb-4">
            <AlertTriangle className="text-red-500 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="font-bold text-base sm:text-lg text-gray-800">
            Punishments
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Report student issues and manage discipline
          </p>
        </Link>

        <Link
          href="/usthad/attachments"
          className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-xl">
              <FileCheck className="text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full font-bold">
              3 Pending
            </span>
          </div>
          <h3 className="font-bold text-base sm:text-lg text-gray-800">
            Attachments
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Review submissions and verify work
          </p>
        </Link>

        <Link
          href="/usthad/achievements"
          className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group"
        >
          <div className="p-3 bg-emerald-50 rounded-xl w-fit mb-4">
            <Trophy className="text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="font-bold text-base sm:text-lg text-gray-800">
            Achievements
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Award points for student excellence
          </p>
        </Link>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-gray-50">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
            <Activity size={18} className="text-[#004643]" />
            Recent Submissions
          </h2>
          <button className="text-sm font-bold text-[#004643] hover:underline self-start sm:self-auto">
            View All
          </button>
        </div>

        <div className="divide-y divide-gray-100">
          <div className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:bg-gray-50 transition-colors">
            <div>
              <h4 className="font-semibold text-gray-800 text-sm sm:text-base">
                Book Review: Islamic History
              </h4>
              <p className="text-xs sm:text-sm text-gray-500 mt-1">
                Submitted by{" "}
                <span className="font-medium text-gray-700">Sahaleey</span> •
                Target: Public Behavior
              </p>
            </div>

            <div className="flex gap-2 flex-wrap">
              <button className="px-3 sm:px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-emerald-200">
                Approve
              </button>
              <button className="px-3 sm:px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-xs sm:text-sm font-semibold hover:bg-gray-200">
                Reject
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
