"use client";

import { useState, useEffect } from "react";
import {
  UserPlus,
  ArrowLeft,
  Search,
  Trophy,
  Medal,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

interface Student {
  id: string;
  name: string;
  username: string;
  className: string;
}

interface RawStudent {
  id: string;
  fullName: string;
  username: string;
  class?: string;
}

interface Achievement {
  id: string;
  studentId: string;
  student?: {
    fullName: string;
  };
  title: string;
  points: number;
}

export default function AchievementsPage() {
  const [step, setStep] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [rawStudents, setRawStudents] = useState<RawStudent[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // 🚀 Added Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpecialHighlight, setIsSpecialHighlight] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    points: "",
  });

  const getToken = () => localStorage.getItem("token");

  // 1. FETCH DATA ON LOAD
  const fetchData = async () => {
    try {
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      const [stuRes, achRes] = await Promise.all([
        fetch("https://students-profile.onrender.com/usthad/students", {
          headers,
        }),
        fetch("https://students-profile.onrender.com/usthad/achievements", {
          headers,
        }),
      ]);

      if (stuRes.ok) setRawStudents(await stuRes.json());
      if (achRes.ok) setAchievements(await achRes.json());
    } catch (error: unknown) {
      console.error(
        "Failed to fetch data:",
        error instanceof Error ? error.message : error,
      );
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 🚀 Reset to Page 1 whenever search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // 2. FORMAT, FILTER & PAGINATE STUDENTS
  // Flattening the students for consistent pagination
  const flatStudents: Student[] = rawStudents.map((s) => ({
    id: s.id,
    name: s.fullName,
    username: s.username,
    className: s.class || "Unassigned",
  }));

  const filteredFlatStudents = flatStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages =
    Math.ceil(filteredFlatStudents.length / ITEMS_PER_PAGE) || 1;
  const paginatedStudents = filteredFlatStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // 3. SUBMIT ACHIEVEMENT
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !formData.title || !formData.points) return;

    const pointsValue = parseInt(formData.points, 10);

    // Using the increased limit here (update to 100 or whatever your backend supports)
    if (pointsValue < 1 || pointsValue > 20) {
      toast.error("Points must be between 1 and 20 per achievement.");
      return;
    }

    const toastId = toast.loading("Granting achievement...");
    setIsSubmitting(true);

    try {
      const response = await fetch(
        "https://students-profile.onrender.com/usthad/achievements",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            studentId: selectedStudent.id,
            title: formData.title,
            points: pointsValue,
            isSpecialHighlight: isSpecialHighlight,
          }),
        },
      );

      // BACKEND LAYER CHECK
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to grant achievement");
      }

      resetWizard();
      await fetchData();

      toast.success("Achievement granted successfully!", { id: toastId });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Oops: ${message}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. REMOVE ACHIEVEMENT
  const handleRemoveAchievement = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this achievement?"))
      return;

    setAchievements((prev) => prev.filter((a) => a.id !== id)); // Optimistic UI

    try {
      const response = await fetch(
        `https://students-profile.onrender.com/usthad/achievements/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Achievement removed.");
    } catch (error: unknown) {
      console.error(
        "Error removing achievement:",
        error instanceof Error ? error.message : error,
      );
      toast.error("Error removing achievement.");
      await fetchData();
    }
  };

  const resetWizard = () => {
    setSelectedStudent(null);
    setStep(1);
    setSearchTerm("");
    setFormData({ title: "", points: "" });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT COLUMN: MULTI-STEP */}
      <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden flex flex-col h-[600px]">
        <div className="bg-emerald-50 p-4 border-b border-emerald-100">
          <div className="flex items-center justify-between relative">
            <div
              className={`flex flex-col items-center z-10 ${step >= 1 ? "text-emerald-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 border-2 ${step >= 1 ? "bg-emerald-100 border-emerald-600" : "bg-gray-50 border-gray-300"}`}
              >
                1
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">
                Select
              </span>
            </div>
            <div
              className={`absolute top-4 left-8 right-8 h-[2px] z-0 ${step === 2 ? "bg-emerald-600" : "bg-gray-300"}`}
            />
            <div
              className={`flex flex-col items-center z-10 ${step === 2 ? "text-emerald-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 border-2 ${step === 2 ? "bg-emerald-100 border-emerald-600" : "bg-gray-50 border-gray-300"}`}
              >
                2
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">
                Award
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 flex flex-col overflow-y-auto">
          {step === 1 && (
            <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-4">
              <div className="relative mb-4">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name or admn no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-[#fafafa] border border-gray-200 rounded-xl text-black outline-none focus:border-emerald-500 transition-colors text-sm"
                />
              </div>

              {/* 🚀 Render Paginated Students */}
              <div className="flex-1 overflow-y-auto space-y-2 min-h-[350px]">
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => {
                        setSelectedStudent(student);
                        setStep(2);
                      }}
                      className="w-full flex items-center justify-between p-3 bg-[#fafafa] border border-gray-200 rounded-xl hover:border-emerald-300 hover:bg-emerald-50 transition-colors group text-left"
                    >
                      <div>
                        <p className="font-bold text-gray-800 capitalize">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Admn: {student.username}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase px-2 py-1 rounded-md bg-emerald-100 text-emerald-800">
                          Class {student.className}
                        </span>
                        <UserPlus
                          size={18}
                          className="text-gray-400 group-hover:text-emerald-500 transition-colors"
                        />
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-sm text-gray-500 mt-8">
                    No students found.
                  </p>
                )}
              </div>

              {/* 🚀 Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
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
          )}

          {step === 2 && selectedStudent && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 bg-emerald-50 p-3 rounded-xl border border-emerald-100">
                <button
                  onClick={resetWizard}
                  className="p-1 hover:bg-emerald-200 rounded-lg text-emerald-700 transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <p className="text-xs text-emerald-600 font-bold uppercase">
                    Awarding to:
                  </p>
                  <p className="font-bold text-emerald-900 capitalize flex items-center gap-2">
                    {selectedStudent.name}
                    <span className="bg-emerald-200/50 text-emerald-800 text-[10px] px-2 py-0.5 rounded-full">
                      Class {selectedStudent.className}
                    </span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-700">
                    Completed Work
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g. Won Quiz Competition"
                    className="w-full mt-1 p-2 bg-[#fafafa] border border-gray-200 rounded-lg outline-none text-black focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">
                    Points to Award
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.points}
                    onChange={(e) =>
                      setFormData({ ...formData, points: e.target.value })
                    }
                    placeholder="e.g. 10"
                    className="w-full mt-1 text-black p-2 bg-[#fafafa] border border-gray-200 rounded-lg outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                <div
                  className="flex items-start gap-3 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200 mt-4 transition-all hover:shadow-md cursor-pointer"
                  onClick={() => setIsSpecialHighlight(!isSpecialHighlight)}
                >
                  <div className="pt-0.5">
                    <input
                      type="checkbox"
                      id="specialHighlight"
                      checked={isSpecialHighlight}
                      onChange={(e) => setIsSpecialHighlight(e.target.checked)}
                      className="w-5 h-5 text-amber-600 bg-white border-amber-300 rounded focus:ring-amber-500 focus:ring-2 cursor-pointer"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <label
                    htmlFor="specialHighlight"
                    className="flex flex-col cursor-pointer select-none"
                  >
                    <span className="font-bold text-amber-900 text-sm flex items-center gap-1">
                      Mark as Special Highlight
                    </span>
                    <span className="text-xs text-amber-700/80 mt-0.5 leading-relaxed">
                      This will feature the student on all over the Campus
                      Dashboard until the end of the month!
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#004643] hover:bg-[#003634] text-white font-bold py-3 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  <Medal size={18} />{" "}
                  {isSubmitting ? "Granting..." : "Grant Achievement"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: LIST */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[600px] flex flex-col">
        <div className="bg-gray-50 p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <Trophy size={18} className="text-yellow-500" /> Achievement History
          </h2>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {achievements.length === 0 ? (
            <p className="text-center text-gray-400 mt-10">
              No achievements recorded yet.
            </p>
          ) : (
            achievements.map((a) => (
              <div
                key={a.id}
                className="flex justify-between items-center p-4 border border-gray-100 rounded-xl bg-[#fafafa] hover:shadow-sm transition-shadow group"
              >
                <div>
                  <p className="font-bold text-gray-800 capitalize">
                    {a.student?.fullName || "Unknown Student"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 capitalize">
                    {a.title}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-2xl font-black text-[#004643] bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 flex items-baseline gap-1">
                    +{a.points}
                    <span className="text-xs text-[#004643]/70 font-medium tracking-wider uppercase">
                      pts
                    </span>
                  </div>

                  {/* Delete Button (Hover to reveal) */}
                  <button
                    onClick={() => handleRemoveAchievement(a.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg "
                    title="Remove Achievement"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
