"use client";

import { useState, useEffect } from "react";
import {
  Clock,
  Lock,
  Unlock,
  ShieldAlert,
  CheckCircle2,
  Users,
  Coins,
  HeartHandshake,
} from "lucide-react";

export default function AdminArrivalsPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [report, setReport] = useState<any>({ session: null, records: [] });
  const [isLoading, setIsLoading] = useState(true);

  // Track which class is currently expanded in the accordion view
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("token");

  const fetchData = async () => {
    try {
      const [statusRes, reportRes] = await Promise.all([
        fetch("https://students-profile.onrender.com/admin/arrivals/status", {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
        fetch("https://students-profile.onrender.com/admin/arrivals/report", {
          headers: { Authorization: `Bearer ${getToken()}` },
        }),
      ]);

      if (statusRes.ok) setIsOpen((await statusRes.json()).isOpen);
      if (reportRes.ok) setReport(await reportRes.json());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleGate = async () => {
    const res = await fetch(
      "https://students-profile.onrender.com/admin/arrivals/toggle",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ isOpen: !isOpen }),
      },
    );
    if (res.ok) fetchData();
  };

  if (isLoading)
    return (
      <div className="text-center mt-10 animate-pulse font-bold text-indigo-600">
        Loading Control Panel...
      </div>
    );

  // 🚀 DATA PROCESSING: Group records by class
  const groupedRecords: { [key: string]: any[] } = {};
  let totalOnTime = 0;
  let totalFined = 0;
  let totalExcused = 0;

  report.records.forEach((rec: any) => {
    const studentClass = rec.student?.class || "Unassigned";
    if (!groupedRecords[studentClass]) {
      groupedRecords[studentClass] = [];
    }
    groupedRecords[studentClass].push(rec);

    // Calculate Summary Stats
    if (rec.fineAssigned) totalFined++;
    else if (rec.isLate && rec.isExcused) totalExcused++;
    else totalOnTime++;
  });

  // Sort class keys numerically
  const sortedClasses = Object.keys(groupedRecords).sort(
    (a, b) => parseInt(a) - parseInt(b),
  );

  // Automatically expand the first class if none is selected and data exists
  if (sortedClasses.length > 0 && expandedClass === null) {
    setExpandedClass(sortedClasses[0]);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* 🚀 THE MASTER CONTROL GATE */}
      <div
        className={`p-8 rounded-3xl border-2 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 transition-all duration-500 ${
          isOpen
            ? "bg-emerald-50 border-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
            : "bg-white border-gray-200"
        }`}
      >
        <div className="flex items-center gap-6">
          <div
            className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-inner ${isOpen ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"}`}
          >
            {isOpen ? <Unlock size={40} /> : <Lock size={40} />}
          </div>
          <div>
            <h2
              className={`text-3xl font-black ${isOpen ? "text-emerald-900" : "text-gray-800"}`}
            >
              {isOpen ? "Arrival Gate is OPEN" : "Arrival Gate is CLOSED"}
            </h2>
            <p
              className={`mt-1 font-medium ${isOpen ? "text-emerald-700" : "text-gray-500"}`}
            >
              {isOpen
                ? "Usthads can currently mark student arrivals."
                : "Click below to allow Usthads to start marking arrivals."}
            </p>
          </div>
        </div>

        <button
          onClick={toggleGate}
          className={`px-8 py-4 rounded-xl font-black text-lg transition-all shadow-md hover:shadow-xl hover:scale-105 ${
            isOpen
              ? "bg-red-600 text-white hover:bg-red-700"
              : "bg-emerald-600 text-white hover:bg-emerald-700"
          }`}
        >
          {isOpen ? "CLOSE GATE & FINALIZE REPORT" : "OPEN ARRIVAL GATE"}
        </button>
      </div>

      {/* 🚀 SESSION SUMMARY STATS */}
      {report.records.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-slideIn">
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">
                Total Arrived
              </p>
              <p className="text-2xl font-black text-gray-900">
                {report.records.length}
              </p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
              <CheckCircle2 size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">
                On Time
              </p>
              <p className="text-2xl font-black text-gray-900">{totalOnTime}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
              <Coins size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">
                Fined (Late)
              </p>
              <p className="text-2xl font-black text-gray-900">{totalFined}</p>
            </div>
          </div>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
              <HeartHandshake size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase">
                Excused
              </p>
              <p className="text-2xl font-black text-gray-900">
                {totalExcused}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 🚀 THE FINAL REPORT - CLASS WISE ACCORDION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-900 p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-2">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Clock size={20} /> Class-Wise Arrival Report
          </h3>
          <span className="text-sm font-medium text-gray-400 bg-white/10 px-3 py-1 rounded-lg">
            {report.session
              ? `Session: ${new Date(report.session.openedAt).toLocaleString()}`
              : "No active session"}
          </span>
        </div>

        {report.records.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Users size={48} className="mx-auto mb-4 opacity-20" />
            <p className="font-medium text-lg">No arrivals recorded yet.</p>
            <p className="text-sm mt-1">
              When Usthads mark students, they will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {sortedClasses.map((className) => (
              <div key={className} className="bg-white">
                {/* Accordion Header */}
                <button
                  onClick={() =>
                    setExpandedClass(
                      expandedClass === className ? null : className,
                    )
                  }
                  className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors focus:outline-none"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-indigo-100 text-indigo-700 font-black px-3 py-1.5 rounded-lg border border-indigo-200">
                      Class {className}
                    </div>
                    <span className="text-sm font-bold text-gray-500">
                      {groupedRecords[className].length} Students
                    </span>
                  </div>
                  <div
                    className={`transform transition-transform duration-300 ${expandedClass === className ? "rotate-180" : ""}`}
                  >
                    ▼
                  </div>
                </button>

                {/* Accordion Body (Table) */}
                {expandedClass === className && (
                  <div className="p-4 bg-gray-50 border-t border-gray-100 animate-slideIn">
                    <table className="w-full text-left text-sm bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                      <thead className="bg-gray-100 border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3 pl-5 font-bold">Student Name</th>
                          <th className="p-3 font-bold">Arrival Time</th>
                          <th className="p-3 pr-5 font-bold text-right">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {groupedRecords[className].map((rec: any) => (
                          <tr
                            key={rec.id}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="p-3 pl-5">
                              <p className="font-bold text-gray-900 capitalize flex items-center gap-2">
                                {rec.student?.fullName}
                                {rec.fineAssigned && (
                                  <ShieldAlert
                                    size={14}
                                    className="text-red-500"
                                  />
                                )}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                Admn: {rec.student?.username}
                              </p>
                            </td>
                            <td className="p-3 font-medium text-gray-700">
                              {new Date(rec.recordedTime).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" },
                              )}
                            </td>
                            <td className="p-3 pr-5 text-right">
                              {rec.fineAssigned ? (
                                <span className="bg-red-50 text-red-700 border border-red-200 px-3 py-1 rounded-md font-black text-[10px] uppercase tracking-wider shadow-sm">
                                  Fined (₹150)
                                </span>
                              ) : rec.isLate && rec.isExcused ? (
                                <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-md font-black text-[10px] uppercase tracking-wider shadow-sm">
                                  Excused
                                </span>
                              ) : (
                                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-md font-black text-[10px] uppercase tracking-wider shadow-sm">
                                  On Time
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-5px);
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
