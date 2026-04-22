"use client";

import { useState, useEffect, useMemo } from "react";
import { Award, Search, User, CheckCircle2, Filter } from "lucide-react";

export default function RecordAchievementPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("All"); // 🚀 New State for Class Filter
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const [title, setTitle] = useState("");
  const [points, setPoints] = useState("");
  const [isSpecialHighlight, setIsSpecialHighlight] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

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

  // 🚀 Extract unique classes from the student list
  const availableClasses = useMemo(() => {
    const classes = new Set(students.map((s) => s.class).filter(Boolean));
    return [
      "All",
      ...Array.from(classes).sort((a, b) => parseInt(a) - parseInt(b)),
    ];
  }, [students]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 🚀 Strict Point Validation (1 to 20)
    const pointsNum = Number(points);
    if (pointsNum < 1 || pointsNum > 20) {
      alert(
        "Invalid Points! Achievements can only be between 1 and 20 points.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
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
            title,
            points: pointsNum,
            isSpecialHighlight,
          }),
        },
      );

      if (res.ok) {
        setSuccess(true);
        setTitle("");
        setPoints("");
        setIsSpecialHighlight(false);
        setSelectedStudent(null);
        setTimeout(() => setSuccess(false), 4000);
      } else {
        alert("Failed to record achievement.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚀 Filter students by BOTH Search Term AND Selected Class
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === "All" || s.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeInUp">
      <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 flex items-center gap-4 shadow-sm">
        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg text-white">
          <Award size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-emerald-900 tracking-tight">
            Record Achievement
          </h1>
          <p className="text-emerald-700 font-medium">
            Log student publications, welfare acts, or library milestones.
          </p>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-400 text-emerald-800 p-5 rounded-xl flex items-center gap-4 font-bold animate-slideIn shadow-sm">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle2 size={24} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-lg">Achievement successfully recorded!</p>
            <p className="text-sm font-medium opacity-80">
              The student's points have been updated.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🚀 STUDENT SELECTION CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg border-b pb-3">
            <User size={20} className="text-emerald-600" /> 1. Select Student
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
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-black font-medium transition-all"
              />
            </div>

            <div className="relative w-32">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-600"
                size={16}
              />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-emerald-900 font-bold cursor-pointer appearance-none transition-all"
              >
                {availableClasses.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Classes" : `Class ${c}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[400px]">
            {filteredStudents.length === 0 ? (
              <p className="text-center text-gray-400 py-8 font-medium">
                No students found matching your criteria.
              </p>
            ) : (
              filteredStudents.map((student) => (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${
                    selectedStudent?.id === student.id
                      ? "bg-gradient-to-r from-emerald-50 to-emerald-100 border-emerald-400 shadow-sm"
                      : "hover:bg-gray-50 border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div>
                    <p
                      className={`font-bold capitalize ${selectedStudent?.id === student.id ? "text-emerald-900" : "text-gray-800"}`}
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
                        ? "bg-emerald-200 text-emerald-800"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    Class {student.class}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 🚀 ACHIEVEMENT FORM CARD */}
        <div
          className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-200 transition-all duration-300 ${
            !selectedStudent
              ? "opacity-60 grayscale-[0.5] pointer-events-none"
              : ""
          }`}
        >
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg border-b pb-3">
            <Award size={20} className="text-emerald-600" /> 2. Achievement
            Details
          </h2>

          <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 mb-6 shadow-inner">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
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
                Title / Publication Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Published article in Campus Magazine"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 font-medium transition-all"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                <span className="text-emerald-500 font-bold mt-0.5">ℹ️</span>
                Your department name (e.g. "[Welfare]") will automatically be
                added to the title.
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
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-emerald-600 text-lg">
                  +
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  max="20" // 🚀 HTML validation constraint
                  placeholder="Max: 20"
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-emerald-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-black text-emerald-900 bg-emerald-50/50 text-lg transition-all"
                />
              </div>
            </div>

            {/* Special Highlight Checkbox */}
            <div
              className="flex items-start gap-3 bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-xl border border-amber-200 transition-all hover:shadow-md cursor-pointer"
              onClick={() => setIsSpecialHighlight(!isSpecialHighlight)}
            >
              <div className="pt-0.5">
                <input
                  type="checkbox"
                  id="specialHighlight"
                  checked={isSpecialHighlight}
                  onChange={(e) => setIsSpecialHighlight(e.target.checked)}
                  className="w-5 h-5 text-amber-600 bg-white border-amber-300 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer"
                  onClick={(e) => e.stopPropagation()} // Prevent double-trigger from parent div click
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
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-black text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed mt-4"
            >
              {isSubmitting ? "Saving Record..." : "Confirm & Award Points"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
