"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  GraduationCap,
  Star,
  ShieldAlert,
  History,
  CheckCircle2,
  CalendarDays,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

export default function StudentFullRecordPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "HISTORY">(
    "OVERVIEW",
  );

  const [currentHistoryPage, setCurrentHistoryPage] = useState(1);
  const HISTORY_ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `https://students-profile.onrender.com/admin/students/${id}/full-record`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok) throw new Error("Failed to fetch record");
        setData(await res.json());
      } catch (error) {
        toast.error("Could not load student dossier");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const fullHistory = data
    ? [
        ...data.history.allAchievements.map((a: any) => ({
          ...a,
          recordType: "ACHIEVEMENT",
        })),
        ...data.history.allPunishments.map((p: any) => ({
          ...p,
          recordType: "PUNISHMENT",
        })),
      ].sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    : [];

  const totalHistoryPages =
    Math.ceil(fullHistory.length / HISTORY_ITEMS_PER_PAGE) || 1;
  const paginatedHistory = fullHistory.slice(
    (currentHistoryPage - 1) * HISTORY_ITEMS_PER_PAGE,
    currentHistoryPage * HISTORY_ITEMS_PER_PAGE,
  );

  const handleTabSwitch = (tab: "OVERVIEW" | "HISTORY") => {
    setActiveTab(tab);
    if (tab === "HISTORY") setCurrentHistoryPage(1);
  };

  if (isLoading) {
    return (
      <div className="text-center mt-20 animate-pulse text-gray-400 font-bold">
        Accessing Secure Records...
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* HEADER CONTROLS */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Directory
      </button>

      {/* STUDENT PROFILE BANNER */}
      <div className="bg-gray-900 rounded-[2rem] p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20" />

        <div className="flex items-center gap-6 relative z-10">
          <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center shadow-inner border border-gray-700">
            <GraduationCap size={36} className="text-gray-300" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white capitalize tracking-tight">
              {data.student.fullName}
            </h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-md bg-white/10 text-gray-300">
                Class {data.student.class || "N/A"}
              </span>
              <span className="text-xs font-semibold text-gray-400">
                Admn No: {data.student.username}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 relative z-10">
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold mb-1">
              Lifetime
            </p>
            <p className="text-3xl font-black text-white">
              {data.overview.totalLifetimePoints}
            </p>
          </div>
          <div className="w-px h-12 bg-gray-800" />
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-widest text-red-400 font-bold mb-1">
              Active Actions
            </p>
            <p className="text-3xl font-black text-white">
              {data.overview.activePunishments.length}
            </p>
          </div>
        </div>
      </div>

      {/*  TAB NAVIGATION */}
      <div className="flex items-center gap-2 p-1.5 bg-gray-100 rounded-2xl w-fit">
        <button
          onClick={() => handleTabSwitch("OVERVIEW")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === "OVERVIEW"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Current Term Overview
        </button>
        <button
          onClick={() => handleTabSwitch("HISTORY")}
          className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === "HISTORY"
              ? "bg-gray-900 text-white shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <History size={16} /> Full Historical Data
        </button>
      </div>

      {/*  TAB CONTENT: OVERVIEW */}
      {activeTab === "OVERVIEW" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-slideIn">
          {/* Active Month Points */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Star size={20} className="text-emerald-500" /> Points (
                {data.overview.activeMonthName})
              </h3>
              <span className="text-sm font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                {data.overview.currentMonthPoints} Total
              </span>
            </div>

            <div className="space-y-3">
              {data.overview.currentMonthAchievements.length === 0 ? (
                <p className="text-sm text-gray-400">
                  No achievements recorded this term.
                </p>
              ) : (
                data.overview.currentMonthAchievements.map((ach: any) => (
                  <div
                    key={ach.id}
                    className="p-4 bg-gray-50 rounded-2xl border border-gray-100"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-bold text-gray-800 text-sm">
                        {ach.title}
                      </p>
                      <span className="text-xs font-black text-emerald-600">
                        +{ach.points} pts
                      </span>
                    </div>
                    <p className="text-[11px] font-semibold text-gray-500 flex items-center gap-1.5">
                      <UserIcon size={12} /> Awarded by:{" "}
                      <span className="text-gray-800">
                        {ach.awardedBy?.fullName || "System"}
                      </span>
                    </p>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      <CalendarDays size={12} />{" "}
                      {new Date(ach.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Active & Resolved Actions */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <ShieldAlert size={20} className="text-red-500" /> Disciplinary
              Actions
            </h3>

            <div className="space-y-3">
              {data.overview.activePunishments.length === 0 &&
              data.overview.resolvedPunishments.length === 0 ? (
                <p className="text-sm text-gray-400">
                  Clean disciplinary record.
                </p>
              ) : (
                <>
                  {data.overview.activePunishments.map((pun: any) => (
                    <div
                      key={pun.id}
                      className="p-4 bg-red-50/50 rounded-2xl border border-red-100"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-bold text-red-900 text-sm">
                          {pun.title}
                        </p>
                        <span className="text-[10px] font-black uppercase bg-red-600 text-white px-2 py-0.5 rounded-md">
                          Active
                        </span>
                      </div>
                      <p className="text-xs text-red-800 mb-2">
                        {pun.description}
                      </p>
                      <p className="text-[11px] font-semibold text-red-700/80 flex items-center gap-1.5">
                        <UserIcon size={12} /> Assigned by:{" "}
                        <span className="text-red-900">
                          {pun.assignedBy?.fullName || "System"}
                        </span>
                      </p>
                      <p className="text-[10px] text-red-400 mt-1 flex items-center gap-1">
                        <CalendarDays size={12} />{" "}
                        {new Date(pun.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}

                  {/* Show a few resolved ones to provide context */}
                  {data.overview.resolvedPunishments
                    .slice(0, 3)
                    .map((pun: any) => (
                      <div
                        key={pun.id}
                        className="p-4 bg-gray-50 rounded-2xl border border-gray-100 grayscale opacity-60"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <p className="font-bold text-gray-700 text-sm line-through">
                            {pun.title}
                          </p>
                          <span className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-1">
                            <CheckCircle2 size={12} /> Resolved
                          </span>
                        </div>
                        <p className="text-[11px] font-semibold text-gray-500">
                          Assigned by: {pun.assignedBy?.fullName || "System"}
                        </p>
                      </div>
                    ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/*  TAB CONTENT: FULL HISTORY */}
      {activeTab === "HISTORY" && (
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-slideIn">
          <div className="mb-8">
            <h3 className="text-xl font-bold text-gray-900">
              Complete Historical Timeline
            </h3>
            <p className="text-sm text-gray-500">
              A chronological log of all interactions since enrollment.
            </p>
          </div>

          {paginatedHistory.length === 0 ? (
            <p className="text-gray-400 mt-10">No history available.</p>
          ) : (
            <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 pb-4 animate-fadeInUp">
              {paginatedHistory.map((record: any) => (
                <div key={record.id} className="relative pl-8">
                  {/* Timeline Dot */}
                  <div
                    className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ${
                      record.recordType === "ACHIEVEMENT"
                        ? "bg-emerald-500"
                        : "bg-red-500"
                    }`}
                  />

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-bold text-gray-900">
                        {record.title}
                      </h4>
                      <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                        {new Date(record.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {record.recordType === "ACHIEVEMENT" ? (
                      <>
                        <p className="text-sm text-gray-600 mb-3">
                          Awarded for excellence in {record.academicMonth}.
                        </p>
                        <div className="flex items-center gap-4">
                          <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-md">
                            +{record.points} Points
                          </span>
                          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                            <UserIcon size={12} /> By{" "}
                            {record.awardedBy?.fullName || "System"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-sm text-gray-600 mb-3">
                          {record.description}
                        </p>
                        <div className="flex items-center gap-4">
                          <span
                            className={`text-xs font-black px-2 py-1 rounded-md border uppercase ${
                              record.status === "ACTIVE"
                                ? "bg-red-50 text-red-700 border-red-100"
                                : "bg-gray-50 text-gray-500 border-gray-200"
                            }`}
                          >
                            {record.status}
                          </span>
                          <span className="text-[11px] font-semibold text-gray-500 flex items-center gap-1">
                            <UserIcon size={12} /> Assigned By{" "}
                            {record.assignedBy?.fullName || "System"}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/*  HISTORY PAGINATION CONTROLS */}
          {totalHistoryPages > 1 && (
            <div className="flex items-center justify-between pt-8 mt-4 border-t border-gray-100">
              <button
                onClick={() =>
                  setCurrentHistoryPage((prev) => Math.max(prev - 1, 1))
                }
                disabled={currentHistoryPage === 1}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg disabled:opacity-30 transition-all"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalHistoryPages }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentHistoryPage === idx + 1
                        ? "w-5 bg-gray-900"
                        : "w-1.5 bg-gray-200"
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() =>
                  setCurrentHistoryPage((prev) =>
                    Math.min(prev + 1, totalHistoryPages),
                  )
                }
                disabled={currentHistoryPage === totalHistoryPages}
                className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-50 rounded-lg disabled:opacity-30 transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
