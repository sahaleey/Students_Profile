"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import {
  Award,
  Search,
  User,
  CheckCircle2,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";

// 🚀 1. We move the main logic into an inner component
function AchievementManager() {
  const searchParams = useSearchParams();
  // Read the ?dept= from the URL. If it's missing, default to "General"
  const department = searchParams.get("dept") || "General";

  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("All");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // 🚀 Added Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8; // Adjust this to show more/less students per page

  const [title, setTitle] = useState("");
  const [points, setPoints] = useState("");
  const [isSpecialHighlight, setIsSpecialHighlight] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchStudents = async () => {
      const res = await fetch(
        "https://students-profile.onrender.com/usthad/students",
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (res.ok) setStudents(await res.json());
    };
    fetchStudents();
  }, []);

  const availableClasses = useMemo(() => {
    const classes = new Set(students.map((s) => s.class).filter(Boolean));
    return [
      "All",
      ...Array.from(classes).sort((a, b) => parseInt(a) - parseInt(b)),
    ];
  }, [students]);

  // 🚀 Reset to Page 1 whenever a search or filter changes!
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClass]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pointsNum = Number(points);
    if (pointsNum < 1 || pointsNum > 20) {
      toast.error("Achievements can only be between 1 and 20 points.");
      return;
    }

    const toastId = toast.loading("Recording achievement...");
    setIsSubmitting(true);

    try {
      // Format the title to include the department! e.g., "[Library] Read 5 books"
      const formattedTitle = `[${department}] ${title}`;

      const res = await fetch(
        "https://students-profile.onrender.com/staff/achievements",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            studentId: selectedStudent.id,
            title: formattedTitle,
            points: pointsNum,
            isSpecialHighlight,
            department: department,
          }),
        },
      );

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to record achievement.");
      }

      toast.success(`${department} achievement recorded!`, { id: toastId });
      setTitle("");
      setPoints("");
      setIsSpecialHighlight(false);
      setSelectedStudent(null);
    } catch (error: any) {
      toast.error(`Oops: ${error.message}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === "All" || s.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  // 🚀 Calculate Pagination Data
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // Dynamic styling based on department
  const theme =
    department === "Library"
      ? "amber"
      : department === "Outreach"
        ? "blue"
        : department === "Welfare"
          ? "red"
          : "rose";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeInUp">
      {/* Dynamic Header matching the department */}
      <div
        className={`bg-${theme}-50 p-6 rounded-3xl border border-${theme}-200 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm`}
      >
        <div className="flex items-center gap-4">
          <div
            className={`w-14 h-14 bg-gradient-to-br from-${theme}-500 to-${theme}-600 rounded-2xl flex items-center justify-center shadow-lg text-white`}
          >
            <Award size={28} />
          </div>
          <div>
            <h1
              className={`text-3xl font-black text-${theme}-900 tracking-tight`}
            >
              Record {department} Achievement
            </h1>
            <p className={`text-${theme}-700 font-medium`}>
              Grant points under the {department} department category.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* STUDENT SELECTION CARD */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg border-b pb-3">
            <User size={20} className={`text-${theme}-600`} /> 1. Select Student
          </h2>

          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-${theme}-500 text-black font-medium transition-all`}
              />
            </div>

            <div className="relative w-32">
              <Filter
                className={`absolute left-3 top-1/2 -translate-y-1/2 text-${theme}-600`}
                size={16}
              />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className={`w-full pl-9 pr-4 py-2.5 bg-${theme}-50 border border-${theme}-200 rounded-xl outline-none focus:ring-2 focus:ring-${theme}-500 text-${theme}-900 font-bold cursor-pointer appearance-none transition-all`}
              >
                {availableClasses.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Classes" : `Class ${c}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 🚀 Changed to map over paginatedStudents and added min-height */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-2 min-h-[350px]">
            {paginatedStudents.length === 0 ? (
              <p className="text-center text-gray-400 py-8 font-medium">
                No students found matching your criteria.
              </p>
            ) : (
              paginatedStudents.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${
                    selectedStudent?.id === student.id
                      ? `bg-gradient-to-r from-${theme}-50 to-${theme}-100 border-${theme}-400 shadow-sm`
                      : "hover:bg-gray-50 border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div>
                    <p
                      className={`font-bold capitalize ${selectedStudent?.id === student.id ? `text-${theme}-900` : "text-gray-800"}`}
                    >
                      {student.fullName}
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      Admn: {student.username}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                      selectedStudent?.id === student.id
                        ? `bg-${theme}-200 text-${theme}-800`
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    Class {student.class}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* 🚀 Pagination Controls Footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} />
              </button>

              <span className="text-sm font-bold text-gray-500 bg-gray-50 px-4 py-1.5 rounded-lg">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* ACHIEVEMENT FORM CARD */}
        <div
          className={`bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-all duration-300 ${!selectedStudent ? "opacity-60 grayscale-[0.5] pointer-events-none" : ""}`}
        >
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg border-b pb-3">
            <Award size={20} className={`text-${theme}-600`} /> 2. Achievement
            Details
          </h2>

          <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100 mb-6 shadow-inner">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
              Awarding points to
            </p>
            {selectedStudent ? (
              <p className="font-black text-lg text-gray-900 capitalize flex items-center gap-2">
                {selectedStudent.fullName}
                <span className="bg-gray-200 text-gray-700 text-[10px] px-2 py-0.5 rounded-full">
                  Class {selectedStudent.class}
                </span>
              </p>
            ) : (
              <p className="font-medium text-gray-400 italic">
                Please select a student first...
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1.5">
                Completed Work
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Read 5 books this month"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-${theme}-500 text-gray-900 font-medium transition-all`}
              />
              <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                <span className={`text-${theme}-500 font-bold mt-0.5`}>ℹ️</span>
                The tag <strong>[{department}]</strong> will automatically be
                added to this title.
              </p>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1.5">
                Points to Award{" "}
                <span className="text-xs text-gray-400 font-normal ml-1">
                  (Max 20)
                </span>
              </label>
              <div className="relative">
                <span
                  className={`absolute left-4 top-1/2 -translate-y-1/2 font-black text-${theme}-600 text-lg`}
                >
                  +
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  max="20"
                  placeholder="Max: 20"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border border-${theme}-200 rounded-xl outline-none focus:ring-2 focus:ring-${theme}-500 font-black text-${theme}-900 bg-${theme}-50/50 text-lg transition-all`}
                />
              </div>
            </div>

            <div
              className="flex items-start gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200 transition-all hover:shadow-md cursor-pointer"
              onClick={() => setIsSpecialHighlight(!isSpecialHighlight)}
            >
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  checked={isSpecialHighlight}
                  onChange={(e) => setIsSpecialHighlight(e.target.checked)}
                  className="w-5 h-5 text-amber-600 bg-white border-amber-300 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <div className="flex flex-col select-none">
                <span className="font-black text-amber-900 text-sm flex items-center gap-1.5">
                  Mark as Campus Spotlight 🌟
                </span>
                <span className="text-xs text-amber-700/90 mt-1 font-medium leading-relaxed">
                  Feature this specific achievement heavily on the public Campus
                  Dashboard until the end of the month.
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedStudent}
              className={`w-full bg-gradient-to-r from-${theme}-500 to-${theme}-600 hover:from-${theme}-600 hover:to-${theme}-700 text-white font-black text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed mt-4`}
            >
              {isSubmitting ? "Saving Record..." : "Confirm & Award Points"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

// 2. The Main Page exports the Suspense boundary
export default function RecordAchievementPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-[#004643] border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <AchievementManager />
    </Suspense>
  );
}
