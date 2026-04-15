"use client";

import { useState, useEffect } from "react";
import { History, Award, Calendar, Trophy, Medal, Star } from "lucide-react";

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

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch("http://localhost:3001/subwing/results", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          setResults(await res.json());
        }
      } catch (error) {
        console.error("Failed to fetch published results");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, []);

  // 🚀 GROUPING LOGIC: We group the flat array of winners by their Program!
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
        <div className="space-y-8">
          {programArchives.map((archive) => (
            <div
              key={archive.program.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Program Header */}
              <div className="bg-gray-900 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500/30 text-indigo-200 px-3 py-1 rounded-full mb-2 inline-block">
                    Official Results
                  </span>
                  <h2 className="text-2xl font-bold capitalize">
                    {archive.program.title}
                  </h2>
                  <p className="text-gray-400 text-sm mt-1">
                    {archive.program.description}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-300 bg-black/30 px-4 py-2 rounded-xl border border-white/10">
                  <Calendar size={16} className="text-indigo-400" />
                  Published:{" "}
                  {new Date(archive.winners[0].createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Winners List */}
              <div className="p-6 bg-gray-50">
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
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                Rank: {winner.rank}
                              </span>
                            )}
                            {winner.grade && (
                              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
