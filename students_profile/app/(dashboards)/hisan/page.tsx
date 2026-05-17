"use client";

import { useState, useEffect } from "react";
import {
  BarChart3,
  Activity,
  Award,
  Eye,
  Users,
  LayoutGrid,
  TrendingUp,
  Search,
  CalendarDays,
} from "lucide-react";
import Link from "next/link";

export default function HisanAnalyticsHub() {
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Real State instead of Mock Data!
  const [stats, setStats] = useState({
    totalWings: 0,
    activePrograms: 0,
    totalParticipants: 0,
    pointsDistributed: 0,
  });
  const [subWings, setSubWings] = useState<any[]>([]);
  const [recentPrograms, setRecentPrograms] = useState<any[]>([]);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(
          "https://students-profile.onrender.com/subwing/analytics",
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setSubWings(data.subWings);
          setRecentPrograms(data.recentPrograms);
        }
      } catch (err) {
        console.error("Failed to load HISAN analytics");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const filteredWings = subWings.filter((wing) =>
    wing.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-indigo-600 font-bold animate-pulse">
        Initializing Command Centre...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-900 to-slate-800 rounded-2xl flex items-center justify-center shadow-lg">
            <Activity size={28} className="text-indigo-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              HISAN Analyze Centre
            </h1>
            <p className="text-gray-500 font-medium mt-1">
              Global overview of all Sub-Wings and Campus Programs
            </p>
          </div>
        </div>
      </div>

      {/* TOP LEVEL ANALYTICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <LayoutGrid size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Total Sub-Wings
            </p>
            <p className="text-2xl font-black text-gray-800">
              {stats.totalWings}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CalendarDays size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Live Programs
            </p>
            <p className="text-2xl font-black text-gray-800">
              {stats.activePrograms}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Participants
            </p>
            <p className="text-2xl font-black text-gray-800">
              {stats.totalParticipants}
            </p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl">
            <Award size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Points Given
            </p>
            <p className="text-2xl font-black text-gray-800">
              {stats.pointsDistributed}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* LEFT COLUMN: SUB-WING PERFORMANCE */}
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="bg-gray-50 p-5 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="font-bold text-lg flex items-center gap-2 text-gray-800">
              <BarChart3 size={20} className="text-indigo-600" /> Sub-Wing
              Performance Matrix
            </h2>
            <div className="relative">
              <Search
                className="absolute left-3 top-2.5 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Search wings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 text-black pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-indigo-500 text-sm"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white border-b border-gray-100 text-gray-500">
                <tr>
                  <th className="p-4 font-bold">Wing Name</th>
                  <th className="p-4 font-bold">Live Programs</th>
                  <th className="p-4 font-bold">Total Conducted</th>
                  <th className="p-4 font-bold">Points Granted</th>
                  <th className="p-4 font-bold">Activity Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredWings.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-gray-400">
                      No Sub-Wings Found. Admin needs to create them!
                    </td>
                  </tr>
                ) : (
                  filteredWings.map((wing) => (
                    <tr
                      key={wing.id}
                      className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    >
                      <td className="p-4 font-bold text-gray-800 flex items-center gap-2 capitalize">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {wing.name}
                      </td>
                      <td className="p-4 font-semibold text-indigo-600">
                        {wing.activePrograms}
                      </td>
                      <td className="p-4 text-gray-600">
                        {wing.totalConducted}
                      </td>
                      <td className="p-4 font-bold text-gray-700">
                        {wing.pointsGiven}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            wing.status === "Highly Active"
                              ? "bg-emerald-100 text-emerald-700"
                              : wing.status === "Active"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {wing.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PROGRAM FEED */}
        <div className="xl:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
          <div className="bg-gray-900 p-5 text-white flex justify-between items-center">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Eye size={20} className="text-indigo-400" /> Campus Radar
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {recentPrograms.length === 0 ? (
              <p className="text-center text-gray-400 mt-10">
                No active programs across the campus.
              </p>
            ) : (
              recentPrograms.map((prog) => (
                <div
                  key={prog.id}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-1 rounded capitalize">
                      {prog.wing}
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded ${
                        prog.status === "Ongoing"
                          ? "text-emerald-600 bg-emerald-50"
                          : prog.status === "Evaluating"
                            ? "text-orange-600 bg-orange-50"
                            : "text-gray-600 bg-gray-100"
                      }`}
                    >
                      {prog.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1 capitalize">
                    {prog.title}
                  </h3>
                  <div className="flex items-center justify-between mt-3 text-xs font-medium text-gray-500 border-t border-gray-50 pt-2">
                    <span className="flex items-center gap-1">
                      <Users size={12} /> {prog.participants} joined
                    </span>
                    <span className="flex items-center gap-1 text-red-500">
                      <CalendarDays size={12} /> Ends: {prog.endDate}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
