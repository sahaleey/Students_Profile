"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  UploadCloud,
  CheckCircle2,
  Clock,
  FileText,
  Send,
  Star,
  Sparkles,
  TrendingUp,
  Award,
  Calendar,
} from "lucide-react";

export default function StudentWorksPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Purely Achievement data now
  const [myWorks] = useState([
    {
      id: "W01",
      title: "Islamic History Essay",
      status: "Pending Verification",
      date: "Oct 14",
      points: null,
    },
    {
      id: "W02",
      title: "Urdu Poetry Translation",
      status: "Approved",
      date: "Oct 10",
      points: "+50",
    },
  ]);

  const stats = {
    totalSubmissions: 12,
    approvedWorks: 8,
    pendingWorks: 3,
    totalPoints: 450,
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
            <span className="text-xs text-[#004643]/60 bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm">
              {myWorks.length} total
            </span>
          </div>

          <div className="space-y-4">
            {myWorks.map((work, index) => (
              <div
                key={work.id}
                className="group backdrop-blur-xl bg-white/70 rounded-2xl border border-white/50 p-5 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] animate-slideIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg flex items-center gap-1 bg-emerald-500/20 text-emerald-700">
                        <Star size={10} /> For Points
                      </span>
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Calendar size={10} /> {work.date}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg group-hover:text-[#004643] transition-colors">
                      {work.title}
                    </h3>
                    {work.points && (
                      <div className="flex items-center gap-1 mt-2">
                        <Award size={14} className="text-yellow-500" />
                        <span className="text-xs font-semibold text-emerald-600">
                          {work.points} points earned
                        </span>
                      </div>
                    )}
                  </div>

                  <div
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold w-fit ${
                      work.status === "Approved"
                        ? "bg-emerald-500/20 text-emerald-700 border border-emerald-500/30"
                        : "bg-yellow-500/20 text-yellow-700 border border-yellow-500/30"
                    }`}
                  >
                    {work.status === "Approved" ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <Clock size={16} />
                    )}
                    {work.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: STRICTLY ACHIEVEMENT SUBMIT FORM */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="bg-gradient-to-r from-[#004643] to-[#00665e] p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
              <h2 className="font-bold text-xl flex items-center gap-2 relative z-10">
                <Send size={20} /> Submit Achievement
              </h2>
              <p className="text-white/80 text-sm mt-1 relative z-10">
                Showcase your work to Usthad
              </p>
            </div>

            <form className="p-6 space-y-5 bg-gradient-to-b from-white/50 to-white/30">
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText size={14} /> Title of Work
                </label>
                <input
                  type="text"
                  placeholder="e.g., Essay on Islamic History"
                  className="w-full mt-1.5 p-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all placeholder:text-gray-400"
                />
              </div>

              {/* Notice no Dropdowns here anymore! */}

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Upload File
                </label>
                <div
                  onClick={() =>
                    document.getElementById("file-upload")?.click()
                  }
                  className="border-2 border-dashed border-[#004643]/30 rounded-xl p-6 flex flex-col items-center justify-center text-gray-500 bg-white/50 backdrop-blur-sm hover:bg-white/70 transition-all cursor-pointer group"
                >
                  <UploadCloud
                    size={40}
                    className="mb-3 text-[#004643] group-hover:scale-110 transition-transform duration-300"
                  />
                  <p className="text-sm font-semibold text-[#004643]">
                    Click to upload file
                  </p>
                  <p className="text-xs mt-1 text-gray-500">
                    PDF, DOCX, or Image (Max 5MB)
                  </p>
                  {selectedFile && (
                    <div className="mt-3 text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      ✓ {selectedFile.name}
                    </div>
                  )}
                </div>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  accept=".pdf,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setIsSubmitting(true);
                  setTimeout(() => setIsSubmitting(false), 2000);
                }}
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

      {/* Styles omitted for brevity, keep your existing keyframes! */}
    </div>
  );
}
