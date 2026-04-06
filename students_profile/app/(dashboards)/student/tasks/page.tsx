// src/app/(dashboards)/student/tasks/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  AlertOctagon,
  Calendar,
  User,
  UploadCloud,
  Send,
  MessageSquare,
  Clock,
  Link as LinkIcon,
  Star,
  Flag,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export default function StudentTasksPage() {
  const [tasks] = useState([
    {
      id: "P01",
      title: "Library Organization Duty",
      description:
        "You must organize the Islamic History section and submit a log of the books sorted. Ensure all books are properly categorized and shelved according to the Dewey Decimal System.",
      category: "Public Behavior",
      assignedBy: "Usthad Ahmad",
      dateAssigned: "Oct 12, 2025",
      deadline: "Oct 15, 2025",
      status: "Active",
      urgency: "High",
    },
    {
      id: "P02",
      title: "Community Service Hours",
      description:
        "Complete 5 hours of community service at the local mosque. Submit attendance log with supervisor signature.",
      category: "Mosque",
      assignedBy: "Usthad Rashid",
      dateAssigned: "Oct 10, 2025",
      deadline: "Oct 20, 2025",
      status: "Active",
      urgency: "Medium",
    },
  ]);

  const [existingWorks] = useState([
    {
      id: "W01",
      title: "Islamic History Essay",
    },
    {
      id: "W02",
      title: "Urdu Poetry Translation",
    },
    {
      id: "W03",
      title: "Quran Recitation Competition",
    },
  ]);

  const [submittingTaskId, setSubmittingTaskId] = useState<string | null>(null);
  const [submissionMethod, setSubmissionMethod] = useState<"upload" | "attach">(
    "upload",
  );
  const [selectedExistingWork, setSelectedExistingWork] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSubmittingTaskId(null);
        setSelectedExistingWork("");
      }, 2000);
    }, 1500);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "High":
        return "from-red-500 to-red-600";
      case "Medium":
        return "from-orange-500 to-orange-600";
      default:
        return "from-yellow-500 to-yellow-600";
    }
  };

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
              <AlertOctagon size={28} className="text-red-600" />
              Action Required
            </h1>
            <p className="text-gray-600 mt-1 font-medium flex items-center gap-2">
              <Flag size={14} className="text-red-500" />
              Complete these tasks to clear your active punishments
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex gap-3">
          <div className="backdrop-blur-xl bg-white/60 rounded-xl px-4 py-2 border border-white/50">
            <p className="text-xs text-[#004643]/60">Active Tasks</p>
            <p className="text-xl font-bold text-red-600">{tasks.length}</p>
          </div>
          <div className="backdrop-blur-xl bg-white/60 rounded-xl px-4 py-2 border border-white/50">
            <p className="text-xs text-[#004643]/60">Completed</p>
            <p className="text-xl font-bold text-emerald-600">8</p>
          </div>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 animate-slideInRight">
          <div className="backdrop-blur-xl bg-emerald-500/90 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 border border-white/20">
            <CheckCircle2 size={20} />
            <span className="font-semibold">Submission sent successfully!</span>
          </div>
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
              className={`bg-gradient-to-r ${getUrgencyColor(task.urgency)}/10 p-5 border-b border-red-500/10 flex flex-col lg:flex-row justify-between lg:items-center gap-4`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-lg bg-red-500/20 text-red-800 flex items-center gap-1">
                    <AlertTriangle size={10} />
                    {task.category}
                  </span>
                  <span className="text-xs text-red-600/80 font-bold flex items-center gap-1">
                    <Clock size={12} /> Due: {task.deadline}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${
                      task.urgency === "High"
                        ? "bg-red-500/20 text-red-700"
                        : "bg-orange-500/20 text-orange-700"
                    }`}
                  >
                    <Flag size={10} />
                    {task.urgency} Priority
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">
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
                <div className="bg-gradient-to-r from-gray-50/50 to-white p-5 rounded-xl border border-white/60 mb-5">
                  <p className="text-gray-700 leading-relaxed">
                    {task.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-gray-600 font-medium">
                  <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50">
                    <User size={16} className="text-[#004643]" />
                    <span className="text-gray-700">Assigned by:</span>
                    <span className="text-gray-900 font-semibold">
                      {task.assignedBy}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200/50">
                    <Calendar size={16} className="text-[#004643]" />
                    <span className="text-gray-700">Assigned on:</span>
                    <span className="text-gray-900 font-semibold">
                      {task.dateAssigned}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-red-50/50 backdrop-blur-sm px-4 py-2 rounded-xl border border-red-200/50">
                    <Clock size={16} className="text-red-600" />
                    <span className="text-gray-700">Time remaining:</span>
                    <span className="text-red-600 font-semibold">
                      3 days left
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Expanded Submission Form with Glassmorphism */}
            {submittingTaskId === task.id && (
              <div className="bg-gradient-to-b from-gray-50/80 to-white/50 p-6 border-t border-gray-200/50 animate-fadeInUp">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-[#004643] flex items-center gap-2">
                    <Send size={18} /> Request Verification
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Sparkles size={12} />
                    <span>Task ID: {task.id}</span>
                  </div>
                </div>

                {/* Method Selection Tabs */}
                <div className="flex gap-2 mb-6 p-1 bg-gray-200/30 backdrop-blur-sm rounded-xl w-fit">
                  <button
                    onClick={() => setSubmissionMethod("upload")}
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                      submissionMethod === "upload"
                        ? "bg-white text-[#004643] shadow-md transform scale-105"
                        : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                    }`}
                  >
                    <UploadCloud size={14} className="inline mr-1" />
                    Upload New Proof
                  </button>
                  <button
                    onClick={() => setSubmissionMethod("attach")}
                    className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                      submissionMethod === "attach"
                        ? "bg-white text-[#004643] shadow-md transform scale-105"
                        : "text-gray-500 hover:text-gray-700 hover:bg-white/50"
                    }`}
                  >
                    <LinkIcon size={14} className="inline mr-1" />
                    Attach Existing Work
                  </button>
                </div>

                <form
                  className="space-y-5"
                  onSubmit={(e) => e.preventDefault()}
                >
                  {/* Dynamic Area based on Tab */}
                  {submissionMethod === "upload" ? (
                    <div className="border-2 border-dashed border-[#004643]/30 rounded-xl p-8 flex flex-col items-center justify-center text-gray-500 bg-white/50 backdrop-blur-sm cursor-pointer hover:bg-white/70 transition-all group">
                      <UploadCloud
                        size={48}
                        className="mb-3 text-[#004643] group-hover:scale-110 transition-transform duration-300"
                      />
                      <p className="text-sm font-bold text-gray-800">
                        Click to upload proof of completion
                      </p>
                      <p className="text-xs mt-1 text-gray-500">
                        Upload photos, documents, or PDFs (Max 5MB)
                      </p>
                      <p className="text-xs mt-2 text-emerald-600 font-medium">
                        Supported: .jpg, .png, .pdf, .docx
                      </p>
                    </div>
                  ) : (
                    <div className="bg-white/80 backdrop-blur-sm border border-[#004643]/20 rounded-xl p-5">
                      <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                        <Star size={16} className="text-yellow-500" />
                        Select Approved Work to Attach
                      </label>
                      <select
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#004643]/50 cursor-pointer text-black transition-all"
                        value={selectedExistingWork}
                        onChange={(e) =>
                          setSelectedExistingWork(e.target.value)
                        }
                      >
                        <option value="">-- Choose an achievement --</option>
                        {existingWorks.map((work) => (
                          <option key={work.id} value={work.id}>
                            {work.title}
                          </option>
                        ))}
                      </select>
                      <div className="mt-3 p-3 bg-yellow-50/50 rounded-lg border border-yellow-200">
                        <p className="text-xs text-yellow-800 flex items-center gap-2">
                          <AlertTriangle size={12} />
                          <span>
                            Note: Attaching an approved work to clear a
                            punishment means you will not receive additional
                            points for this submission.
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Common Note Field */}
                  <div>
                    <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-2">
                      <MessageSquare size={14} /> Note to Usthad
                    </label>
                    <textarea
                      placeholder={
                        submissionMethod === "upload"
                          ? "Explain how you completed the task, including any relevant details..."
                          : "Explain why this existing work should clear the punishment..."
                      }
                      className="w-full p-4 text-black bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#004643]/50 min-h-[100px] resize-none transition-all placeholder:text-gray-400"
                      rows={3}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="w-full bg-gradient-to-r from-[#004643] to-[#00665e] hover:from-[#003634] hover:to-[#004643] text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending Request...
                      </>
                    ) : (
                      <>
                        <Send size={18} />
                        {submissionMethod === "upload"
                          ? "Send for Approval"
                          : "Request Clearance"}
                      </>
                    )}
                  </button>

                  {/* Info Text */}
                  <div className="text-center pt-2">
                    <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
                      <TrendingUp size={10} />
                      Usthad will review your submission within 24-48 hours
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State - No Tasks */}
      {tasks.length === 0 && (
        <div className="backdrop-blur-xl bg-white/70 rounded-2xl shadow-xl border border-white/50 p-12 text-center">
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
