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
import { useState, useEffect } from "react";
import Link from "next/link";

export default function StudentDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/student/dashboard", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          setDashboardData(await res.json());
        }
      } catch (err) {
        console.error("Failed to load dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-[#004643] font-bold animate-pulse">
        Loading Your Portal...
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="text-center text-red-500 mt-10">
        Failed to load data. Please refresh.
      </div>
    );
  }

  const { profile, categories, records, recentActivities, monthlyHistory } =
    dashboardData;
  const hasActivePunishment = categories.some(
    (cat: any) => cat.status === "RED",
  );

  // Helper to get the right icon based on title
  const getCategoryIcon = (title: string) => {
    if (title.includes("Academics")) return <BookOpen size={20} />;
    if (title.includes("Mosque")) return <User size={20} />;
    return <AlertOctagon size={20} />;
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 animate-fadeInUp">
      {/* Header with Glass Effect */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-[#004643] to-[#00665e] bg-clip-text text-transparent">
            Student Dashboard
          </h1>
          <p className="text-[#004643]/60 mt-1">
            Welcome back, {profile.name}!
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

      {/* SECTION 1: PROFILE & OVERALL STATUS */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-6 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-[#004643] to-[#00665e] rounded-2xl overflow-hidden ring-4 ring-white/50 shadow-lg">
                <img
                  src={profile.photoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1.5 ring-2 ring-white">
                <ShieldCheck size={12} className="text-white" />
              </div>
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-[#004643] capitalize">
                {profile.name}
              </h2>
              <p className="text-sm font-medium text-[#004643]/60 mt-1">
                Ad No: {profile.admnNo}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <p className="text-xs text-[#004643]/60">
                  Class: {profile.class}
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-gray-200/50">
            <div className="text-center p-2 bg-white/50 rounded-xl">
              <p className="text-2xl font-bold text-[#004643]">
                {profile.points}
              </p>
              <p className="text-xs text-[#004643]/60">Total Points</p>
            </div>
            {/* <div className="text-center p-2 bg-white/50 rounded-xl">
              <p className="text-2xl font-bold text-[#004643]">
                {profile.attendance}
              </p>
              <p className="text-xs text-[#004643]/60">Attendance</p>
            </div> */}
          </div>
        </div>

        {/* Status Banner */}
        <div className="lg:col-span-2 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 overflow-hidden transition-all duration-500">
          <div
            className={`p-6 h-full flex flex-col justify-center ${hasActivePunishment ? "bg-gradient-to-r from-red-500/20 to-red-600/20" : "bg-gradient-to-r from-emerald-500/20 to-emerald-600/20"}`}
          >
            <div className="flex items-center gap-5 flex-wrap">
              <div
                className={`p-4 rounded-2xl backdrop-blur-sm ${hasActivePunishment ? "bg-red-500/30 text-red-600" : "bg-emerald-500/30 text-emerald-600"}`}
              >
                {hasActivePunishment ? (
                  <AlertOctagon size={32} />
                ) : (
                  <ShieldCheck size={32} />
                )}
              </div>
              <div className="flex-1">
                <h3
                  className={`text-xl font-bold ${hasActivePunishment ? "text-red-700" : "text-emerald-700"}`}
                >
                  {hasActivePunishment
                    ? "⚠️ Action Required: Active Punishment"
                    : "✅ Status Normal: Good Standing"}
                </h3>
                <p
                  className={`mt-1 text-sm ${hasActivePunishment ? "text-red-600" : "text-emerald-600"}`}
                >
                  {hasActivePunishment
                    ? "Check your red categories and submit corrective work immediately."
                    : "You are doing great! Keep participating to earn more points and achievements."}
                </p>
              </div>
              {hasActivePunishment && (
                <Link
                  href="/student/tasks"
                  className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  View Tasks
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: POINTS & CATEGORIES */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div
          className={`lg:col-span-1 backdrop-blur-xl bg-gradient-to-br from-[#004643] to-[#00665e] p-6 rounded-2xl shadow-xl border border-white/20 relative overflow-hidden transition-all duration-500 ${hasActivePunishment ? "opacity-75" : ""}`}
        >
          <Trophy
            size={120}
            className="absolute -right-8 -bottom-8 text-white/10"
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-yellow-400" />
                <h2 className="text-white/80 font-semibold text-xs uppercase tracking-wider">
                  {profile.currentMonthName} Points
                </h2>
              </div>
            </div>

            {/* Current Month Points */}
            <div className="text-5xl font-black text-white flex items-baseline gap-2">
              {profile.currentMonthPoints}
              <span className="text-lg text-white/50 font-medium">/ 1000</span>
            </div>

            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((profile.currentMonthPoints / 1000) * 100, 100)}%`,
                }}
              />
            </div>

            {/* Lifetime Total Points Badge */}
            <div className="mt-5 pt-4 border-t border-white/20 flex justify-between items-center">
              <span className="text-white/70 text-xs font-medium">
                Lifetime Total:
              </span>
              <span className="bg-white/20 px-3 py-1 rounded-lg text-white font-bold text-sm">
                {profile.lifetimePoints} pts
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <Award size={20} className="text-yellow-400" />
              <h2 className="text-white/80 font-semibold text-sm uppercase tracking-wider">
                Total Points
              </h2>
            </div>
            <div className="text-5xl font-black text-white flex items-baseline gap-2">
              {profile.points}
              <span className="text-lg text-white/50 font-medium">/ 1000</span>
            </div>
            <div className="mt-3 h-2 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.min((profile.points / 1000) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {categories.map((cat: any) => (
            <div
              key={cat.id}
              className={`group backdrop-blur-xl rounded-2xl shadow-lg border p-5 transition-all duration-300 hover:scale-105 hover:shadow-2xl cursor-pointer ${cat.status === "GREEN" ? "bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border-emerald-500/30" : "bg-gradient-to-br from-red-500/20 to-red-600/20 border-red-500/30"}`}
            >
              <div className="flex justify-between items-start mb-3">
                <div
                  className={`p-2.5 rounded-xl backdrop-blur-sm ${cat.status === "GREEN" ? "bg-emerald-500/30 text-emerald-900" : "bg-red-500/30 text-red-900"}`}
                >
                  {getCategoryIcon(cat.title)}
                </div>
                <div
                  className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${cat.status === "GREEN" ? "bg-emerald-500/40 text-emerald-900" : "bg-red-500/40 text-red-900"}`}
                >
                  {cat.status}
                </div>
              </div>
              <h3 className="font-bold text-lg text-gray-800">{cat.title}</h3>
              <p className="text-xs text-gray-600/70 mt-1">{cat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 3: OFFICIAL RECORDS & ACTIVITIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          <div className="bg-gradient-to-r from-[#004643]/10 to-transparent p-5 border-b border-white/30">
            <h2 className="font-bold text-[#004643] flex items-center gap-2">
              <FileText size={18} /> Official Records
            </h2>
          </div>
          <div className="divide-y divide-white/30">
            {records.length === 0 ? (
              <p className="p-8 text-center text-gray-500 font-medium">
                No records found yet.
              </p>
            ) : (
              records.map((rec: any, idx: number) => (
                <div
                  key={rec.id}
                  className="group p-5 hover:bg-white/40 transition-all duration-300 animate-slideIn"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg ${rec.type === "Punishment" ? "bg-red-500/20 text-red-700" : "bg-emerald-500/20 text-emerald-700"}`}
                        >
                          {rec.type}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={10} />{" "}
                          {new Date(rec.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="font-semibold text-gray-800 text-lg capitalize">
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
                      <span
                        className={`text-xs font-bold px-4 py-2 rounded-full ${rec.status === "RESOLVED" ? "bg-emerald-100 text-emerald-700" : "bg-red-500/20 text-red-600"}`}
                      >
                        {rec.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="backdrop-blur-xl bg-white/60 rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          <div className="bg-gradient-to-r from-[#004643]/10 to-transparent p-5 border-b border-white/30">
            <h2 className="font-bold text-[#004643] flex items-center gap-2">
              <Clock size={18} /> Recent Submissions
            </h2>
          </div>
          <div className="p-5 space-y-3">
            {recentActivities.length === 0 ? (
              <p className="text-center text-gray-500 text-sm mt-4">
                No recent activity.
              </p>
            ) : (
              recentActivities.map((activity: any, idx: number) => (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl hover:bg-white/70 transition-all duration-300 animate-slideIn"
                  style={{ animationDelay: `${idx * 100}ms` }}
                >
                  <div
                    className={`p-2 rounded-lg ${activity.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" : activity.status === "REJECTED" ? "bg-red-100 text-red-700" : "bg-[#004643]/10 text-[#004643]"}`}
                  >
                    {activity.status === "APPROVED" ? (
                      <CheckCircle2 size={14} />
                    ) : (
                      <Sparkles size={14} />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 capitalize">
                      {activity.action}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
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
