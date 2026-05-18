"use client";

import { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle2,
  Search,
  Clock,
  Award,
  AlertTriangle,
  MessageSquare,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ArrowLeft, // 🚀 NEW: Imported for the mobile back button!
} from "lucide-react";
import toast from "react-hot-toast";

export default function VerificationInboxPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSub, setSelectedSub] = useState<any | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  const [pointsToAward, setPointsToAward] = useState<string>("20");
  const [isProcessing, setIsProcessing] = useState(false);

  const getToken = () => localStorage.getItem("token");

  // FETCH ALL SUBMISSIONS
  const fetchData = async () => {
    try {
      const response = await fetch(
        "https://students-profile.onrender.com/usthad/attachments",
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (response.ok) {
        setSubmissions(await response.json());
      }
    } catch (error) {
      console.error("Failed to fetch submissions");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const pendingSubmissions = submissions.filter(
    (s) => s.status === "PENDING" || s.status === "Pending Verification",
  );

  const filteredList = pendingSubmissions.filter((s) => {
    const searchString = `${s.student?.fullName} ${s.title}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredList.length / ITEMS_PER_PAGE) || 1;
  const paginatedList = filteredList.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // ACTION HANDLER (APPROVE / REJECT)
  const handleAction = async (action: "APPROVED" | "REJECTED") => {
    if (!selectedSub) return;

    const isAchievement = !selectedSub.targetPunishment;

    if (action === "APPROVED" && isAchievement) {
      const parsedPoints = parseInt(pointsToAward, 10);

      if (isNaN(parsedPoints) || parsedPoints < 1) {
        toast.error("Points must be at least 1.");
        return;
      }

      if (parsedPoints > 20) {
        toast.error("Maximum 20 points allowed per achievement!");
        setPointsToAward("20");
        return;
      }
    }

    setIsProcessing(true);

    try {
      const payload: any = { status: action };

      if (action === "APPROVED" && isAchievement) {
        payload.points = parseInt(pointsToAward, 10);
      }

      const response = await fetch(
        `https://students-profile.onrender.com/usthad/submissions/${selectedSub.id}/verify`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) throw new Error("Failed to verify");

      setSubmissions((prev) => prev.filter((s) => s.id !== selectedSub.id));
      setSelectedSub(null);
      setPointsToAward("20");

      toast.success(`Submission ${action.toLowerCase()} successfully!`);

      if (paginatedList.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (error) {
      toast.error("Error processing submission.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getDisplayContent = (fullTitle: string) => {
    const parts = fullTitle.split(" | Content: ");
    return {
      title: parts[0],
      content: parts[1] || "No additional content provided.",
    };
  };

  return (
    // 🚀 FIX 1: Flex col on mobile, Grid on Desktop. Height properly calculated for mobile bars.
    <div className="flex flex-col lg:grid lg:grid-cols-3 gap-6 lg:gap-8 h-[calc(100vh-100px)] lg:h-[calc(100vh-120px)] animate-fadeInUp">
      {/* =========================================
          LEFT COLUMN: THE INBOX LIST 
          🚀 FIX 2: Hides entirely on mobile if a submission is selected!
      ========================================= */}
      <div
        className={`lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-col h-full ${
          selectedSub ? "hidden lg:flex" : "flex"
        }`}
      >
        <div className="bg-[#004643] p-5 text-white shrink-0">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Clock size={20} /> Pending Verification
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Review student submissions
          </p>
        </div>

        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search student or task..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-[#004643] transition-colors text-sm text-black"
            />
          </div>
        </div>

        {/* 🚀 FIX 3: flex-1 and overflow-y-auto ensures JUST the list scrolls, not the whole page */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50/50">
          {paginatedList.length === 0 ? (
            <p className="text-center text-gray-400 mt-10 p-4">
              Inbox is empty. No pending requests!
            </p>
          ) : (
            paginatedList.map((sub) => {
              const isPunishment = !!sub.targetPunishment;
              const { title } = getDisplayContent(sub.title);

              return (
                <button
                  key={sub.id}
                  onClick={() => setSelectedSub(sub)}
                  className={`w-full text-left p-4 rounded-xl border transition-all duration-200 ${
                    selectedSub?.id === sub.id
                      ? "bg-white border-[#004643] shadow-md ring-1 ring-[#004643]/20"
                      : "bg-white border-gray-200 hover:border-[#004643]/40 hover:shadow-sm"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded flex items-center gap-1 ${
                        isPunishment
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-700"
                      }`}
                    >
                      {isPunishment ? (
                        <AlertTriangle size={10} />
                      ) : (
                        <Award size={10} />
                      )}
                      {isPunishment
                        ? "Punishment Clearance"
                        : "Achievement Request"}
                    </span>
                  </div>
                  <p className="font-bold text-gray-800 capitalize truncate">
                    {title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    By: {sub.student?.fullName || "Unknown"}
                  </p>
                </button>
              );
            })
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
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
              className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>

      {/* =========================================
          RIGHT COLUMN: THE REVIEW PANEL 
          🚀 FIX 4: Hides on mobile if NOTHING is selected. Takes full width if selected!
      ========================================= */}
      <div
        className={`lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex-col h-full relative ${
          !selectedSub ? "hidden lg:flex" : "flex"
        }`}
      >
        {!selectedSub ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center bg-gray-50/30">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <FileText size={32} className="text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-700">
              Select a submission
            </h3>
            <p className="mt-2 max-w-sm text-sm">
              Click on an item in the inbox to review the student's work and
              approve it.
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full animate-fadeInUp">
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 shrink-0">
              {/* 🚀 FIX 5: The Mobile Back Button */}
              <button
                onClick={() => setSelectedSub(null)}
                className="lg:hidden flex items-center gap-2 text-[#004643] hover:text-[#003634] transition-colors w-fit text-sm font-bold mb-4 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100"
              >
                <ArrowLeft size={16} /> Back to Inbox
              </button>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 capitalize mb-1 pr-2">
                {getDisplayContent(selectedSub.title).title}
              </h2>
              <p className="text-gray-500 text-sm">
                Submitted by{" "}
                <span className="font-bold text-gray-700 capitalize">
                  {selectedSub.student?.fullName}
                </span>{" "}
                on {new Date(selectedSub.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* 🚀 FIX 6: Independent Scrolling Content Area */}
            {/* flex-1 + overflow-y-auto guarantees it won't push the buttons off screen */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-white">
              {selectedSub.targetPunishment && (
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-red-600 uppercase mb-1 flex items-center gap-1">
                    <AlertTriangle size={14} /> Target Punishment
                  </h4>
                  <p className="font-semibold text-red-900 capitalize">
                    {selectedSub.targetPunishment.title}
                  </p>
                  <p className="text-sm text-red-700 mt-1 italic">
                    "{selectedSub.targetPunishment.description}"
                  </p>
                </div>
              )}

              <div>
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                  <MessageSquare size={16} /> Student's Submission
                </h4>
                {/* Break-words prevents long essays without spaces from stretching the screen horizontally on mobile */}
                <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 text-gray-800 whitespace-pre-wrap leading-relaxed shadow-inner text-sm sm:text-base break-words">
                  {getDisplayContent(selectedSub.title).content}
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 sm:p-6 bg-white border-t border-gray-200 shadow-[0_-10px_30px_rgba(0,0,0,0.02)] shrink-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Points Input */}
                <div className="w-full sm:w-auto">
                  {!selectedSub.targetPunishment ? (
                    <div className="flex items-center justify-between sm:justify-start gap-3 bg-emerald-50 p-2 sm:pl-4 rounded-xl border border-emerald-200 w-full">
                      <label className="text-sm font-bold text-emerald-800 pl-2 sm:pl-0">
                        Award Points:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={pointsToAward}
                        onChange={(e) => setPointsToAward(e.target.value)}
                        className="w-20 p-2 text-center text-black font-bold border border-emerald-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic text-center sm:text-left">
                      Approving this clears the active punishment.
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    disabled={isProcessing}
                    onClick={() => handleAction("REJECTED")}
                    className="flex-1 sm:flex-none px-4 sm:px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => handleAction("APPROVED")}
                    className="flex-1 sm:flex-none px-4 sm:px-8 py-3 bg-[#004643] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-[#003634] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 size={18} />
                    {isProcessing ? "Wait..." : "Approve"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
