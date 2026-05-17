"use client";

import { useState, useEffect } from "react";
import {
  History,
  Award,
  Calendar,
  Trophy,
  Medal,
  Star,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import toast from "react-hot-toast";

interface Student {
  fullName: string;
  class: string;
  username: string;
}

interface Program {
  id: string;
  title: string;
  description: string;
  createdAt: string;
}

interface Winner {
  id: string;
  rank: string;
  grade: string;
  student: Student;
  awardedPoints: number;
  createdAt: string;
  program: Program;
}

export default function SubWingArchivePage() {
  const [results, setResults] = useState<Winner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 Accordion State
  const [expandedProgramId, setExpandedProgramId] = useState<string | null>(
    null,
  );

  // 🚀 Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(
          "https://students-profile.onrender.com/subwing/results",
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          },
        );
        if (res.ok) {
          setResults(await res.json());
        } else {
          toast.error("Failed to load results.");
        }
      } catch (error) {
        console.error("Failed to fetch published results");
        toast.error("Server error. Try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, []);

  // GROUPING LOGIC: We group the flat array of winners by their Program!
  const groupedResults = results.reduce(
    (acc, result) => {
      const progId = result.program?.id;
      if (!progId) return acc;

      if (!acc[progId]) {
        acc[progId] = {
          program: result.program,
          winners: [],
        };
      }
      acc[progId].winners.push(result);
      return acc;
    },
    {} as Record<string, { program: Program; winners: Winner[] }>,
  );

  const programArchives: Array<{ program: Program; winners: Winner[] }> = (
    Object.values(groupedResults) as Array<{
      program: Program;
      winners: Winner[];
    }>
  ).sort(
    (a, b) =>
      new Date(b.program.createdAt).getTime() -
      new Date(a.program.createdAt).getTime(),
  );

  // 🚀 Calculate Pagination Data
  const totalPages = Math.ceil(programArchives.length / ITEMS_PER_PAGE) || 1;
  const paginatedArchives = programArchives.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-indigo-600 font-bold animate-pulse">
        Loading Archives...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-900 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
          <History size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Results Archive</h1>
          <p className="text-gray-500 mt-1 font-medium">
            Historical log of all winners and points awarded by your wing.
          </p>
        </div>
      </div>

      {programArchives.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award size={40} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No Results Published Yet!
          </h3>
          <p className="text-gray-600">
            Go to the &apos;Declare Winners&apos; page to publish your first
            program results.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {paginatedArchives.map((archive) => {
            const isExpanded = expandedProgramId === archive.program.id;

            return (
              <div
                key={archive.program.id}
                className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
                  isExpanded
                    ? "border-indigo-300 shadow-lg"
                    : "border-gray-200 shadow-sm hover:border-indigo-200 hover:shadow-md"
                }`}
              >
                {/* 🚀 Clickable Program Header */}
                <div
                  onClick={() =>
                    setExpandedProgramId(isExpanded ? null : archive.program.id)
                  }
                  className="bg-gray-900 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer group"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full">
                        Official Results
                      </span>
                      <span className="flex items-center gap-1.5 text-sm font-medium text-gray-400">
                        <Users size={14} /> {archive.winners.length} Winners
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold capitalize group-hover:text-indigo-300 transition-colors">
                      {archive.program.title}
                    </h2>
                    <p className="text-gray-400 text-sm mt-1 line-clamp-1">
                      {archive.program.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-300 bg-black/30 px-4 py-2 rounded-xl border border-white/10">
                      <Calendar size={16} className="text-indigo-400" />
                      {new Date(
                        archive.winners[0].createdAt,
                      ).toLocaleDateString()}
                    </div>
                    <div className="text-gray-400 bg-white/5 p-2 rounded-full border border-white/10 group-hover:bg-white/10 transition-colors">
                      {isExpanded ? (
                        <ChevronUp size={20} />
                      ) : (
                        <ChevronDown size={20} />
                      )}
                    </div>
                  </div>
                </div>

                {/* 🚀 Expandable Winners List */}
                {isExpanded && (
                  <div className="p-6 bg-gray-50 animate-slideIn border-t border-indigo-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {archive.winners
                        // Sort winners so 1st place shows up at the top!
                        .sort((a, b) =>
                          (a.rank || "Z").localeCompare(b.rank || "Z"),
                        )
                        .map((winner) => (
                          <div
                            key={winner.id}
                            className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm hover:border-indigo-300 transition-colors"
                          >
                            {/* Rank/Medal Icon */}
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shadow-inner ${
                                winner.rank === "1st"
                                  ? "bg-gradient-to-br from-yellow-300 to-yellow-500 text-white"
                                  : winner.rank === "2nd"
                                    ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white"
                                    : winner.rank === "3rd"
                                      ? "bg-gradient-to-br from-orange-300 to-orange-500 text-white"
                                      : "bg-indigo-50 text-indigo-600"
                              }`}
                            >
                              {winner.rank === "1st" ||
                              winner.rank === "2nd" ||
                              winner.rank === "3rd" ? (
                                <Trophy size={20} />
                              ) : (
                                <Medal size={20} />
                              )}
                            </div>

                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-lg capitalize">
                                {winner.student?.fullName || "Unknown Student"}
                              </h3>
                              <p className="text-xs text-gray-500 font-medium">
                                Class {winner.student?.class} • Admn:{" "}
                                {winner.student?.username}
                              </p>

                              <div className="flex items-center gap-2 mt-2">
                                {winner.rank && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                                    Rank: {winner.rank}
                                  </span>
                                )}
                                {winner.grade && (
                                  <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                                    Grade: {winner.grade}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Points Awarded */}
                            <div className="text-right">
                              <div className="flex items-center justify-end gap-1 text-emerald-600 mb-0.5">
                                <Star size={16} className="fill-emerald-600" />
                              </div>
                              <span className="font-black text-2xl text-gray-900">
                                +{winner.awardedPoints}
                              </span>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                                Points
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* 🚀 Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-6 border-t border-gray-200">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>

              <span className="text-sm font-bold text-gray-600 bg-white px-5 py-2 rounded-xl shadow-sm border border-gray-200">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="p-2.5 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
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
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
