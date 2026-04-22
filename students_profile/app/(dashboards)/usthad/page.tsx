// src/app/(dashboards)/usthad/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
  FileCheck,
  AlertTriangle,
  Trophy,
  Activity,
  Clock,
} from "lucide-react";
import Link from "next/link";

interface Submission {
  id: string;
  targetPunishment?: { title: string };
  student?: { fullName: string };
  createdAt: string;
}

export default function UsthadDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [usthad, setUsthad] = useState({ name: "Loading...", role: "Usthad" });

  const [stats, setStats] = useState({
    punishmentsCount: 0,
    achievementsCount: 0,
    pendingVerifications: 0,
  });

  const [submissions, setSubmissions] = useState<Submission[]>([]);

  useEffect(() => {
    // 1. Get user details from localStorage
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (userStr) {
      const userObj = JSON.parse(userStr);
      setUsthad({
        name: userObj.fullName || userObj.username,
        role: userObj.role,
      });
    }

    // 2. Fetch Dashboard Data from Backend
    const fetchDashboard = async () => {
      try {
        const response = await fetch(
          "https://students-profile.onrender.com/usthad/dashboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          console.log("DASHBOARD ERROR:", data);
          throw new Error(data.message || "Failed to fetch dashboard data");
        }

        setStats(data.stats);
        setSubmissions(data.pendingSubmissions);
      } catch (error) {
        console.error("Error fetching Usthad dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchDashboard();
    } else {
      setIsLoading(false);
    }
  }, []);

  const handleAction = async (
    action: "approved" | "reject",
    submissionId: string,
  ) => {
    // 1. Optimistic UI Update: Instantly remove the submission from the screen
    // to make the app feel lightning fast!
    setSubmissions((prev) => prev.filter((sub) => sub.id !== submissionId));

    try {
      // 2. Determine the status string the backend expects
      const status = action === "approved" ? "APPROVED" : "REJECTED";
      const token = localStorage.getItem("token");

      // 3. Make the API call
      const response = await fetch(
        `https://students-profile.onrender.com/usthad/submissions/${submissionId}/verify`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        },
      );

      if (!response.ok) throw new Error("Verification failed");

      // Optional: Show a little toast notification here!
      console.log(`Submission ${status}!`);
    } catch (error) {
      // 4. If it fails, we need to refresh the page to get the true list back
      console.error(error);
      alert("Failed to update submission. Refreshing data...");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-[#004643] font-bold animate-pulse">
        Loading Dashboard...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6 space-y-8 animate-fadeInUp">
      {/* HEADER */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#004643] capitalize">
            {usthad.name}
          </h1>
          <span className="text-xs bg-[#004643]/10 text-[#004643] px-2 py-1 rounded-full font-semibold capitalize">
            {usthad.role}
          </span>
        </div>
        <p className="text-sm sm:text-base text-gray-500">
          Welcome back, manage discipline, evaluate students, and reward
          excellence.
        </p>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Achievements
            </p>
            <p className="text-2xl font-black text-gray-800">
              {stats.achievementsCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-50 text-orange-600">
            <Clock size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Pending Verifications
            </p>
            <p className="text-2xl font-black text-gray-800">
              {stats.pendingVerifications}
            </p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-red-50 text-red-600">
            <AlertTriangle size={24} />
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">
              Total Behavioral credits
            </p>
            <p className="text-2xl font-black text-gray-800">
              {stats.punishmentsCount}
            </p>
          </div>
        </div>
      </div>

      {/* ACTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Link
          href="/usthad/achievements"
          className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-emerald-200 transition-all group"
        >
          <div className="p-3 bg-emerald-50 rounded-xl w-fit mb-4">
            <Trophy className="text-emerald-600 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="font-bold text-base sm:text-lg text-gray-800">
            Grant Achievement
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Award points for student excellence.
          </p>
        </Link>
        <Link
          href="/usthad/attachments"
          className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-orange-200 transition-all group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 rounded-xl">
              <FileCheck className="text-orange-600 group-hover:scale-110 transition-transform" />
            </div>
            {stats.pendingVerifications > 0 && (
              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-bold">
                {stats.pendingVerifications} Pending
              </span>
            )}
          </div>
          <h3 className="font-bold text-base sm:text-lg text-gray-800">
            Verify Attachments
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Review student submissions and verify their work.
          </p>
        </Link>

        <Link
          href="/usthad/punishments"
          className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-red-200 transition-all group"
        >
          <div className="p-3 bg-red-50 rounded-xl w-fit mb-4">
            <AlertTriangle className="text-red-500 group-hover:scale-110 transition-transform" />
          </div>
          <h3 className="font-bold text-base sm:text-lg text-gray-800">
            Assign Behavioral credits
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Report student issues and manage discipline.
          </p>
        </Link>
      </div>

      {/* RECENT ACTIVITY */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 bg-gray-50">
          <h2 className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
            <Activity size={18} className="text-[#004643]" />
            Pending Submissions
          </h2>
          <Link
            href="/usthad/attachments"
            className="text-sm font-bold text-[#004643] hover:underline"
          >
            View All
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {submissions.length === 0 ? (
            <div className="p-8 text-center text-gray-400 font-medium">
              No pending submissions to verify!
            </div>
          ) : (
            submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-gray-800 text-sm sm:text-base capitalize">
                    {sub.targetPunishment?.title || "General Submission"}
                  </h4>
                  <p className="text-xs sm:text-sm text-gray-500 mt-1">
                    Submitted by{" "}
                    <span className="font-medium text-gray-700 capitalize">
                      {sub.student?.fullName || "Unknown"}
                    </span>{" "}
                    • {new Date(sub.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => handleAction("approved", sub.id)}
                    className="px-3 sm:px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-xs sm:text-sm font-semibold hover:bg-emerald-200 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleAction("reject", sub.id)}
                    className="px-3 sm:px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs sm:text-sm font-semibold hover:bg-red-100 transition-colors"
                  >
                    Reject
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
