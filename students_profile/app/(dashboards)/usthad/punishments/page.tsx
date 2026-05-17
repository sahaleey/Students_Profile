"use client";

import { useState, useEffect } from "react";
import {
  UserPlus,
  FileText,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Search,
  Trash2,
  Coins,
  ShieldAlert,
  ChevronLeft, // 🚀 Added
  ChevronRight, // 🚀 Added
} from "lucide-react";
import toast from "react-hot-toast"; // Ensure you have this installed from the previous steps!

interface Student {
  id: string;
  name: string;
  username: string; // The Admission Number
  className: string;
}

interface RawStudent {
  id: string;
  fullName: string;
  username: string;
  class: string;
}

interface Punishment {
  id: string;
  studentId: string;
  student?: {
    fullName: string;
  };
  title: string;
  category: string;
  description: string;
  status: "ACTIVE" | "RESOLVED";
}

export default function PunishmentsPage() {
  const [step, setStep] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionType, setActionType] = useState("PUNISHMENT");

  // 🚀 Added Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // API States
  const [rawStudents, setRawStudents] = useState<RawStudent[]>([]);
  const [punishments, setPunishments] = useState<Punishment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "Public Behavior",
    description: "",
  });

  const getToken = () => localStorage.getItem("token");

  // 1. FETCH DATA ON LOAD
  const fetchData = async () => {
    try {
      const token = getToken();
      // Fetch Students
      const studentRes = await fetch("http://localhost:3001/usthad/students", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (studentRes.ok) setRawStudents(await studentRes.json());

      // Fetch Punishments History
      const punishRes = await fetch(
        "http://localhost:3001/usthad/punishments",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (punishRes.ok) setPunishments(await punishRes.json());
    } catch (error) {
      console.error("Failed to fetch data:", error);
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

  // 3. SUBMIT PUNISHMENT TO BACKEND
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:3001/usthad/punishments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          studentId: selectedStudent.id,
          ...formData,
          actionType,
        }),
      });

      if (!response.ok) throw new Error("Failed to assign punishment");

      // Success! Reset everything and refresh the history list
      setFormData({ title: "", category: "Public Behavior", description: "" });
      resetWizard();
      await fetchData(); // Refresh the right column!
      toast.success("Action applied successfully!");
    } catch (error) {
      toast.error("Error assigning action. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemovePunishment = async (punishmentId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this record? This cannot be undone.",
      )
    ) {
      return;
    }

    // Optimistic UI Update: Instantly remove it from the screen
    setPunishments((prev) => prev.filter((p) => p.id !== punishmentId));

    try {
      const response = await fetch(
        `http://localhost:3001/usthad/punishments/${punishmentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${getToken()}`,
          },
        },
      );

      if (!response.ok) throw new Error("Failed to delete");
      toast.success("Record deleted.");
    } catch (error) {
      toast.error("Error removing record. Refreshing list.");
      await fetchData(); // Put it back on the screen if the server failed
    }
  };

  // Handlers
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setStep(2);
  };

  const resetWizard = () => {
    setSelectedStudent(null);
    setStep(1);
    setSearchTerm("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT COLUMN: MULTI-STEP  */}
      <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden flex flex-col h-[600px]">
        {/* Step Tracker Header */}
        <div className="bg-red-50 p-4 border-b border-red-100">
          <div className="flex items-center justify-between relative">
            <div
              className={`flex flex-col items-center z-10 ${step >= 1 ? "text-red-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 border-2 ${step >= 1 ? "bg-red-100 border-red-600" : "bg-gray-50 border-gray-300"}`}
              >
                1
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">
                Select
              </span>
            </div>
            <div
              className={`absolute top-4 left-8 right-8 h-[2px] z-0 ${step === 2 ? "bg-red-600" : "bg-gray-300"}`}
            />
            <div
              className={`flex flex-col items-center z-10 ${step === 2 ? "text-red-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 border-2 ${step === 2 ? "bg-red-100 border-red-600" : "bg-gray-50 border-gray-300"}`}
              >
                2
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">
                Details
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="p-4 flex-1 flex flex-col overflow-y-auto">
          {/* STEP 1: CLASS-WISE STUDENT LIST */}
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
                  className="w-full pl-10 text-black pr-4 py-2 bg-[#fafafa] border border-gray-200 rounded-xl outline-none focus:border-red-500 transition-colors text-sm"
                />
              </div>

              {/* 🚀 Render Paginated Students */}
              <div className="flex-1 overflow-y-auto space-y-2 min-h-[350px]">
                {paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student) => (
                    <button
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className="w-full flex items-center justify-between p-3 bg-[#fafafa] border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-colors group text-left"
                    >
                      <div>
                        <p className="font-bold text-gray-800 capitalize">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          Ad No: {student.username}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black uppercase px-2 py-1 rounded-md bg-red-100 text-red-800">
                          Class {student.className}
                        </span>
                        <UserPlus
                          size={18}
                          className="text-gray-400 group-hover:text-red-500 transition-colors"
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

          {/* STEP 2: PUNISHMENT FORM */}
          {step === 2 && selectedStudent && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 bg-red-50 p-3 rounded-xl border border-red-100">
                <button
                  onClick={resetWizard}
                  className="p-1 hover:bg-red-200 rounded-lg text-red-700 transition-colors"
                  title="Back to list"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <p className="text-xs text-red-600 font-bold uppercase">
                    Assigning to:
                  </p>
                  <p className="font-bold text-red-900 capitalize flex items-center gap-2">
                    {selectedStudent.name}
                    <span className="bg-red-200/50 text-red-800 text-[10px] px-2 py-0.5 rounded-full">
                      Class {selectedStudent.className}
                    </span>
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex gap-4 mb-4">
                  <label
                    className={`flex-1 cursor-pointer p-4 border rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                      actionType === "PUNISHMENT"
                        ? "bg-red-50 border-red-500 text-red-700 shadow-sm"
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      className="hidden"
                      checked={actionType === "PUNISHMENT"}
                      onChange={() => setActionType("PUNISHMENT")}
                    />
                    <ShieldAlert size={18} /> Disciplinary Action
                  </label>

                  <label
                    className={`flex-1 cursor-pointer p-4 border rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${
                      actionType === "FINE"
                        ? "bg-amber-50 border-amber-500 text-amber-700 shadow-sm"
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <input
                      type="radio"
                      className="hidden"
                      checked={actionType === "FINE"}
                      onChange={() => setActionType("FINE")}
                    />
                    <Coins size={18} /> Monetary Fine
                  </label>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">
                    Action Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Library Duty"
                    className="w-full text-black mt-1 p-2 bg-[#fafafa] border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700">
                    Category / Reason
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full text-black mt-1 p-2 bg-[#fafafa] border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  >
                    <option value="Public Behavior">Public Behavior</option>
                    <option value="Academics">Academics</option>
                    <option value="Computer Lab">Computer Lab</option>
                    <option value="Library">Library</option>
                    <option value="Masjid Attendance">Masjid Attendance</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700">
                    Detailed Description
                  </label>
                  <textarea
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    placeholder="Describe the incident..."
                    className="w-full text-black mt-1 p-2 bg-[#fafafa] border border-gray-200 rounded-xl outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 min-h-[80px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 disabled:opacity-70"
                >
                  <AlertCircle size={18} />{" "}
                  {isSubmitting ? "Assigning..." : "Apply Punishment"}
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
            <FileText size={18} className="text-gray-500" /> Corrective Path
            Records
          </h2>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {punishments.length === 0 ? (
            <p className="text-center text-gray-400 mt-10">
              No Actions recorded yet.
            </p>
          ) : (
            punishments.map((p) => (
              <div
                key={p.id}
                className="flex justify-between items-center p-4 border border-gray-100 rounded-xl bg-[#fafafa] hover:shadow-sm transition-shadow"
              >
                <div>
                  {/* Dynamic Student Data */}
                  <p className="font-bold text-gray-800 capitalize">
                    {p.student?.fullName || "Unknown Student"}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{p.title}</p>
                </div>
                {/* 🚀 3. THE ACTION BUTTONS */}
                <div className="flex items-center gap-3">
                  <span
                    className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      p.status !== "RESOLVED"
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {p.status === "RESOLVED" && <CheckCircle2 size={14} />}
                    {p.status || "ACTIVE"}
                  </span>

                  {/* Delete Button */}
                  <button
                    onClick={() => handleRemovePunishment(p.id)}
                    className="p-2 text-black hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete Record"
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
