"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Trash2,
  Send,
  CheckCircle2,
  Search,
  ArrowLeft,
  UserPlus,
  Medal,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

interface Student {
  id: string;
  fullName: string;
  username: string;
  class: string;
  className?: string; // Used for flattened mapped data
}

interface Program {
  id: string;
  title: string;
  duration: string;
  status: string;
}

interface Winner {
  student: Student;
  rank: string;
  grade: string;
  points: number | string;
}

export default function SubWingResultsPage() {
  const [step, setStep] = useState(1);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [winners, setWinners] = useState<Winner[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [currentProgramPage, setCurrentProgramPage] = useState(1);
  const [currentStudentPage, setCurrentStudentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // 🚀 NEW: The maximum points an admin can award per winner
  const MAX_POINTS = 20;

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progRes, stuRes] = await Promise.all([
          fetch("https://students-profile.onrender.com/subwing/programs", {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
          fetch("https://students-profile.onrender.com/usthad/students", {
            headers: { Authorization: `Bearer ${getToken()}` },
          }),
        ]);
        if (progRes.ok) setPrograms(await progRes.json());
        if (stuRes.ok) setStudents(await stuRes.json());
      } catch (error) {
        toast.error("Failed to fetch data from the server.");
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentProgramPage(1);
    setCurrentStudentPage(1);
  }, [searchTerm, step]);

  // --- Step 1: Program Filtering & Pagination ---
  const activePrograms = programs.filter(
    (p) => p.status !== "Results Declared",
  );
  const filteredPrograms = activePrograms.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalProgramPages =
    Math.ceil(filteredPrograms.length / ITEMS_PER_PAGE) || 1;
  const paginatedPrograms = filteredPrograms.slice(
    (currentProgramPage - 1) * ITEMS_PER_PAGE,
    currentProgramPage * ITEMS_PER_PAGE,
  );

  // --- Step 2: Student Flattening & Pagination ---
  const flatStudents: Student[] = students.map((s) => ({
    ...s,
    className: s.class || "Unassigned",
  }));

  const filteredStudents = flatStudents.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalStudentPages =
    Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentStudentPage - 1) * ITEMS_PER_PAGE,
    currentStudentPage * ITEMS_PER_PAGE,
  );

  // --- Handlers ---
  const handleSelectProgram = (prog: Program) => {
    setSelectedProgram(prog);
    setSearchTerm("");
    setStep(2);
  };

  const handleAddWinner = (student: Student) => {
    if (winners.some((w) => w.student.id === student.id)) return;

    setWinners([
      ...winners,
      { student: student, rank: "1st", grade: "A", points: 10 },
    ]);
  };

  const handleRemoveWinner = (index: number) => {
    setWinners(winners.filter((_, i) => i !== index));
  };

  const handleWinnerChange = (
    index: number,
    field: string,
    value: string | number,
  ) => {
    const newWinners = [...winners];

    if (field === "points") {
      let parsedPoints =
        typeof value === "string" ? parseInt(value, 10) : value;

      // 🚀 NEW: Strict Point Limit Validation
      if (!isNaN(parsedPoints) && parsedPoints > MAX_POINTS) {
        toast.error(`Maximum ${MAX_POINTS} points allowed per winner!`);
        parsedPoints = MAX_POINTS; // Auto-correct to max
      }

      newWinners[index].points = isNaN(parsedPoints) ? "" : parsedPoints;
    } else if (field === "rank" || field === "grade") {
      (newWinners[index][
        field as keyof Omit<Winner, "student" | "points">
      ] as string) = String(value);
    }

    setWinners(newWinners);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProgram || winners.length === 0) {
      toast.error("Please select a program and at least one winner.");
      return;
    }

    // 🚀 NEW: Final validation guard before submitting
    for (const w of winners) {
      const pts = Number(w.points);
      if (!pts || pts < 1) {
        toast.error(`Please assign valid points to ${w.student.fullName}.`);
        return;
      }
      if (pts > MAX_POINTS) {
        toast.error(
          `${w.student.fullName} exceeds the maximum ${MAX_POINTS} points limit.`,
        );
        return;
      }
    }

    const toastId = toast.loading("Publishing results...");
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `https://students-profile.onrender.com/subwing/programs/${selectedProgram.id}/results`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            winners: winners.map((w) => ({
              studentId: w.student.id,
              rank: w.rank,
              grade: w.grade,
              points: parseInt(String(w.points), 10),
            })),
          }),
        },
      );

      if (!res.ok) throw new Error("Failed to publish results");

      toast.success("Results published & points awarded successfully!", {
        id: toastId,
      });
      setSelectedProgram(null);
      setWinners([]);
      setStep(1);

      setPrograms(programs.filter((p) => p.id !== selectedProgram.id));
    } catch (error) {
      toast.error("Error publishing results.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetWizard = () => {
    setSelectedProgram(null);
    setWinners([]);
    setStep(1);
    setSearchTerm("");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Trophy size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Declare Winners</h1>
          <p className="text-gray-500 mt-1 font-medium">
            Publish results and instantly award points to students.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: 2-STEP WIZARD */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-yellow-100 overflow-hidden flex flex-col h-[700px]">
          {/* Step Tracker */}
          <div className="bg-yellow-50 p-4 border-b border-yellow-100">
            <div className="flex items-center justify-between relative">
              <div
                className={`flex flex-col items-center z-10 ${step >= 1 ? "text-yellow-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 border-2 ${step >= 1 ? "bg-yellow-100 border-yellow-600" : "bg-gray-50 border-gray-300"}`}
                >
                  1
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Program
                </span>
              </div>
              <div
                className={`absolute top-4 left-8 right-8 h-[2px] z-0 ${step === 2 ? "bg-yellow-500" : "bg-gray-300"}`}
              />
              <div
                className={`flex flex-col items-center z-10 ${step === 2 ? "text-yellow-600" : "text-gray-400"}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 border-2 ${step === 2 ? "bg-yellow-100 border-yellow-600" : "bg-gray-50 border-gray-300"}`}
                >
                  2
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Students
                </span>
              </div>
            </div>
          </div>

          <div className="p-4 flex-1 flex flex-col overflow-y-auto">
            <div className="relative mb-4 shrink-0">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder={
                  step === 1
                    ? "Search programs..."
                    : "Search students by name or class..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#fafafa] border border-gray-200 text-black rounded-xl outline-none focus:border-yellow-500 transition-colors text-sm"
              />
            </div>

            {/* STEP 1: SHOW PROGRAMS */}
            {step === 1 && (
              <div className="flex-1 flex flex-col h-full animate-slideIn">
                <div className="flex-1 space-y-3 overflow-y-auto min-h-[350px]">
                  {paginatedPrograms.length > 0 ? (
                    paginatedPrograms.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectProgram(p)}
                        className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:border-yellow-400 hover:shadow-md transition-all group"
                      >
                        <h3 className="font-bold text-gray-800 group-hover:text-yellow-600 transition-colors">
                          {p.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          Ends: {p.duration}
                        </p>
                      </button>
                    ))
                  ) : (
                    <p className="text-center text-sm text-gray-500 mt-8">
                      No active programs found.
                    </p>
                  )}
                </div>

                {/* 🚀 Programs Pagination */}
                {totalProgramPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 shrink-0">
                    <button
                      type="button"
                      disabled={currentProgramPage === 1}
                      onClick={() =>
                        setCurrentProgramPage((prev) => Math.max(prev - 1, 1))
                      }
                      className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-bold text-gray-500 bg-gray-50 px-4 py-1.5 rounded-lg">
                      Page {currentProgramPage} of {totalProgramPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentProgramPage === totalProgramPages}
                      onClick={() =>
                        setCurrentProgramPage((prev) =>
                          Math.min(prev + 1, totalProgramPages),
                        )
                      }
                      className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: SHOW FLATTENED STUDENTS */}
            {step === 2 && (
              <div className="flex-1 flex flex-col h-full animate-slideIn">
                <div className="flex-1 space-y-2 overflow-y-auto min-h-[350px]">
                  {paginatedStudents.length > 0 ? (
                    paginatedStudents.map((student) => {
                      const isSelected = winners.some(
                        (w) => w.student.id === student.id,
                      );
                      return (
                        <button
                          key={student.id}
                          onClick={() => handleAddWinner(student)}
                          disabled={isSelected}
                          className={`w-full flex items-center justify-between p-3 rounded-xl border transition-colors text-left ${
                            isSelected
                              ? "bg-emerald-50 border-emerald-200 opacity-70 cursor-not-allowed"
                              : "bg-[#fafafa] border-gray-200 hover:border-yellow-400 hover:bg-yellow-50 group"
                          }`}
                        >
                          <div>
                            <p
                              className={`font-bold capitalize ${isSelected ? "text-emerald-800" : "text-gray-800"}`}
                            >
                              {student.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Admn: {student.username}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${isSelected ? "bg-emerald-200 text-emerald-800" : "bg-gray-200 text-gray-700"}`}
                            >
                              Class {student.className}
                            </span>
                            {isSelected ? (
                              <CheckCircle2
                                size={18}
                                className="text-emerald-500"
                              />
                            ) : (
                              <UserPlus
                                size={18}
                                className="text-gray-400 group-hover:text-yellow-600 transition-colors"
                              />
                            )}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <p className="text-center text-sm text-gray-500 mt-8">
                      No students found.
                    </p>
                  )}
                </div>

                {/* 🚀 Students Pagination */}
                {totalStudentPages > 1 && (
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 shrink-0">
                    <button
                      type="button"
                      disabled={currentStudentPage === 1}
                      onClick={() =>
                        setCurrentStudentPage((prev) => Math.max(prev - 1, 1))
                      }
                      className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-bold text-gray-500 bg-gray-50 px-4 py-1.5 rounded-lg">
                      Page {currentStudentPage} of {totalStudentPages}
                    </span>
                    <button
                      type="button"
                      disabled={currentStudentPage === totalStudentPages}
                      onClick={() =>
                        setCurrentStudentPage((prev) =>
                          Math.min(prev + 1, totalStudentPages),
                        )
                      }
                      className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: WINNERS BOARD */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[700px]">
          {!selectedProgram ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
              <Medal size={64} className="mb-4 text-gray-200" />
              <h3 className="text-xl font-bold text-gray-700">
                No Program Selected
              </h3>
              <p className="mt-2">
                Choose a program from the left to start declaring winners.
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="bg-gray-900 p-5 text-white flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-yellow-500 text-yellow-900 px-2 py-1 rounded mb-1 inline-block">
                    Results Declaration
                  </span>
                  <h2 className="font-bold text-xl capitalize">
                    {selectedProgram.title}
                  </h2>
                </div>
                <button
                  onClick={resetWizard}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Change Program"
                >
                  <ArrowLeft size={20} />
                </button>
              </div>

              {/* Winners Configuration */}
              <form
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6 bg-gray-50 flex flex-col"
              >
                <div className="flex-1 space-y-4">
                  {winners.length === 0 ? (
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-500 bg-white">
                      Click students from the left list to add them as winners.
                    </div>
                  ) : (
                    winners.map((winner, index) => (
                      <div
                        key={index}
                        className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-yellow-200 shadow-sm relative group"
                      >
                        <div className="w-full sm:flex-1">
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                            Student
                          </p>
                          <p className="font-bold text-gray-900 text-lg capitalize">
                            {winner.student.fullName}
                          </p>
                          <p className="text-xs text-gray-500">
                            Class {winner.student.class} • Admn:{" "}
                            {winner.student.username}
                          </p>
                        </div>

                        <div className="flex gap-3 w-full sm:w-auto">
                          <div className="w-24">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                              Rank
                            </label>
                            <select
                              value={winner.rank}
                              onChange={(e) =>
                                handleWinnerChange(
                                  index,
                                  "rank",
                                  e.target.value,
                                )
                              }
                              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-yellow-500 text-sm text-black cursor-pointer"
                            >
                              <option value="">None</option>
                              <option value="1st">1st</option>
                              <option value="2nd">2nd</option>
                              <option value="3rd">3rd</option>
                            </select>
                          </div>

                          <div className="w-20">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                              Grade
                            </label>
                            <select
                              value={winner.grade}
                              onChange={(e) =>
                                handleWinnerChange(
                                  index,
                                  "grade",
                                  e.target.value,
                                )
                              }
                              className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:border-yellow-500 text-sm text-black cursor-pointer"
                            >
                              <option value="">None</option>
                              <option value="A+">A+</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              <option value="C">C</option>
                            </select>
                          </div>

                          <div className="w-24">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                              Points
                            </label>
                            <input
                              type="number"
                              required
                              min="1"
                              max={MAX_POINTS}
                              value={winner.points}
                              onChange={(e) =>
                                handleWinnerChange(
                                  index,
                                  "points",
                                  e.target.value,
                                )
                              }
                              className="w-full p-2 bg-emerald-50 border border-emerald-200 rounded-lg outline-none focus:ring-1 focus:ring-emerald-500 text-sm font-black text-emerald-700 text-center"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleRemoveWinner(index)}
                          className="absolute -right-2 -top-2 bg-red-100 text-red-600 p-1.5 rounded-full hover:bg-red-200 transition-colors shadow-sm opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || winners.length === 0}
                  className="w-full mt-6 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 transform hover:-translate-y-0.5"
                >
                  <Send size={18} />{" "}
                  {isSubmitting
                    ? "Publishing Results..."
                    : `Publish ${winners.length} Winner(s)`}
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
