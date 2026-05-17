"use client";

import { useState, useEffect } from "react";
import {
  Megaphone,
  CalendarPlus,
  FileText,
  AlignLeft,
  Info,
  Clock,
  CheckCircle2,
  Plus,
  ArrowLeft,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";

export default function SubWingProgramsPage() {
  // 🚀 View State: 'LIST' or 'FORM'
  const [view, setView] = useState<"LIST" | "FORM">("LIST");
  const [programs, setPrograms] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🚀 Detail & Edit States
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingProgram, setEditingProgram] = useState<any | null>(null);

  // 🚀 Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    eligibility: "",
    conditions: "",
  });

  const getToken = () => localStorage.getItem("token");

  // FETCH PROGRAMS
  const fetchPrograms = async () => {
    try {
      const res = await fetch(
        "https://students-profile.onrender.com/subwing/programs",
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (res.ok) setPrograms(await res.json());
    } catch (error) {
      toast.error("Failed to fetch programs");
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  // 🚀 Calculate Pagination Data
  const totalPages = Math.ceil(programs.length / ITEMS_PER_PAGE) || 1;
  const paginatedPrograms = programs.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // CREATE OR EDIT SUBMISSION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const toastId = toast.loading(
      editingProgram ? "Updating program..." : "Launching program...",
    );
    setIsSubmitting(true);

    try {
      const url = editingProgram
        ? `https://students-profile.onrender.com/subwing/programs/${editingProgram.id}` // PUT endpoint
        : "https://students-profile.onrender.com/subwing/programs"; // POST endpoint

      const method = editingProgram ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to save program");

      toast.success(
        editingProgram ? "Program updated!" : "Program launched successfully!",
        { id: toastId },
      );

      resetForm();
      setView("LIST");
      await fetchPrograms();
    } catch (error) {
      toast.error("Error saving program", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚀 DELETE PROGRAM
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this program?"))
      return;

    try {
      const res = await fetch(
        `https://students-profile.onrender.com/subwing/programs/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      if (!res.ok) throw new Error("Delete failed");

      toast.success("Program deleted successfully!");

      // Safety check for pagination if deleting the last item on a page
      if (paginatedPrograms.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }

      await fetchPrograms();
    } catch (error) {
      toast.error("Failed to delete program.");
    }
  };

  const handleEditClick = (prog: any) => {
    setEditingProgram(prog);
    setFormData({
      title: prog.title,
      description: prog.description,
      duration: prog.duration,
      eligibility: prog.eligibility,
      conditions: prog.conditions || "",
    });
    setView("FORM");
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      duration: "",
      eligibility: "",
      conditions: "",
    });
    setEditingProgram(null);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Megaphone size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Program Management
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              Create and manage your wing's events.
            </p>
          </div>
        </div>

        {/* 🚀 Dynamic Action Button */}
        {view === "LIST" ? (
          <button
            onClick={() => {
              resetForm();
              setView("FORM");
            }}
            className="bg-indigo-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:bg-indigo-700 transition-all flex items-center gap-2 hover:scale-105 active:scale-95"
          >
            <Plus size={18} /> Launch New Program
          </button>
        ) : (
          <button
            onClick={() => {
              setView("LIST");
              resetForm();
            }}
            className="bg-white border border-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2"
          >
            <ArrowLeft size={18} /> Back to Programs
          </button>
        )}
      </div>

      {/* 🚀 CONDITIONAL RENDERING BASED ON VIEW */}
      {view === "LIST" ? (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col min-h-[500px]">
          <div className="bg-gray-50 p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-bold text-lg text-gray-800">My Programs</h2>
            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
              {programs.length} Total
            </span>
          </div>

          <div className="flex-1 p-6 space-y-4">
            {paginatedPrograms.length === 0 ? (
              <div className="text-center py-16">
                <CalendarPlus
                  size={48}
                  className="mx-auto text-gray-300 mb-4"
                />
                <p className="text-gray-500 font-medium">
                  No programs launched yet.
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Click "Launch New Program" to get started.
                </p>
              </div>
            ) : (
              paginatedPrograms.map((prog) => {
                const isExpanded = expandedId === prog.id;

                return (
                  <div
                    key={prog.id}
                    className={`rounded-2xl border transition-all duration-300 ${
                      isExpanded
                        ? "border-indigo-300 shadow-md bg-white"
                        : "border-gray-200 bg-gray-50 hover:bg-white hover:border-indigo-200"
                    }`}
                  >
                    {/* Compact View Header (Clickable) */}
                    <div
                      onClick={() => setExpandedId(isExpanded ? null : prog.id)}
                      className="p-5 cursor-pointer flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span
                            className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${
                              prog.status === "Ongoing"
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {prog.status || "Ongoing"}
                          </span>
                          <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                            <Clock size={12} /> {prog.duration}
                          </span>
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 capitalize">
                          {prog.title}
                        </h3>
                      </div>
                      <div className="text-gray-400 hover:text-indigo-600 transition-colors bg-white p-2 rounded-full shadow-sm border border-gray-100">
                        {isExpanded ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </div>
                    </div>

                    {/* 🚀 Expanded Details View */}
                    {isExpanded && (
                      <div className="p-5 border-t border-indigo-100 bg-indigo-50/30 rounded-b-2xl animate-slideIn">
                        <p className="text-gray-700 mb-5 leading-relaxed">
                          {prog.description}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                          <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                              Eligibility
                            </span>
                            <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                              <Info size={14} className="text-indigo-500" />{" "}
                              {prog.eligibility}
                            </span>
                          </div>
                          {prog.conditions && (
                            <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                                Special Conditions
                              </span>
                              <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                <AlignLeft
                                  size={14}
                                  className="text-indigo-500"
                                />{" "}
                                {prog.conditions}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3 pt-4 border-t border-indigo-100/50">
                          <button
                            onClick={() => handleEditClick(prog)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-indigo-200 text-indigo-700 px-4 py-2 rounded-lg font-bold hover:bg-indigo-50 transition-colors text-sm shadow-sm"
                          >
                            <Edit size={16} /> Edit Details
                          </button>
                          <button
                            onClick={() => handleDelete(prog.id)}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 px-4 py-2 rounded-lg font-bold hover:bg-red-50 transition-colors text-sm shadow-sm"
                          >
                            <Trash2 size={16} /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-bold text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* 🚀 FORM VIEW */
        <div className="bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-6 text-white">
            <h2 className="font-bold text-2xl flex items-center gap-2">
              <CalendarPlus size={24} />{" "}
              {editingProgram ? "Edit Program" : "Launch New Program"}
            </h2>
            <p className="text-indigo-100 mt-1 text-sm">
              {editingProgram
                ? "Update the details below."
                : "Fill in the details to announce a new campus program."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-5 bg-gray-50">
            <div>
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-1.5">
                <FileText size={16} className="text-indigo-500" /> Program Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Essay Writing Contest"
                className="w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-black shadow-sm transition-all"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-1.5">
                <AlignLeft size={16} className="text-indigo-500" /> Description
              </label>
              <textarea
                required
                rows={4}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Details about the topic and rules..."
                className="w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-black resize-none shadow-sm transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-1.5">
                  <Clock size={16} className="text-indigo-500" /> Duration /
                  Date
                </label>
                <input
                  type="text"
                  required
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="e.g., 2 Hours or Oct 15"
                  className="w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-black shadow-sm transition-all"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-1.5">
                  <Info size={16} className="text-indigo-500" /> Eligibility
                </label>
                <input
                  type="text"
                  required
                  value={formData.eligibility}
                  onChange={(e) =>
                    setFormData({ ...formData, eligibility: e.target.value })
                  }
                  placeholder="e.g., SS1 & SS2 only"
                  className="w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-black shadow-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-1.5">
                <CheckCircle2 size={16} className="text-indigo-500" />{" "}
                Conditions (Optional)
              </label>
              <input
                type="text"
                value={formData.conditions}
                onChange={(e) =>
                  setFormData({ ...formData, conditions: e.target.value })
                }
                placeholder="Any prerequisites or required materials..."
                className="w-full p-3.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-black shadow-sm transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:from-indigo-700 hover:to-blue-700 transition-all flex justify-center items-center gap-2 disabled:opacity-70 mt-6 active:scale-[0.98]"
            >
              {isSubmitting
                ? "Saving..."
                : editingProgram
                  ? "Update Program"
                  : "Publish Program"}
            </button>
          </form>
        </div>
      )}

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
