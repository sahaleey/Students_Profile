"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertOctagon,
  Calendar,
  Send,
  MessageSquare,
  Clock,
  User,
  Flag,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function StudentTasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "Task Completion Proof", // Default title
    content: "",
  });

  const getToken = () => localStorage.getItem("token");

  // 1. FETCH ACTIVE PUNISHMENTS
  const fetchTasks = async () => {
    try {
      const res = await fetch(
        "https://students-profile.onrender.com/student/punishments",
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (res.ok) {
        setTasks(await res.json());
      }
    } catch (error) {
      console.error("Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // 2. HANDLE SUBMISSION
  const handleSubmit = async (taskId: string) => {
    if (!formData.content) return;
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `https://students-profile.onrender.com/student/punishments/${taskId}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(formData),
        },
      );

      if (!res.ok) throw new Error("Failed to submit proof");

      // Success Animation & Cleanup
      setShowSuccess(true);
      setFormData({ title: "Task Completion Proof", content: "" });

      setTimeout(() => {
        setShowSuccess(false);
        setSubmittingTaskId(null);
        setTasks((prev) => prev.filter((t) => t.id !== taskId));

        fetchTasks(); // Refresh list so the task disappears!
      }, 2000);
    } catch (error) {
      alert("Failed to submit work. Please try again.");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper for UI styling
  const getUrgencyColor = (title: string) => {
    if (
      title.toLowerCase().includes("prayer") ||
      title.toLowerCase().includes("fajr")
    ) {
      return "from-red-500 to-red-600";
    }
    return "from-orange-500 to-orange-600";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[60vh] text-[#004643] font-bold animate-pulse">
        Loading Tasks...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/student"
            className="group p-2.5 backdrop-blur-xl bg-white/70 border border-white/50 rounded-xl hover:bg-white/90 transition-all duration-300 text-[#004643] hover:shadow-lg transform hover:scale-105"
          >
            <ArrowLeft
              size={20}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent flex items-center gap-3">
              <AlertOctagon size={28} className="text-red-600" /> Action
              Required
            </h1>
            <p className="text-gray-600 mt-1 font-medium flex items-center gap-2">
              <Flag size={14} className="text-red-500" /> Complete these tasks
              to clear your active punishments
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex gap-3">
          <div className="backdrop-blur-xl bg-white/60 rounded-xl px-4 py-2 border border-white/50">
            <p className="text-xs text-[#004643]/60">Active Tasks</p>
            <p className="text-xl font-bold text-red-600">{tasks.length}</p>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 animate-slideInRight">
          <div className="backdrop-blur-xl bg-emerald-500/90 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-white/20">
            <CheckCircle2 size={20} />
            <span className="font-semibold">Proof sent successfully!</span>
          </div>
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 && (
        <div className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-emerald-500/20 p-12 text-center animate-fadeInUp">
          <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={40} className="text-emerald-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No Active Tasks!
          </h3>
          <p className="text-gray-600">
            You have no pending punishments. Keep up the good work!
          </p>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-6">
        {tasks.map((task, idx) => (
          <div
            key={task.id}
            className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-red-500/20 overflow-hidden transition-all duration-300 hover:shadow-2xl animate-slideIn"
            style={{ animationDelay: `${idx * 150}ms` }}
          >
            {/* Task Header Banner */}
            <div
              className={`bg-gradient-to-r ${getUrgencyColor(task.title)}/10 p-5 border-b border-red-500/10 flex flex-col lg:flex-row justify-between lg:items-center gap-4`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg bg-red-500/20 text-red-800 flex items-center gap-1">
                    <AlertTriangle size={10} /> {task.category || "General"}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Calendar size={10} /> Issued:{" "}
                    {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <User size={16} className="text-[#004643]" />
                    <span className="text-gray-700">Assigned by:</span>
                    <span className="text-gray-900 font-semibold capitalize">
                      {/* 🚀 Dynamic Usthad Name! */}
                      {task.assignedBy?.fullName || "Admin"}
                    </span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-800 capitalize">
                  {task.title}
                </h2>
              </div>
              <button
                onClick={() =>
                  setSubmittingTaskId(
                    submittingTaskId === task.id ? null : task.id,
                  )
                }
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-md transform hover:scale-105 ${
                  submittingTaskId === task.id
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    : "bg-gradient-to-r from-red-600 to-red-700 text-white hover:shadow-xl"
                }`}
              >
                {submittingTaskId === task.id ? "Cancel" : "Submit Proof"}
              </button>
            </div>

            {/* Task Details (Visible only when not submitting) */}
            {submittingTaskId !== task.id && (
              <div className="p-6">
                <div className="bg-gradient-to-r from-gray-50/50 to-white p-5 rounded-xl border border-white/60">
                  <p className="text-gray-700 leading-relaxed italic border-l-2 border-red-300 pl-3">
                    "{task.description || "No description provided."}"
                  </p>
                </div>
              </div>
            )}

            {/* Expanded Submission Form */}
            {submittingTaskId === task.id && (
              <div className="bg-gradient-to-b from-gray-50/80 to-white/50 p-6 border-t border-gray-200/50 animate-fadeInUp">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-[#004643] flex items-center gap-2">
                    <Send size={18} /> Request Verification
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Sparkles size={12} />
                    <span>Clearance Request</span>
                  </div>
                </div>

                <form
                  className="space-y-5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSubmit(task.id);
                  }}
                >
                  <div>
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                      <MessageSquare size={14} /> Proof of Completion
                    </label>
                    <textarea
                      required
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      placeholder="Explain how you completed this task. (e.g., 'I organized the library shelves and Usthad Ahmad verified it...')"
                      className="w-full p-4 text-black bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#004643]/50 min-h-[100px] resize-none transition-all placeholder:text-gray-400"
                      rows={4}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.content}
                    className="w-full bg-gradient-to-r from-[#004643] to-[#00665e] hover:from-[#003634] hover:to-[#004643] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending Request...
                      </>
                    ) : (
                      <>
                        <Send size={18} /> Submit to Usthad
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
                      <TrendingUp size={10} />
                      Usthad will review your submission and clear the
                      punishment if approved.
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
          opacity: 0;
        }
        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
