"use client";

import { useState, useEffect } from "react";
import {
  BookOpen,
  HeartHandshake,
  Megaphone,
  Award,
  Coins,
  Search,
  Calendar,
  FileText,
  ShieldAlert,
  CheckCircle2,
  User,
} from "lucide-react";

export default function DepartmentRecordsPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          "https://students-profile.onrender.com/staff/records",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) setData(await res.json());
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecords();
  }, []);

  if (isLoading)
    return (
      <div className="text-center mt-20 animate-pulse font-bold text-indigo-600">
        Loading Department Records...
      </div>
    );
  if (!data)
    return (
      <div className="text-center mt-20 text-red-500">
        Error loading records.
      </div>
    );

  const { department, achievements, fines } = data;
  const isLibrary = department === "Library";
  const isOutreach = department === "Outreach";
  const isWelfare = department === "Welfare";

  const filteredAchievements = achievements.filter(
    (a: any) =>
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.student?.fullName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredFines = fines?.filter(
    (f: any) =>
      f.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.student?.fullName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeInUp pb-12">
      {/* 🚀 DYNAMIC HEADER */}
      <div
        className={`p-8 rounded-3xl border shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 ${
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
              <Megaphone size={32} />
            ) : (
              <HeartHandshake size={32} />
            )}
          </div>
          <div>
            <h1
              className={`text-3xl font-black ${isLibrary ? "text-amber-900" : isOutreach ? "text-blue-900" : "text-rose-900"}`}
            >
              {isLibrary
                ? "Library Archives & Fines"
                : isOutreach
                  ? "Outreach & Publications"
                  : "Welfare Programs & Records"}
            </h1>
            <p className="text-gray-600 font-medium mt-1">
              {isLibrary
                ? "View reading programs, library achievements, and track active book fines."
                : isOutreach
                  ? "Official log of student publications and external outreach achievements."
                  : "Directory of welfare programs and student welfare achievements."}
            </p>
          </div>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by student name or record title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-black shadow-sm"
        />
      </div>

      {/* 🚀 CONDITIONAL LIBRARY FINES SECTION */}
      {isLibrary && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="bg-amber-50 p-5 border-b border-amber-100 flex items-center justify-between">
            <h2 className="font-bold text-amber-900 text-xl flex items-center gap-2">
              <Coins size={22} className="text-amber-600" /> Book Fines Tracker
            </h2>
            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-lg text-sm font-bold shadow-sm">
              {fines.length} Records
            </span>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFines.length === 0 ? (
              <p className="text-gray-500 col-span-full">
                No active fines found.
              </p>
            ) : (
              filteredFines.map((fine: any) => (
                <div
                  key={fine.id}
                  className="p-5 rounded-2xl border border-amber-200 bg-amber-50/30 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md">
                      Fine Pending
                    </span>
                    <ShieldAlert size={16} className="text-amber-500" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">
                    {fine.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {fine.description}
                  </p>
                  <div className="mt-4 pt-4 border-t border-amber-100 flex justify-between items-center text-xs">
                    <span className="font-bold text-gray-800 capitalize">
                      <User size={12} className="inline mr-1" />
                      {fine.student?.fullName}
                    </span>
                    <span className="text-gray-500">
                      {new Date(fine.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 🚀 THE ACHIEVEMENTS & PROGRAMS SECTION */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div
          className={`p-5 border-b flex items-center justify-between ${isLibrary ? "bg-emerald-50 border-emerald-100" : isOutreach ? "bg-blue-50 border-blue-100" : "bg-rose-50 border-rose-100"}`}
        >
          <h2
            className={`font-bold text-xl flex items-center gap-2 ${isLibrary ? "text-emerald-900" : isOutreach ? "text-blue-900" : "text-rose-900"}`}
          >
            <Award
              size={22}
              className={
                isLibrary
                  ? "text-emerald-600"
                  : isOutreach
                    ? "text-blue-600"
                    : "text-rose-600"
              }
            />
            {isLibrary
              ? "Library Programs & Reading Achievements"
              : isOutreach
                ? "Publications & Outreach"
                : "Welfare Achievements"}
          </h2>
          <span className="bg-white/60 px-3 py-1 rounded-lg text-sm font-bold shadow-sm text-gray-700">
            {achievements.length} Records
          </span>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredAchievements.length === 0 ? (
            <p className="p-12 text-center text-gray-500 text-lg">
              No program achievements recorded yet.
            </p>
          ) : (
            filteredAchievements.map((ach: any) => (
              <div
                key={ach.id}
                className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`mt-1 p-3 rounded-xl shadow-sm ${isLibrary ? "bg-emerald-100 text-emerald-600" : isOutreach ? "bg-blue-100 text-blue-600" : "bg-rose-100 text-rose-600"}`}
                  >
                    <FileText size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                        <Calendar size={12} />{" "}
                        {new Date(ach.createdAt).toLocaleDateString()}
                      </span>
                      {ach.isSpecialHighlight && (
                        <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-md font-black uppercase tracking-wider">
                          🌟 Special
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-xl text-gray-900">
                      {ach.title}
                    </h3>
                    <p className="text-sm font-medium text-gray-600 mt-1 flex items-center gap-1.5 capitalize">
                      <User size={14} className="text-gray-400" /> Awarded to:{" "}
                      {ach.student?.fullName}
                    </p>
                  </div>
                </div>
                <div className="sm:text-right shrink-0">
                  <span
                    className={`font-black text-3xl ${isLibrary ? "text-emerald-600" : isOutreach ? "text-blue-600" : "text-rose-600"}`}
                  >
                    +{ach.points}
                  </span>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mt-1">
                    Points Earned
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
