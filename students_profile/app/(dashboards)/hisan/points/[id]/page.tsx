"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, Trophy, Star, CalendarDays } from "lucide-react";

type MonthlyRecord = {
  month: string;
  points: number;
};

type StudentProfileData = {
  profile: {
    fullName: string;
    username: string;
    class?: string;
    totalPoints: number;
  };
  monthlyHistory?: MonthlyRecord[];
};

export default function StudentPointsProfile() {
  const { id } = useParams();
  const [data, setData] = useState<StudentProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch(`http://localhost:3001/usthad/students/${id}`, {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) setData(await res.json());
      } catch {
        console.error("Failed to fetch points profile");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-yellow-600 font-bold animate-pulse">
        Loading Points Data...
      </div>
    );
  if (!data)
    return (
      <div className="text-center text-red-500 mt-10">
        Failed to load student data.
      </div>
    );

  const profile = data.profile;
  const monthlyHistory = Array.isArray(data.monthlyHistory)
    ? data.monthlyHistory
    : [];

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/hisan/points"
            className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 shadow-sm"
          >
            <ArrowLeft size={20} />
          </Link>
          <div className="w-14 h-14 bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl flex items-center justify-center shadow-lg">
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
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* BIG LIFETIME POINTS CARD */}
        <div className="md:col-span-1">
          <div className="bg-linear-to-br from-yellow-400 via-yellow-500 to-orange-500 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <Trophy
              size={140}
              className="absolute -right-10 -bottom-10 text-white/20 transform -rotate-12"
            />
            <div className="relative z-10">
              <p className="text-sm font-black uppercase tracking-widest text-yellow-900/60 mb-2">
                Lifetime Points
              </p>
              <h2 className="text-7xl font-black">{profile.totalPoints}</h2>
              <div className="mt-6 flex items-center gap-2 bg-black/10 w-fit px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <Star size={16} className="text-yellow-100" />
                <span className="font-bold text-sm">Top Performer Track</span>
              </div>
            </div>
          </div>
        </div>

        {/* MONTHLY BREAKDOWN */}
        <div className="md:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gray-50 p-6 border-b border-gray-200 flex items-center gap-3">
            <CalendarDays size={22} className="text-gray-500" />
            <h2 className="font-bold text-xl text-gray-800">
              Monthly Breakdown
            </h2>
          </div>

          <div className="p-6 flex-1">
            {monthlyHistory.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 font-medium">
                  This student hasn&apos;t earned any points yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {monthlyHistory.map((record: MonthlyRecord, idx: number) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl border border-gray-100 bg-gray-50 flex items-center justify-between hover:border-yellow-300 hover:bg-yellow-50/30 transition-colors"
                  >
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">
                        Academic Period
                      </p>
                      <h3 className="font-bold text-gray-900 text-lg">
                        {record.month}
                      </h3>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-2xl text-emerald-600">
                        +{record.points}
                      </span>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                        Points
                      </p>
                    </div>
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
