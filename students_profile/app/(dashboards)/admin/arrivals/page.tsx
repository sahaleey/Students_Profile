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
  Download,
  UserX,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { saveAs } from "file-saver";
import * as XLSX from "xlsx-js-style";

export default function AdminArrivalsPage() {
  const [isOpen, setIsOpen] = useState(false);

  const [report, setReport] = useState<any>({
    session: null,
    records: [],
    missingStudents: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  // Accordion state
  const [expandedClass, setExpandedClass] = useState<string | null>(null);

  // Missing Students Pagination States
  const [missingPage, setMissingPage] = useState(1);
  const MISSING_PER_PAGE = 10;

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

  const handleDownloadExcel = () => {
    if (!report.session) {
      alert("No session found.");
      return;
    }

    const wb = XLSX.utils.book_new();

    const data: any[][] = [];

    // ===============================
    // TITLE
    // ===============================
    data.push(["NAHJURRASHAD ISLAMIC COLLEGE"]);

    data.push(["AFTER LEAVE ARRIVAL REPORT"]);

    data.push([]);

    // ===============================
    // SESSION DETAILS
    // ===============================
    data.push(["SESSION INFORMATION"]);

    data.push([
      "Session Opened",
      new Date(report.session.openedAt).toLocaleString(),
    ]);

    data.push(["Gate Status", isOpen ? "OPEN" : "CLOSED & FINALIZED"]);

    data.push(["Generated At", new Date().toLocaleString()]);

    data.push([]);

    // ===============================
    // SUMMARY
    // ===============================
    data.push(["REPORT SUMMARY"]);

    data.push(["Total Arrived", report.records.length]);
    data.push(["On Time", totalOnTime]);
    data.push(["Fined", totalFined]);
    data.push(["Excused", totalExcused]);
    data.push(["Missing", missingStudents.length]);

    data.push([]);
    data.push([]);

    // ===============================
    // ARRIVED STUDENTS
    // ===============================
    data.push([`ARRIVED STUDENTS (${report.records.length})`]);

    data.push([
      "Student Name",
      "Admission No",
      "Class",
      "Arrival Time",
      "Status",
    ]);

    report.records.forEach((rec: any) => {
      let status = "On Time";

      if (rec.fineAssigned) {
        status = "Fined";
      } else if (rec.isLate && rec.isExcused) {
        status = "Excused";
      }

      data.push([
        rec.student?.fullName || "Unknown",
        rec.student?.username || "N/A",
        rec.student?.class || "Unassigned",
        new Date(rec.recordedTime).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        status,
      ]);
    });

    data.push([]);
    data.push([]);

    // ===============================
    // MISSING STUDENTS
    // ===============================
    data.push([`MISSING STUDENTS (${missingStudents.length})`]);

    data.push(["Student Name", "Admission No", "Class", "Status"]);

    if (missingStudents.length === 0) {
      data.push(["All students arrived successfully!"]);
    } else {
      missingStudents.forEach((student: any) => {
        data.push([
          student.fullName || "Unknown",
          student.username || "N/A",
          student.class || "Unassigned",
          "Missing",
        ]);
      });
    }

    // ===============================
    // CREATE SHEET
    // ===============================
    const ws = XLSX.utils.aoa_to_sheet(data);

    // ===============================
    // COLUMN WIDTHS
    // ===============================
    ws["!cols"] = [
      { wch: 35 },
      { wch: 20 },
      { wch: 18 },
      { wch: 20 },
      { wch: 20 },
    ];

    // ===============================
    // MERGES
    // ===============================
    ws["!merges"] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: 4 },
      },
      {
        s: { r: 1, c: 0 },
        e: { r: 1, c: 4 },
      },
    ];

    // ===============================
    // STYLES
    // ===============================

    const titleStyle = {
      font: {
        bold: true,
        sz: 20,
        color: { rgb: "FFFFFF" },
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
      fill: {
        fgColor: { rgb: "1E293B" },
      },
    };

    const subTitleStyle = {
      font: {
        bold: true,
        sz: 14,
        color: { rgb: "FFFFFF" },
      },
      alignment: {
        horizontal: "center",
      },
      fill: {
        fgColor: { rgb: "334155" },
      },
    };

    const sectionStyle = {
      font: {
        bold: true,
        color: { rgb: "FFFFFF" },
      },
      fill: {
        fgColor: { rgb: "2563EB" },
      },
      alignment: {
        horizontal: "center",
      },
    };

    const headerStyle = {
      font: {
        bold: true,
        color: { rgb: "FFFFFF" },
      },
      fill: {
        fgColor: { rgb: "0F172A" },
      },
      alignment: {
        horizontal: "center",
        vertical: "center",
      },
      border: {
        top: { style: "thin", color: { rgb: "D1D5DB" } },
        bottom: { style: "thin", color: { rgb: "D1D5DB" } },
        left: { style: "thin", color: { rgb: "D1D5DB" } },
        right: { style: "thin", color: { rgb: "D1D5DB" } },
      },
    };

    const cellStyle = {
      alignment: {
        vertical: "center",
        horizontal: "left",
      },
      border: {
        top: { style: "thin", color: { rgb: "E5E7EB" } },
        bottom: { style: "thin", color: { rgb: "E5E7EB" } },
        left: { style: "thin", color: { rgb: "E5E7EB" } },
        right: { style: "thin", color: { rgb: "E5E7EB" } },
      },
    };

    // ===============================
    // APPLY STYLES
    // ===============================

    const range = XLSX.utils.decode_range(ws["!ref"] || "");

    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({
          r: R,
          c: C,
        });

        if (!ws[cellAddress]) continue;

        ws[cellAddress].s = { ...cellStyle };

        // Main Title
        if (R === 0) {
          ws[cellAddress].s = titleStyle;
        }

        // Subtitle
        if (R === 1) {
          ws[cellAddress].s = subTitleStyle;
        }

        // Section Titles
        if (
          ws[cellAddress].v === "SESSION INFORMATION" ||
          ws[cellAddress].v === "REPORT SUMMARY" ||
          String(ws[cellAddress].v).includes("ARRIVED STUDENTS") ||
          String(ws[cellAddress].v).includes("MISSING STUDENTS")
        ) {
          ws[cellAddress].s = sectionStyle;
        }

        // Table Headers
        if (
          ws[cellAddress].v === "Student Name" ||
          ws[cellAddress].v === "Admission No" ||
          ws[cellAddress].v === "Class" ||
          ws[cellAddress].v === "Arrival Time" ||
          ws[cellAddress].v === "Status"
        ) {
          ws[cellAddress].s = headerStyle;
        }

        // Status Coloring
        if (ws[cellAddress].v === "On Time") {
          ws[cellAddress].s = {
            ...cellStyle,
            fill: {
              fgColor: { rgb: "DCFCE7" },
            },
            font: {
              bold: true,
              color: { rgb: "166534" },
            },
          };
        }

        if (ws[cellAddress].v === "Fined") {
          ws[cellAddress].s = {
            ...cellStyle,
            fill: {
              fgColor: { rgb: "FEE2E2" },
            },
            font: {
              bold: true,
              color: { rgb: "991B1B" },
            },
          };
        }

        if (ws[cellAddress].v === "Excused") {
          ws[cellAddress].s = {
            ...cellStyle,
            fill: {
              fgColor: { rgb: "FEF3C7" },
            },
            font: {
              bold: true,
              color: { rgb: "92400E" },
            },
          };
        }

        if (ws[cellAddress].v === "Missing") {
          ws[cellAddress].s = {
            ...cellStyle,
            fill: {
              fgColor: { rgb: "FECACA" },
            },
            font: {
              bold: true,
              color: { rgb: "7F1D1D" },
            },
          };
        }
      }
    }

    // ===============================
    // ADD SHEET
    // ===============================
    XLSX.utils.book_append_sheet(wb, ws, "Arrival Report");

    // ===============================
    // EXPORT
    // ===============================
    const excelBuffer = XLSX.write(wb, {
      bookType: "xlsx",
      type: "array",
    });

    const fileData = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(
      fileData,
      `Arrival_Report_${new Date()
        .toLocaleDateString()
        .replace(/\//g, "-")}.xlsx`,
    );
  };

  if (isLoading)
    return (
      <div className="text-center mt-10 animate-pulse font-bold text-indigo-600">
        Loading Control Panel...
      </div>
    );

  // DATA PROCESSING: Group records by class
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

    if (rec.fineAssigned) totalFined++;
    else if (rec.isLate && rec.isExcused) totalExcused++;
    else totalOnTime++;
  });

  const sortedClasses = Object.keys(groupedRecords).sort(
    (a, b) => parseInt(a) - parseInt(b),
  );

  if (sortedClasses.length > 0 && expandedClass === null) {
    setExpandedClass(sortedClasses[0]);
  }

  // Missing Students Pagination Logic
  const missingStudents = report.missingStudents || [];
  const totalMissingPages =
    Math.ceil(missingStudents.length / MISSING_PER_PAGE) || 1;
  const paginatedMissing = missingStudents.slice(
    (missingPage - 1) * MISSING_PER_PAGE,
    missingPage * MISSING_PER_PAGE,
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* THE MASTER CONTROL GATE */}
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

      {/* SESSION SUMMARY STATS */}
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

      {/* LAYOUT GRID: Left Side (Arrived) | Right Side (Missing) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: THE ARRIVED REPORT */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[650px]">
          <div className="bg-gray-900 p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Clock size={20} /> Class-Wise Arrival Report
              </h3>
              <span className="text-sm font-medium text-gray-400 bg-white/10 px-3 py-1 rounded-lg w-fit">
                {report.session
                  ? `Session: ${new Date(report.session.openedAt).toLocaleString()}`
                  : "No active session"}
              </span>
            </div>

            {report.records.length > 0 && (
              <button
                onClick={handleDownloadExcel}
                className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-95 text-sm shrink-0"
              >
                <Download size={16} /> Export Excel
              </button>
            )}
          </div>

          {report.records.length === 0 ? (
            <div className="p-12 text-center text-gray-400 flex-1 flex flex-col justify-center">
              <Users size={48} className="mx-auto mb-4 opacity-20" />
              <p className="font-medium text-lg">No arrivals recorded yet.</p>
              <p className="text-sm mt-1">
                When Usthads mark students, they will appear here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
              {sortedClasses.map((className) => (
                <div key={className} className="bg-white">
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

        {/* 🚀 RIGHT COLUMN: MISSING STUDENTS LIST */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden flex flex-col h-[650px]">
          <div className="bg-red-50 p-5 border-b border-red-100 flex justify-between items-center shrink-0">
            <h3 className="font-bold text-lg text-red-800 flex items-center gap-2">
              <UserX size={20} /> Missing
            </h3>
            {/* 🚀 Only show missing count if gate is closed */}
            {!isOpen && report.session && (
              <span className="text-xs font-black bg-red-600 text-white px-3 py-1 rounded-full shadow-sm">
                {missingStudents.length} Students
              </span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-50/50">
            {/* 🚀 LOGIC: Show Gate Open Placeholder OR Missing List */}
            {isOpen ? (
              <div className="text-center text-gray-400 mt-10 p-6 border-2 border-dashed border-emerald-200 rounded-2xl animate-pulse">
                <Unlock
                  size={40}
                  className="mx-auto mb-3 text-emerald-400 opacity-80"
                />
                <p className="font-bold text-gray-600">
                  Gate is Currently Open!
                </p>
                <p className="text-xs mt-2 font-medium text-gray-400">
                  Missing students will be calculated once the gate is closed
                  and the report is finalized.
                </p>
              </div>
            ) : !report.session ? (
              <div className="text-center text-gray-400 mt-10 p-6 border-2 border-dashed border-gray-200 rounded-2xl">
                <Clock
                  size={40}
                  className="mx-auto mb-3 text-gray-300 opacity-50"
                />
                <p className="font-medium text-gray-500">No active session.</p>
              </div>
            ) : missingStudents.length === 0 ? (
              <div className="text-center text-gray-400 mt-10 p-6 border-2 border-dashed border-gray-200 rounded-2xl">
                <CheckCircle2
                  size={40}
                  className="mx-auto mb-3 text-emerald-400 opacity-50"
                />
                <p className="font-medium text-gray-500">
                  All students arrived!
                </p>
              </div>
            ) : (
              paginatedMissing.map((student: any) => (
                <div
                  key={student.id}
                  className="bg-white p-3.5 rounded-xl border border-red-100/50 hover:border-red-200 hover:shadow-sm transition-all flex items-center justify-between"
                >
                  <div>
                    <p className="font-bold text-gray-800 capitalize truncate max-w-[150px]">
                      {student.fullName}
                    </p>
                    <p className="text-[10px] text-gray-500 font-medium">
                      Admn: {student.username}
                    </p>
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200 shrink-0">
                    Class {student.class || "Unassigned"}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* 🚀 Missing Pagination Footer (Only if Gate is Closed) */}
          {!isOpen && totalMissingPages > 1 && (
            <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between shrink-0">
              <button
                onClick={() => setMissingPage((prev) => Math.max(prev - 1, 1))}
                disabled={missingPage === 1}
                className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Page {missingPage} of {totalMissingPages}
              </span>
              <button
                onClick={() =>
                  setMissingPage((prev) =>
                    Math.min(prev + 1, totalMissingPages),
                  )
                }
                disabled={missingPage === totalMissingPages}
                className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>
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
