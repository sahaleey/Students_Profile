"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  ShieldAlert,
  Trophy,
  Award,
  Target,
  Activity,
} from "lucide-react";

export default function StudentPerformanceProfile() {
  const { id } = useParams(); // Gets the student ID from the URL!
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:3001/usthad/students/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) setData(await res.json());
      } catch (error) {
        console.error("Failed to fetch student profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-purple-600 font-bold animate-pulse">
        Analyzing Student Profile...
      </div>
    );
  if (!data)
    return (
      <div className="text-center text-red-500 mt-10">
        Failed to load student data.
      </div>
    );

  const { profile, categories, activePunishments, recentAchievements } = data;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/usthad/students"
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 shadow-sm"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="w-14 h-14 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
            <User size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 capitalize">
              {profile.fullName}
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              Class {profile.class} • Admn: {profile.username}
            </p>
          </div>
        </div>

        <div className="bg-white px-6 py-3 rounded-2xl border border-purple-100 shadow-sm flex items-center gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
              Lifetime Points
            </p>
            <p className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-fuchsia-600">
              {profile.totalPoints}
            </p>
          </div>
          <Trophy size={32} className="text-yellow-400" />
        </div>
      </div>

      {/* 🚀 THE RED/GREEN CATEGORY STATUSES */}
      <div>
        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Activity size={20} className="text-purple-600" /> Departmental
          Standing
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat: any, idx: number) => (
            <div
              key={idx}
              className={`p-5 rounded-2xl border transition-all ${
                cat.status === "GREEN"
                  ? "bg-emerald-50 border-emerald-200"
                  : "bg-red-50 border-red-200 shadow-[inset_0_0_15px_rgba(239,68,68,0.1)]"
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <Target
                  size={20}
                  className={
                    cat.status === "GREEN" ? "text-emerald-500" : "text-red-500"
                  }
                />
                <div
                  className={`w-3 h-3 rounded-full ${cat.status === "GREEN" ? "bg-emerald-500" : "bg-red-500 animate-pulse"}`}
                />
              </div>
              <h3
                className={`font-bold mt-2 ${cat.status === "GREEN" ? "text-emerald-900" : "text-red-900"}`}
              >
                {cat.title || cat.name}
              </h3>
              <p
                className={`text-xs font-bold uppercase tracking-wider mt-1 ${cat.status === "GREEN" ? "text-emerald-600" : "text-red-600"}`}
              >
                {cat.status === "GREEN" ? "Clear Standing" : "Action Required"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ACTIVE PUNISHMENTS */}
        <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
          <div className="bg-red-50 p-5 border-b border-red-100 flex items-center gap-2">
            <ShieldAlert size={20} className="text-red-600" />
            <h2 className="font-bold text-red-900 text-lg">
              Active Disciplinary Actions
            </h2>
          </div>
          <div className="p-6">
            {activePunishments.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No active punishments. Standing is clear.
              </p>
            ) : (
              <div className="space-y-4">
                {activePunishments.map((p: any) => (
                  <div
                    key={p.id}
                    className="p-4 rounded-xl border border-red-200 bg-red-50/50"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-red-200 text-red-800 px-2 py-0.5 rounded">
                        {p.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 mt-2">{p.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {p.description}
                    </p>
                    <p className="text-xs text-red-600 font-semibold mt-3">
                      Assigned by: {p.assignedBy?.fullName || "System"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RECENT ACHIEVEMENTS */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 p-5 border-b border-gray-200 flex items-center gap-2">
            <Award size={20} className="text-yellow-600" />
            <h2 className="font-bold text-gray-800 text-lg">
              Recent Achievements
            </h2>
          </div>
          <div className="p-6">
            {recentAchievements.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No recent points awarded.
              </p>
            ) : (
              <div className="space-y-4">
                {recentAchievements.map((ach: any) => (
                  <div
                    key={ach.id}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-gray-50"
                  >
                    <div>
                      <h3 className="font-bold text-gray-800 capitalize">
                        {ach.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Period: {ach.academicMonth}
                      </p>
                    </div>
                    <span className="font-black text-xl text-emerald-600">
                      +{ach.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
