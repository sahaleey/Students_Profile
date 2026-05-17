"use client";

import { useState, useEffect } from "react";
import {
  Users,
  ShieldAlert,
  ShieldCheck,
  ChevronRight,
  GraduationCap,
  Coins,
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
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="w-full bg-emerald-50 text-emerald-800 px-4 py-3 rounded-xl font-bold border border-emerald-200 flex items-center justify-center gap-2 text-sm">
              <ShieldCheck size={16} />{" "}
              {filteredStudents.filter((s) => s.status === "GREEN").length}{" "}
              Clear
            </div>
            <div className="w-full bg-red-50 text-red-800 px-4 py-3 rounded-xl font-bold border border-red-200 flex items-center justify-center gap-2 text-sm">
              <ShieldAlert size={16} />{" "}
              {filteredStudents.filter((s) => s.status === "RED").length} Action
              Required
            </div>
            <div className="w-full bg-amber-50 text-amber-600 px-4 py-3 rounded-xl font-bold border border-amber-200 flex items-center justify-center gap-2 text-sm">
              <ShieldAlert size={16} />{" "}
              {filteredStudents.filter((s) => s.status === "YELLOW").length}{" "}
              Fine Pending
            </div>
            <div className="w-full bg-orange-50 text-orange-800 px-4 py-3 rounded-xl font-bold border border-orange-200 flex items-center justify-center gap-2 text-sm">
              <ShieldAlert size={16} />{" "}
              {filteredStudents.filter((s) => s.status === "BOTH").length} Both
              Fine and Action Pending
            </div>
          </div>

          {/* The Red/Green Card Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredStudents.length === 0 ? (
              <p className="text-gray-500 col-span-full">
                No students found in this class.
              </p>
            ) : (
              filteredStudents.map((student) => {
                // 🚀 CSS MAGIC: Define the background styling dynamically
                let bgStyle = "";
                let borderColor = "";
                let statusText = "";
                let textColor = "";

                if (student.status === "GREEN") {
                  bgStyle = "bg-white";
                  borderColor = "border-emerald-200 hover:border-emerald-400";
                  statusText = "Clear Standing";
                  textColor = "text-emerald-600";
                } else if (student.status === "RED") {
                  bgStyle = "bg-red-50";
                  borderColor =
                    "border-red-300 hover:border-red-500 shadow-[inset_0_0_20px_rgba(239,68,68,0.05)]";
                  statusText = "Action Required";
                  textColor = "text-red-600";
                } else if (student.status === "YELLOW") {
                  bgStyle = "bg-amber-50";
                  borderColor =
                    "border-amber-300 hover:border-amber-500 shadow-[inset_0_0_20px_rgba(245,158,11,0.05)]";
                  statusText = "Fine Pending";
                  textColor = "text-amber-600";
                } else if (student.status === "BOTH") {
                  // 🚀 THE HALF AND HALF EFFECT using a sharp CSS linear-gradient!
                  bgStyle =
                    "bg-[linear-gradient(135deg,#fef2f2_50%,#fffbeb_50%)]";
                  borderColor =
                    "border-orange-300 hover:border-orange-500 shadow-md";
                  statusText = "Action & Fine Pending";
                  textColor = "text-orange-600";
                }

                return (
                  <Link
                    key={student.id}
                    href={`/usthad/students/${student.id}`}
                    className={`relative p-5 rounded-2xl border transition-all hover:scale-[1.02] hover:shadow-lg group overflow-hidden ${bgStyle} ${borderColor}`}
                  >
                    {/* Status Indicator Icons */}
                    <div className="absolute right-4 top-4 flex gap-1">
                      {(student.status === "RED" ||
                        student.status === "BOTH") && (
                        <div className="w-8 h-8 rounded-full bg-red-200 flex items-center justify-center animate-pulse shadow-sm">
                          <ShieldAlert size={16} className="text-red-700" />
                        </div>
                      )}
                      {(student.status === "YELLOW" ||
                        student.status === "BOTH") && (
                        <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center animate-pulse shadow-sm">
                          <Coins size={16} className="text-amber-700" />
                        </div>
                      )}
                      {student.status === "GREEN" && (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shadow-sm">
                          <ShieldCheck size={16} className="text-emerald-600" />
                        </div>
                      )}
                    </div>

                    <div className="pr-16">
                      <p
                        className={`text-[10px] font-black uppercase tracking-wider mb-1 ${textColor}`}
                      >
                        {statusText}
                      </p>
                      <h3
                        className={`font-bold text-lg leading-tight capitalize ${student.status === "GREEN" ? "text-gray-900" : "text-gray-900"}`}
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
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
