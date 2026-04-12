"use client";

import { useState, useEffect } from "react";
import { Trophy, Star, Medal, CalendarDays, Megaphone } from "lucide-react";

export default function StudentResultsPage() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(
          "https://students-profile.onrender.com/subwing/my-results",
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          },
        );
        if (res.ok) setResults(await res.json());
      } catch (error) {
        console.error("Failed to fetch results");
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-[#004643] font-bold animate-pulse">
        Loading your trophies...
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Trophy size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Event Results</h1>
          <p className="text-gray-500 mt-1 font-medium">
            Your official placements and points from campus programs.
          </p>
        </div>
      </div>

      {results.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No Results Yet
          </h3>
          <p className="text-gray-600">
            Participate in campus programs to earn ranks and points here!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {results.map((result) => (
            <div
              key={result.id}
              className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-yellow-300 transition-all flex items-start gap-4"
            >
              {/* Medal Icon */}
              <div
                className={`shrink-0 w-14 h-14 rounded-full flex items-center justify-center font-black shadow-inner ${
                  result.rank === "1st"
                    ? "bg-gradient-to-br from-yellow-300 to-yellow-500 text-white"
                    : result.rank === "2nd"
                      ? "bg-gradient-to-br from-gray-300 to-gray-500 text-white"
                      : result.rank === "3rd"
                        ? "bg-gradient-to-br from-orange-300 to-orange-500 text-white"
                        : "bg-blue-50 text-blue-600"
                }`}
              >
                {result.rank === "1st" ||
                result.rank === "2nd" ||
                result.rank === "3rd" ? (
                  <Trophy size={24} />
                ) : (
                  <Medal size={24} />
                )}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded flex items-center gap-1 w-fit mb-2">
                    <Megaphone size={10} />{" "}
                    {result.program?.createdBy?.fullName || "Campus Program"}
                  </span>
                  <div className="text-right">
                    <span className="font-black text-xl text-emerald-600">
                      +{result.awardedPoints}
                    </span>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider -mt-1">
                      Pts
                    </p>
                  </div>
                </div>

                <h3 className="font-bold text-gray-900 text-lg leading-tight capitalize">
                  {result.program?.title}
                </h3>

                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {result.rank && (
                    <span className="text-xs font-bold bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-md border border-yellow-100">
                      Rank: {result.rank}
                    </span>
                  )}
                  {result.grade && (
                    <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-100">
                      Grade: {result.grade}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 flex items-center gap-1 ml-auto">
                    <CalendarDays size={12} />{" "}
                    {new Date(result.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
