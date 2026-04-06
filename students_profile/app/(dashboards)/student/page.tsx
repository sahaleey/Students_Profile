"use client";

import {
  AlertOctagon,
  ShieldCheck,
  Trophy,
  BookOpen,
  User,
  FileText,
  PlusCircle,
  TrendingUp,
  Award,
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function StudentDashboard() {
  const [student] = useState({
    name: "Sahaleey",
    admnNo: "1042",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sahaleey",
    points: 450,
    class: "Class 10",
    attendance: "92%",
  });

  const [categories] = useState([
    {
      id: 1,
      title: "Academics",
      status: "GREEN",
      icon: <BookOpen size={20} />,
      description: "Excellent progress",
      percentage: 85,
    },
    {
      id: 2,
      title: "Mosque",
      status: "YELLOW",
      icon: <User size={20} />,
      description: "Needs improvement",
      percentage: 60,
    },
    {
      id: 3,
      title: "Public Behavior",
      status: "RED",
      icon: <AlertOctagon size={20} />,
      description: "Immediate attention required",
      percentage: 30,
    },
  ]);

  const hasActivePunishment = categories.some((cat) => cat.status === "RED");

  const [records] = useState([
    {
      id: "P01",
      type: "Punishment",
      title: "Late to class",
      status: "Active",
      date: "Oct 12",
      points: null,
    },
    {
      id: "AC01",
      type: "Achievement",
      title: "Quiz Winner",
      points: "+50",
      date: "Oct 10",
      status: "Completed",
    },
    {
      id: "AC02",
      type: "Achievement",
      title: "Best Project Award",
      points: "+100",
      date: "Oct 5",
      status: "Completed",
    },
  ]);

  const recentActivities = [
    {
      id: 1,
      action: "Submitted assignment",
      date: "2 hours ago",
      icon: <CheckCircle2 size={14} />,
    },
    {
      id: 2,
      action: "Earned 50 points",
      date: "Yesterday",
      icon: <Award size={14} />,
    },
    {
      id: 3,
      action: "Completed quiz",
      date: "2 days ago",
      icon: <Sparkles size={14} />,
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fadeInUp">
      {/* Header with Glass Effect */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#004643] to-[#00665e] bg-clip-text text-transparent">
            Student Dashboard
          </h1>
          <p className="text-[#004643]/60 mt-1">
            Welcome back, {student.name}!
          </p>
        </div>
        <Link
          href="/student/works"
          className="group bg-gradient-to-r from-[#004643] to-[#00665e] hover:from-[#003634] hover:to-[#004643] text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <PlusCircle
            size={20}
            className="group-hover:rotate-90 transition-transform duration-300"
          />
          Manage Submissions
        </Link>
      </div>

      {/* SECTION 1: PROFILE & OVERALL STATUS - Glassmorphism */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1 backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-[#004643] to-[#00665e] rounded-2xl overflow-hidden ring-4 ring-white/50 shadow-lg">
                <img
                  src={student.photoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1.5 ring-2 ring-white">
                <ShieldCheck size={12} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#004643]">
                {student.name}
              </h2>
              <p className="text-sm font-medium text-[#004643]/60 mt-1">
                Admn: {student.admnNo}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Calendar size={14} className="text-[#004643]/40" />
                <p className="text-xs text-[#004643]/60">{student.class}</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-gray-200/50">
            <div className="text-center p-2 bg-white/50 rounded-xl">
              <p className="text-2xl font-bold text-[#004643]">
                {student.points}
              </p>
              <p className="text-xs text-[#004643]/60">Total Points</p>
            </div>
            <div className="text-center p-2 bg-white/50 rounded-xl">
              <p className="text-2xl font-bold text-[#004643]">
                {student.attendance}
              </p>
              <p className="text-xs text-[#004643]/60">Attendance</p>
            </div>
          </div>
        </div>

        {/* Status Banner*/}
        <div className="lg:col-span-2 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden transition-all duration-500">
          <div
            className={`p-6 ${
              hasActivePunishment
                ? "bg-gradient-to-r from-red-500/20 to-red-600/20"
                : "bg-gradient-to-r from-emerald-500/20 to-emerald-600/20"
            }`}
          >
            <div className="flex items-center gap-5 flex-wrap">
              <div
                className={`p-4 rounded-2xl backdrop-blur-sm ${
                  hasActivePunishment
                    ? "bg-red-500/30 text-red-600"
                    : "bg-emerald-500/30 text-emerald-600"
                }`}
              >
                {hasActivePunishment ? (
                  <AlertOctagon size={32} />
                ) : (
                  <ShieldCheck size={32} />
                )}
              </div>
              <div className="flex-1">
                <h3
                  className={`text-xl font-bold ${
                    hasActivePunishment ? "text-red-700" : "text-emerald-700"
                  }`}
                >
                  {hasActivePunishment
                    ? "⚠️ Action Required: Active Punishment"
                    : "✅ Status Normal: Good Standing"}
                </h3>
                <p
                  className={`mt-1 text-sm ${
                    hasActivePunishment ? "text-red-600" : "text-emerald-600"
                  }`}
                >
                  {hasActivePunishment
                    ? "Your points are frozen. Check your red categories and submit corrective work immediately."
                    : "You are doing great! Keep participating to earn more points and achievements."}
                </p>
              </div>
              {hasActivePunishment && (
                <button
                  onClick={() => {
                    window.location.href = "/student/tasks";
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  View Tasks
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: POINTS & CATEGORIES - Glass Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Points Card - Gradient Glass */}
        <div
          className={`lg:col-span-1 backdrop-blur-xl bg-gradient-to-br from-[#004643] to-[#00665e] p-6 rounded-2xl shadow-xl border border-white/20 relative overflow-hidden transition-all duration-500 ${
            hasActivePunishment ? "opacity-75" : ""
          }`}
        >
          <Trophy
            size={120}
            className="absolute -right-8 -bottom-8 text-white/10"
          />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Award size={20} className="text-yellow-400" />
              <h2 className="text-white/80 font-semibold text-sm uppercase tracking-wider">
                Monthly Points
              </h2>
            </div>
            <div className="text-5xl font-black text-white flex items-baseline gap-2">
              {student.points}
              <span className="text-lg text-white/50 font-medium">/ 1000</span>
            </div>
            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                style={{ width: `${(student.points / 1000) * 100}%` }}
              />
            </div>
            <p className="text-white/60 text-xs mt-3 flex items-center gap-1">
              <TrendingUp size={12} />
              {student.points >= 500
                ? "Excellent progress! 🎉"
                : `${1000 - student.points} more points to reach target`}
            </p>
          </div>
        </div>

        {/* Categories - Glass Cards */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`group backdrop-blur-xl rounded-2xl shadow-lg border p-5 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer ${
                cat.status === "GREEN"
                  ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/30 hover:border-emerald-500/50"
                  : cat.status === "YELLOW"
                    ? "bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 border-yellow-500/30 hover:border-yellow-500/50"
                    : "bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30 hover:border-red-500/50"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div
                  className={`p-2.5 rounded-xl backdrop-blur-sm ${
                    cat.status === "GREEN"
                      ? "bg-emerald-500/30"
                      : cat.status === "YELLOW"
                        ? "bg-yellow-500/30"
                        : "bg-red-500/30"
                  }`}
                >
                  {cat.icon}
                </div>
                <div
                  className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    cat.status === "GREEN"
                      ? "bg-emerald-500/40 text-emerald-900"
                      : cat.status === "YELLOW"
                        ? "bg-yellow-500/40 text-yellow-900"
                        : "bg-red-500/40 text-red-900"
                  }`}
                >
                  {cat.status}
                </div>
              </div>
              <h3 className="font-bold text-lg text-gray-800">{cat.title}</h3>
              <p className="text-xs text-gray-600/70 mt-1">{cat.description}</p>
              <div className="mt-3 h-1.5 bg-white/30 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    cat.status === "GREEN"
                      ? "bg-emerald-500"
                      : cat.status === "YELLOW"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                  }`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: OFFICIAL RECORDS & ACTIVITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Official Records - Main Section */}
        <section className="lg:col-span-2 backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="bg-gradient-to-r from-[#004643]/10 to-transparent p-5 border-b border-white/30">
            <h2 className="font-bold text-[#004643] flex items-center gap-2">
              <FileText size={18} /> Official Records
            </h2>
          </div>
          <div className="divide-y divide-white/30">
            {records.map((rec, idx) => (
              <div
                key={rec.id}
                className="group p-5 hover:bg-white/40 transition-all duration-300 animate-slideIn"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${
                          rec.type === "Punishment"
                            ? "bg-red-500/20 text-red-700"
                            : "bg-emerald-500/20 text-emerald-700"
                        }`}
                      >
                        {rec.type}
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={10} /> {rec.date}
                      </span>
                    </div>
                    <p className="font-semibold text-gray-800 text-lg">
                      {rec.title}
                    </p>
                  </div>
                  {rec.points ? (
                    <div className="text-right">
                      <span className="font-black text-[#004643] text-xl bg-emerald-500/20 px-4 py-2 rounded-xl">
                        {rec.points}
                      </span>
                      <p className="text-xs text-gray-500 mt-1">
                        points earned
                      </p>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-red-600 bg-red-500/20 px-4 py-2 rounded-full">
                      {rec.status}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Activity - Sidebar */}
        <section className="backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/50 overflow-hidden hover:shadow-2xl transition-all duration-300">
          <div className="bg-gradient-to-r from-[#004643]/10 to-transparent p-5 border-b border-white/30">
            <h2 className="font-bold text-[#004643] flex items-center gap-2">
              <Clock size={18} /> Recent Activity
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {recentActivities.map((activity, idx) => (
              <div
                key={activity.id}
                className="flex items-center gap-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/70 transition-all duration-300 animate-slideIn"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="p-2 bg-[#004643]/10 rounded-lg text-[#004643]">
                  {activity.icon}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                    {activity.action}
                  </p>
                  <p className="text-xs text-gray-500">{activity.date}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Stats */}
          <div className="p-5 border-t border-white/30 bg-gradient-to-r from-[#004643]/5 to-transparent">
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-[#004643]">12</p>
                <p className="text-xs text-gray-600">Total Submissions</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-[#004643]">8</p>
                <p className="text-xs text-gray-600">Achievements</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }

        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
