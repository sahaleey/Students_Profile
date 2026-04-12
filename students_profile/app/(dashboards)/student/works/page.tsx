"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Send,
  Star,
  Sparkles,
  Calendar,
  AlertCircle,
} from "lucide-react";

export default function StudentWorksPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [myWorks, setMyWorks] = useState<any[]>([]);
  const [usthads, setUsthads] = useState<
    Array<{ id: string; fullName: string }>
  >([]);
  const [stats, setStats] = useState({
    totalPoints: 0,
    approvedWorks: 0,
  });

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    targetedUsthadId: "",
  });

  const getToken = () => localStorage.getItem("token");

  // 1. FETCH HISTORY ON LOAD
  const fetchMyWorks = async () => {
    try {
      const token = getToken();
      const res = await fetch(
        "https://students-profile.onrender.com/student/submissions",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setMyWorks(data);

        // Calculate basic stats from the data
        const approvedCount = data.filter(
          (w: any) => w.status === "APPROVED",
        ).length;
        setStats((prev) => ({ ...prev, approvedWorks: approvedCount }));
      }

      // Also fetch dashboard data to get total points
      const dashRes = await fetch(
        "https://students-profile.onrender.com/student/dashboard",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (dashRes.ok) {
        const dashData = await dashRes.json();
        setStats((prev) => ({ ...prev, totalPoints: dashData.profile.points }));
      }
    } catch (error) {
      console.error("Failed to fetch works");
    }
  };

  const fetchUsthads = async () => {
    try {
      const token = getToken();
      const res = await fetch(
        "https://students-profile.onrender.com/student/usthads",
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) return;

      const data = await res.json();
      setUsthads(data);
      setFormData((prev) => ({
        ...prev,
        targetedUsthadId:
          prev.targetedUsthadId || (data.length > 0 ? data[0].id : ""),
      }));
    } catch {
      console.error("Failed to fetch Usthads");
    }
  };

  useEffect(() => {
    fetchMyWorks();
    fetchUsthads();
  }, []);

  // 2. SUBMIT NEW WORK
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.content || !formData.targetedUsthadId)
      return;
    setIsSubmitting(true);

    try {
      const res = await fetch(
        "https://students-profile.onrender.com/student/submissions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(formData),
        },
      );

      if (!res.ok) throw new Error("Failed to submit");

      // Success! Clear form and refresh list
      setFormData((prev) => ({
        title: "",
        content: "",
        targetedUsthadId: prev.targetedUsthadId,
      }));
      await fetchMyWorks();
    } catch (error) {
      alert("Failed to submit work. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header with Glass Effect */}
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
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#004643] to-[#00665e] bg-clip-text text-transparent">
              My Achievements
            </h1>
            <p className="text-[#004643]/60 text-sm mt-1 flex items-center gap-2">
              Submit your co-curricular work to earn reward points
            </p>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="flex gap-3">
          <div className="backdrop-blur-xl bg-white/60 rounded-xl px-4 py-2 border border-white/50">
            <p className="text-xs text-[#004643]/60">Total Points</p>
            <p className="text-xl font-bold text-[#004643]">
              {stats.totalPoints}
            </p>
          </div>
          <div className="backdrop-blur-xl bg-white/60 rounded-xl px-4 py-2 border border-white/50">
            <p className="text-xs text-[#004643]/60">Approved</p>
            <p className="text-xl font-bold text-emerald-600">
              {stats.approvedWorks}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: SUBMISSION HISTORY */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#004643] flex items-center gap-2">
              <Star size={18} /> Achievement History
            </h2>
            <span className="text-xs text-[#004643]/60 bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm font-bold">
              {myWorks.length} Submissions
            </span>
          </div>

          <div className="space-y-4">
            {myWorks.length === 0 ? (
              <div className="text-center p-8 text-gray-500 bg-white/50 backdrop-blur-md rounded-2xl border border-white/50">
                You haven't submitted any work yet!
              </div>
            ) : (
              myWorks.map((work, index) => {
                // We split the title string we formatted in the backend
                const titleParts = work.title.split(" | Content: ");
                const displayTitle = titleParts[0];
                const displayContent = titleParts[1] || "";

                return (
                  <div
                    key={work.id}
                    className="group backdrop-blur-xl bg-white/70 rounded-2xl border border-white/50 p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-slideIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg flex items-center gap-1 bg-emerald-500/20 text-emerald-700">
                            <Star size={10} /> Review Request
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar size={10} />{" "}
                            {new Date(work.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-[#004643] transition-colors capitalize">
                          {displayTitle}
                        </h3>
                        {displayContent && (
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2 italic border-l-2 border-[#004643]/30 pl-3">
                            "{displayContent}"
                          </p>
                        )}
                        <p className="text-xs text-[#004643]/70 mt-2 font-medium">
                          Targeted Usthad:{" "}
                          {work.targetedUsthad?.fullName || "Not specified"}
                        </p>
                      </div>

                      <div
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold w-fit h-fit ${
                          work.status === "APPROVED"
                            ? "bg-emerald-500/20 text-emerald-700 border border-emerald-500/30"
                            : work.status === "REJECTED"
                              ? "bg-red-500/20 text-red-700 border border-red-500/30"
                              : "bg-yellow-500/20 text-yellow-700 border border-yellow-500/30"
                        }`}
                      >
                        {work.status === "APPROVED" ? (
                          <CheckCircle2 size={16} />
                        ) : work.status === "REJECTED" ? (
                          <AlertCircle size={16} />
                        ) : (
                          <Clock size={16} />
                        )}
                        {work.status || "PENDING"}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT: TEXT-BASED ACHIEVEMENT SUBMIT FORM */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="bg-gradient-to-r from-[#004643] to-[#00665e] p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
              <h2 className="font-bold text-xl flex items-center gap-2 relative z-10">
                <Send size={20} /> Request Review
              </h2>
              <p className="text-white/80 text-sm mt-1 relative z-10">
                Type or paste your work here
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 space-y-5 bg-gradient-to-b from-white/50 to-white/30"
            >
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1.5">
                  <Sparkles size={14} /> Targeted Usthad
                </label>
                <select
                  required
                  value={formData.targetedUsthadId}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      targetedUsthadId: e.target.value,
                    })
                  }
                  className="w-full p-3 bg-white/80 backdrop-blur-sm border text-black border-gray-200 rounded-xl outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all"
                >
                  {usthads.length === 0 ? (
                    <option value="">No Usthads available</option>
                  ) : (
                    usthads.map((usthad) => (
                      <option key={usthad.id} value={usthad.id}>
                        {usthad.fullName}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1.5">
                  <Sparkles size={14} /> Name of Work
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="e.g., Essay on Sabr"
                  className="w-full p-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all placeholder:text-gray-400 text-gray-900 font-medium"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-1.5">
                  <FileText size={14} /> Content / Description
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Paste your essay, translated poem, or detailed explanation here..."
                  className="w-full p-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all placeholder:text-gray-400 text-gray-900 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#004643] to-[#00665e] hover:from-[#003634] hover:to-[#004643] text-white font-bold py-3.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Submit to Usthad
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
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
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}
