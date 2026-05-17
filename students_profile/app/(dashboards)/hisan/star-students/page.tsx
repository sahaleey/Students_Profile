"use client";

import { useState, useEffect } from "react";
import { Star, Medal, ShieldCheck, ChevronRight, Award } from "lucide-react";
import Link from "next/link";

type StarStudent = {
  id: string;
  fullName: string;
  class?: string;
  currentMonthPoints: number;
};

type StarStudentsResponse = {
  activeMonthName?: string;
  minPoints?: number;
  students?: StarStudent[];
};

export default function StarStudentsPage() {
  const [starStudents, setStarStudents] = useState<StarStudent[]>([]);
  const [activeMonthName, setActiveMonthName] = useState("Current Period");
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("http://localhost:3001/usthad/star-students", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          const payload: StarStudentsResponse = await res.json();
          setStarStudents(payload.students || []);
          setActiveMonthName(payload.activeMonthName || "Current Period");
        }
      } catch {
        console.error("Failed to fetch students");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-linear-to-br from-yellow-400 to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
            <Star size={28} className="text-white fill-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Wall of Fame</h1>
            <p className="text-gray-500 mt-1 font-medium">
              Students with 100+ points in {activeMonthName}.
            </p>
          </div>
        </div>

        <div className="bg-yellow-50 px-4 py-2 rounded-xl border border-yellow-200 flex items-center gap-2">
          <ShieldCheck size={20} className="text-yellow-600" />
          <span className="font-bold text-yellow-800">
            {starStudents.length} Star Students
          </span>
        </div>
      </div>

      {isLoading ? (
        <p className="text-center text-yellow-600 font-bold animate-pulse mt-10">
          Searching for Elites...
        </p>
      ) : starStudents.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
          <Award size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800">
            No Star Students Yet
          </h3>
          <p className="text-gray-500 mt-2">
            No one has reached the 100-point milestone this period.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {starStudents.map((student, index) => (
            <Link
              key={student.id}
              href={`/hisan/points/${student.id}`}
              className="bg-white rounded-2xl border border-yellow-200 shadow-sm hover:shadow-xl hover:border-yellow-400 transition-all p-6 group relative overflow-hidden"
            >
              {/* Decorative Background */}
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-linear-to-br from-yellow-100 to-yellow-50 rounded-full blur-xl group-hover:scale-150 transition-transform" />

              <div className="flex justify-between items-start relative z-10">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-black shadow-inner ${
                      index === 0
                        ? "bg-linear-to-br from-yellow-300 to-yellow-500 text-white"
                        : index === 1
                          ? "bg-linear-to-br from-gray-300 to-gray-400 text-white"
                          : index === 2
                            ? "bg-linear-to-br from-orange-300 to-orange-500 text-white"
                            : "bg-yellow-50 text-yellow-600"
                    }`}
                  >
                    {index < 3 ? <Medal size={20} /> : `#${index + 1}`}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg capitalize group-hover:text-yellow-600 transition-colors">
                      {student.fullName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      Class {student.class}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-end justify-between relative z-10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">
                    Current Period
                  </p>
                  <p className="text-3xl font-black text-emerald-600">
                    {student.currentMonthPoints}{" "}
                    <span className="text-sm font-bold text-emerald-600/60">
                      pts
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Audit <ChevronRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
