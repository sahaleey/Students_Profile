"use client";

import { useState, useEffect } from "react";
import {
  History,
  Calendar,
  Trophy,
  Medal,
  Star,
  Layers,
  Search,
} from "lucide-react";

interface Student {
  fullName: string;
  class: string;
  username: string;
}

interface Program {
  id: string;
  title: string;
  createdAt: string;
  createdBy?: {
    fullName: string;
  };
}

interface Result {
  id: string;
  rank?: string;
  grade?: string;
  awardedPoints: number;
  createdAt: string;
  student?: Student;
  program?: Program;
}

interface ProgramArchive {
  program: Program;
  winners: Result[];
}

export default function HisanGlobalResultsPage() {
  const [results, setResults] = useState<Result[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch("http://localhost:3001/subwing/all-results", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) setResults(await res.json());
      } catch (error) {
        console.error("Failed to fetch global results");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, []);

  // Group by Program
  const groupedResults = results.reduce(
    (acc, result) => {
      const progId = result.program?.id;
      if (!progId || !result.program) return acc;
      if (!acc[progId]) {
        acc[progId] = { program: result.program, winners: [] };
      }
      acc[progId].winners.push(result);
      return acc;
    },
    {} as Record<string, ProgramArchive>,
  );

  const programArchives = Object.values(groupedResults).sort(
    (a, b) =>
      new Date(b.program.createdAt).getTime() -
      new Date(a.program.createdAt).getTime(),
  );
  const filteredArchives = programArchives.filter((archive) =>
    archive.program.title?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading)
    return (
      <div className="flex justify-center items-center h-[60vh] text-indigo-600 font-bold animate-pulse">
        Loading Global Archives...
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-900 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
          <Layers size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Global Results Archive
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Audit all competition winners across all Sub-Wings.
          </p>
        </div>
      </div>
      {/* Search Bar */}
      <div className="p-6 border-b border-gray-200 bg-gray-50">
        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search by Program Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-[#615fff] focus:ring-2 focus:ring-[#615fff] transition-all text-black font-medium"
          />
        </div>
      </div>

      {filteredArchives.length === 0 ? (
        <p className="text-center text-gray-500 p-10 bg-white rounded-xl border border-gray-200">
          No results have been published campus-wide.
        </p>
      ) : (
        <div className="space-y-8">
          {filteredArchives.map((archive) => (
            <div
              key={archive.program.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Program Header */}
              <div className="bg-gray-900 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-indigo-500 text-white px-2.5 py-1 rounded-md mb-2 inline-block">
                    {archive.program.createdBy?.fullName || "Unknown Wing"}
                  </span>
                  <h2 className="text-2xl font-bold capitalize">
                    {archive.program.title}
                  </h2>
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
                    .sort((a, b) =>
                      (a.rank || "Z").localeCompare(b.rank || "Z"),
                    )
                    .map((winner) => (
                      <div
                        key={winner.id}
                        className="bg-white p-4 rounded-xl border border-gray-200 flex items-center gap-4 shadow-sm"
                      >
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 capitalize">
                            {winner.student?.fullName}
                          </h3>
                          <p className="text-xs text-gray-500">
                            Class {winner.student?.class}
                          </p>
                          <p className="text-xs text-gray-500">
                            Ad.No: {winner.student?.username}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {winner.rank && (
                              <span className="text-[10px] text-black font-bold uppercase bg-gray-100 px-2 py-0.5 rounded">
                                Rank: {winner.rank}
                              </span>
                            )}
                            {winner.grade && (
                              <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 px-2 py-0.5 rounded">
                                Grade: {winner.grade}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-xl text-emerald-600">
                            +{winner.awardedPoints}
                          </span>
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
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
