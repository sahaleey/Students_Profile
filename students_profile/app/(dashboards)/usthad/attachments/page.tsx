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
} from "lucide-react";

export default function VerificationInboxPage() {
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSub, setSelectedSub] = useState<any | null>(null);

  // State for points when approving achievements
  const [pointsToAward, setPointsToAward] = useState<string>("50");
  const [isProcessing, setIsProcessing] = useState(false);

  const getToken = () => localStorage.getItem("token");

  // 1. FETCH ALL SUBMISSIONS
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

  // 2. FILTERING
  const pendingSubmissions = submissions.filter(
    (s) => s.status === "PENDING" || s.status === "Pending Verification",
  );

  const filteredList = pendingSubmissions.filter((s) => {
    const searchString = `${s.student?.fullName} ${s.title}`.toLowerCase();
    return searchString.includes(searchTerm.toLowerCase());
  });

  // 3. ACTION HANDLER (APPROVE / REJECT)
  const handleAction = async (action: "APPROVED" | "REJECTED") => {
    if (!selectedSub) return;
    setIsProcessing(true);

    try {
      const isAchievement = !selectedSub.targetPunishment;

      // If it's an achievement and we are approving, we MUST send points!
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

      // Success! Remove from list and clear selection
      setSubmissions((prev) => prev.filter((s) => s.id !== selectedSub.id));
      setSelectedSub(null);
      setPointsToAward("50"); // reset
    } catch (error) {
      alert("Error processing submission.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to split our formatted title
  const getDisplayContent = (fullTitle: string) => {
    const parts = fullTitle.split(" | Content: ");
    return {
      title: parts[0],
      content: parts[1] || "No additional content provided.",
    };
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-120px)] animate-fadeInUp">
      {/* LEFT COLUMN: THE INBOX LIST */}
      <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full">
        <div className="bg-[#004643] p-5 text-white">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <Clock size={20} /> Pending Verification
          </h2>
          <p className="text-white/70 text-sm mt-1">
            Review student submissions
          </p>
        </div>

        <div className="p-4 border-b border-gray-100">
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

        <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50">
          {filteredList.length === 0 ? (
            <p className="text-center text-gray-400 mt-10 p-4">
              Inbox is empty. No pending requests!
            </p>
          ) : (
            filteredList.map((sub) => {
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
      </div>

      {/* RIGHT COLUMN: THE REVIEW PANEL */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-full relative">
        {!selectedSub ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center">
            <FileText size={64} className="mb-4 text-gray-200" />
            <h3 className="text-xl font-bold text-gray-700">
              Select a submission
            </h3>
            <p className="mt-2">
              Click on an item in the inbox to review the student's work and
              approve it.
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full animate-fadeInUp">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-2xl font-bold text-gray-800 capitalize mb-1">
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

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* If clearing a punishment, show what it clears */}
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

              {/* The Student's Work */}
              <div>
                <h4 className="text-sm font-bold text-gray-700 uppercase mb-3 flex items-center gap-2">
                  <MessageSquare size={16} /> Student's Submission
                </h4>
                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 text-gray-800 whitespace-pre-wrap leading-relaxed shadow-inner">
                  {getDisplayContent(selectedSub.title).content}
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-6 bg-white border-t border-gray-200 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Points Input (Only for Achievements) */}
                <div className="w-full sm:w-auto">
                  {!selectedSub.targetPunishment ? (
                    <div className="flex items-center gap-3 bg-emerald-50 p-2 pl-4 rounded-xl border border-emerald-200">
                      <label className="text-sm font-bold text-emerald-800 whitespace-nowrap">
                        Award Points:
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={pointsToAward}
                        onChange={(e) => setPointsToAward(e.target.value)}
                        className="w-20 p-2 text-center text-black font-bold border border-emerald-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500 italic">
                      Approving this will clear the student's active punishment.
                    </p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <button
                    disabled={isProcessing}
                    onClick={() => handleAction("REJECTED")}
                    className="flex-1 sm:flex-none px-6 py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <XCircle size={18} /> Reject
                  </button>
                  <button
                    disabled={isProcessing}
                    onClick={() => handleAction("APPROVED")}
                    className="flex-1 sm:flex-none px-8 py-3 bg-[#004643] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:bg-[#003634] transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <CheckCircle2 size={18} />{" "}
                    {isProcessing ? "Processing..." : "Approve"}
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
