"use client";

import { useState, useEffect } from "react";
import {
  CalendarClock,
  Play,
  Square,
  History,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AcademicCalendarPage() {
  const [months, setMonths] = useState<any[]>([]);
  const [activeMonth, setActiveMonth] = useState<any | null>(null);

  const [newMonthName, setNewMonthName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const getToken = () => localStorage.getItem("token");

  // 1. Fetch All Data
  const fetchData = async () => {
    try {
      const res = await fetch(
        "https://students-profile.onrender.com/admin/months",
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setMonths(data);
        const active = data.find((m: any) => m.isActive);
        setActiveMonth(active || null);
      }
    } catch (err) {
      console.error("Failed to fetch calendar data");
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Start a New Month
  const handleStartMonth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMonthName) return;

    if (
      activeMonth &&
      !window.confirm(
        `This will close "${activeMonth.name}" and reset all student active points to 0. Are you absolutely sure?`,
      )
    ) {
      return;
    }

    setIsProcessing(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch(
        "https://students-profile.onrender.com/admin/months/start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ name: newMonthName }),
        },
      );

      if (!res.ok) throw new Error("Failed to start new period");

      setMessage({
        text: `Successfully started ${newMonthName}!`,
        type: "success",
      });
      setNewMonthName("");
      await fetchData();
    } catch (err) {
      setMessage({ text: "Error starting new period.", type: "error" });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    }
  };

  // 3. End Current Month (Without starting a new one)
  const handleEndMonth = async () => {
    if (
      !window.confirm(
        `Are you sure you want to end "${activeMonth.name}"? No new points can be awarded until a new period is started.`,
      )
    ) {
      return;
    }

    setIsProcessing(true);
    setMessage({ text: "", type: "" });

    try {
      const res = await fetch(
        "https://students-profile.onrender.com/admin/months/end",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );

      if (!res.ok) throw new Error("Failed to end period");

      setMessage({
        text: `Successfully closed ${activeMonth.name}.`,
        type: "success",
      });
      await fetchData();
    } catch (err) {
      setMessage({ text: "Error closing period.", type: "error" });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin"
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 shadow-sm"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
          <CalendarClock size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Academic Calendar
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Manage terms, reset points, and view historical periods.
          </p>
        </div>
      </div>

      {message.text && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 border ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-600 border-emerald-200"
              : "bg-red-50 text-red-600 border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle2 size={20} />
          ) : (
            <AlertTriangle size={20} />
          )}
          <span className="font-bold">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: CONTROLS */}
        <div className="lg:col-span-1 space-y-6">
          {/* Active Status Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gray-900 p-5 text-white">
              <h2 className="font-bold text-lg">Current Status</h2>
            </div>
            <div className="p-6">
              {activeMonth ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                    <h3 className="text-2xl font-black text-gray-800">
                      {activeMonth.name}
                    </h3>
                  </div>
                  <p className="text-sm text-gray-500">
                    Started:{" "}
                    <span className="font-bold text-gray-700">
                      {new Date(activeMonth.startedAt).toLocaleDateString()}
                    </span>
                  </p>
                  <button
                    onClick={handleEndMonth}
                    disabled={isProcessing}
                    className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors flex items-center justify-center gap-2 border border-red-100 disabled:opacity-50"
                  >
                    <Square size={16} /> End Period Now
                  </button>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="w-3 h-3 rounded-full bg-red-500 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-gray-800">
                    System Paused
                  </h3>
                  <p className="text-sm text-gray-500 mt-2">
                    No active period. Students cannot earn points right now.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Start New Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-indigo-600 p-5 text-white">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Play size={18} /> Start New Period
              </h2>
            </div>
            <form
              onSubmit={handleStartMonth}
              className="p-6 space-y-4 bg-gray-50"
            >
              <div>
                <label className="text-sm font-bold text-gray-700">
                  Period Name
                </label>
                <input
                  type="text"
                  required
                  value={newMonthName}
                  onChange={(e) => setNewMonthName(e.target.value)}
                  placeholder="e.g., Safar 1447 or Term 2"
                  className="w-full mt-1.5 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                />
              </div>

              <div className="bg-yellow-50 p-3 rounded-xl border border-yellow-200 text-xs text-yellow-800 font-medium flex gap-2">
                <AlertTriangle size={16} className="shrink-0" />
                <p>
                  Starting a new period will immediately archive current scores
                  and reset all student dashboards to 0 points.
                </p>
              </div>

              <button
                type="submit"
                disabled={isProcessing || !newMonthName}
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-md hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 disabled:opacity-50"
              >
                <Play size={18} />{" "}
                {isProcessing ? "Processing..." : "Start Period"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: HISTORY LOG */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
          <div className="bg-gray-50 p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-bold text-lg text-gray-800 flex items-center gap-2">
              <History size={18} className="text-gray-500" /> Historical Log
            </h2>
            <span className="text-xs font-bold bg-gray-200 text-gray-600 px-3 py-1 rounded-full">
              {months.length} Total Periods
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {months.length === 0 ? (
              <p className="text-center text-gray-400 mt-10">
                No historical data found.
              </p>
            ) : (
              months.map((m) => (
                <div
                  key={m.id}
                  className={`p-5 rounded-xl border ${m.isActive ? "bg-indigo-50 border-indigo-200" : "bg-gray-50 border-gray-100"} flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-gray-900">
                        {m.name}
                      </h3>
                      {m.isActive && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                          Active
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-4">
                      <span>
                        <strong className="text-gray-700">Started:</strong>{" "}
                        {new Date(m.startedAt).toLocaleDateString()}
                      </span>
                      {m.closedAt && (
                        <span>
                          <strong className="text-gray-700">Ended:</strong>{" "}
                          {new Date(m.closedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
