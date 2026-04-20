"use client";

import { useState, useEffect } from "react";
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";

export default function ClassWiseReportPage() {
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const res = await fetch(
          "https://students-profile.onrender.com/usthad/class-report",
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setAllStudents(data);

          // Extract unique classes automatically
          const uniqueClasses = Array.from(
            new Set(data.map((s: any) => s.class || "Unassigned")),
          );
          // Sort numerically if possible
          const sortedClasses = (uniqueClasses as string[]).sort((a, b) => {
            const numA = parseInt(a.replace(/\D/g, "")) || 0;
            const numB = parseInt(b.replace(/\D/g, "")) || 0;
            return numA - numB;
          });

          setClasses(sortedClasses);
          if (sortedClasses.length > 0) setSelectedClass(sortedClasses[0]); // Select first class by default
        }
      } catch (error) {
        console.error("Failed to fetch class report");
      } finally {
        setIsLoading(false);
      }
    };
    fetchReportData();
  }, []);

  const filteredStudents = allStudents.filter(
    (s) => (s.class || "Unassigned") === selectedClass,
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header & Class Selector */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Users size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Class Reports</h1>
            <p className="text-gray-500 mt-1 font-medium">
              Monitor overall disciplinary status by classroom.
            </p>
          </div>
        </div>

        {/* The Class Dropdown */}
        <div className="flex items-center gap-3">
          <label className="font-bold text-gray-700 flex items-center gap-2">
            <GraduationCap size={20} className="text-indigo-600" /> Select
            Class:
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-900 font-black rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 transition-all cursor-pointer min-w-[150px]"
          >
            {classes.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center text-indigo-600 font-bold animate-pulse mt-10">
          Loading Classroom Data...
        </div>
      ) : (
        <div className="space-y-4">
          {/* Quick Stats Bar */}
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-emerald-50 text-emerald-800 px-4 py-2 rounded-lg font-bold border border-emerald-200 flex items-center gap-2 text-sm">
              <ShieldCheck size={16} />{" "}
              {filteredStudents.filter((s) => s.status === "GREEN").length}{" "}
              Clear
            </div>
            <div className="bg-red-50 text-red-800 px-4 py-2 rounded-lg font-bold border border-red-200 flex items-center gap-2 text-sm">
              <ShieldAlert size={16} />{" "}
              {filteredStudents.filter((s) => s.status === "RED").length} Action
              Required
            </div>
          </div>

          {/* The Red/Green Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStudents.length === 0 ? (
              <p className="text-gray-500 col-span-full">
                No students found in this class.
              </p>
            ) : (
              filteredStudents.map((student) => (
                <Link
                  key={student.id}
                  href={`/usthad/students/${student.id}`} // Links to the deep-dive profile!
                  className={`relative p-5 rounded-2xl border transition-all hover:scale-[1.02] hover:shadow-lg group overflow-hidden ${
                    student.status === "GREEN"
                      ? "bg-white border-emerald-200 hover:border-emerald-400"
                      : "bg-red-50 border-red-300 hover:border-red-500 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]"
                  }`}
                >
                  {/* Status Indicator Icon */}
                  <div className="absolute right-4 top-4">
                    {student.status === "GREEN" ? (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                        <ShieldCheck size={16} className="text-emerald-600" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center animate-pulse">
                        <ShieldAlert size={16} className="text-red-700" />
                      </div>
                    )}
                  </div>

                  <div className="pr-10">
                    <p
                      className={`text-[10px] font-black uppercase tracking-wider mb-1 ${student.status === "GREEN" ? "text-emerald-600" : "text-red-600"}`}
                    >
                      {student.status === "GREEN"
                        ? "Clear Standing"
                        : "Attention Required"}
                    </p>
                    <h3
                      className={`font-bold text-lg leading-tight capitalize ${student.status === "GREEN" ? "text-gray-900" : "text-red-950"}`}
                    >
                      {student.fullName}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1 font-medium">
                      Admn: {student.username}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                      View Report <ChevronRight size={14} />
                    </span>
                  </div>

                  {/* Red Status Glow Effect */}
                  {student.status === "RED" && (
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
                  )}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
