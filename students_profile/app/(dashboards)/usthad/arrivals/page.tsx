"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Search,
  Lock,
  ChevronLeft, // 🚀 Added
} from "lucide-react";
import toast from "react-hot-toast"; // 🚀 Upgraded to Toasts!

export default function LeaveArrivalsPage() {
  const [allStudents, setAllStudents] = useState<any[]>([]);
  const [classes, setClasses] = useState<string[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [excuses, setExcuses] = useState<{ [key: string]: boolean }>({});

  // 🚀 Added Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8;

  // Track students who ALREADY arrived from previous clicks/refreshes
  const [alreadyArrivedIds, setAlreadyArrivedIds] = useState<string[]>([]);

  // Track the input times for each student dynamically
  const [arrivalTimes, setArrivalTimes] = useState<{ [key: string]: string }>(
    {},
  );
  const [processingId, setProcessingId] = useState<string | null>(null);

  const getToken = () => localStorage.getItem("token");

  // Wrapped in useCallback so we can call it after every successful submission
  const fetchGateStatus = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3001/admin/arrivals/status", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setIsGateOpen(data.isOpen);
        // Set the array of students who already arrived
        setAlreadyArrivedIds(data.arrivedStudentIds || []);
      }
    } catch (error) {
      console.error("Failed to fetch gate status");
    }
  }, []);

  useEffect(() => {
    fetchGateStatus();
  }, [fetchGateStatus]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("http://localhost:3001/usthad/class-report", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) {
          const data = await res.json();
          setAllStudents(data);

          const uniqueClasses = Array.from(
            new Set(data.map((s: any) => s.class || "Unassigned")),
          );
          const sortedClasses = (uniqueClasses as string[]).sort(
            (a, b) => parseInt(a) - parseInt(b),
          );

          setClasses(sortedClasses);
          if (sortedClasses.length > 0) setSelectedClass(sortedClasses[0]);
        }
      } catch (error) {
        console.error("Failed to fetch students");
      }
    };
    fetchStudents();
  }, []);

  // 🚀 Reset to Page 1 whenever search or class changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedClass]);

  const handleTimeChange = (studentId: string, value: string) => {
    setArrivalTimes((prev) => ({ ...prev, [studentId]: value }));
  };

  const handleMarkArrival = async (studentId: string) => {
    const timeValue = arrivalTimes[studentId];
    if (!timeValue) {
      toast.error("Please select a date and time first!");
      return;
    }

    setProcessingId(studentId);

    try {
      const res = await fetch("http://localhost:3001/usthad/arrivals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({
          studentId,
          arrivalTime: timeValue,
          isExcused: excuses[studentId] || false, // Send excuse status
        }),
      });

      if (res.ok) {
        // Mark them as already arrived in the UI immediately
        setAlreadyArrivedIds((prev) => [...prev, studentId]);
        toast.success("Arrival recorded successfully!");
      } else {
        toast.error("Failed to record arrival.");
      }
    } catch (error) {
      toast.error("Server error.");
    } finally {
      setProcessingId(null);
    }
  };

  const filteredStudents = allStudents.filter(
    (s) =>
      (s.class || "Unassigned") === selectedClass &&
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // 🚀 Calculate Pagination Data
  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <Clock size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Arrivals</h1>
            <p className="text-gray-500 mt-1 font-medium">
              Record return times. Late arrivals auto-trigger a ₹150 fine.
            </p>
          </div>
        </div>

        <div className="flex gap-4">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-900 font-black rounded-xl outline-none focus:ring-2 focus:ring-indigo-300 cursor-pointer"
          >
            {classes.map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!isGateOpen ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-16 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">
            Arrival Marking is Closed
          </h2>
          <p className="text-gray-500 mt-2">
            The Admin has not opened the arrival gate yet, or the session has
            ended.
          </p>
        </div>
      ) : (
        <>
          {/* Data Entry Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div className="relative max-w-md w-full">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search student name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg outline-none focus:border-indigo-500 text-black"
                />
              </div>
              <div className="text-sm font-bold text-gray-500">
                Marked: {alreadyArrivedIds.length} Students
              </div>
            </div>

            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-left text-sm">
                <thead className="bg-white border-b border-gray-100 text-gray-500 uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="p-4 pl-6 font-bold w-1/3">
                      Student Details
                    </th>
                    <th className="p-4 font-bold w-1/3">Arrival Date & Time</th>
                    <th className="p-4 pr-6 font-bold text-right w-1/3">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {paginatedStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-12 text-gray-400"
                      >
                        No students found for this search.
                      </td>
                    </tr>
                  ) : (
                    paginatedStudents.map((student) => {
                      // Check if they are in the lock list!
                      const hasArrived = alreadyArrivedIds.includes(student.id);

                      return (
                        <tr
                          key={student.id}
                          className={`transition-colors h-20 ${hasArrived ? "bg-gray-50 opacity-60" : "hover:bg-gray-50"}`}
                        >
                          <td className="p-4 pl-6">
                            <p
                              className={`font-bold text-base capitalize ${hasArrived ? "text-gray-500 line-through" : "text-gray-900"}`}
                            >
                              {student.fullName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Admn: {student.username}
                            </p>
                          </td>

                          <td className="p-4">
                            {hasArrived ? (
                              <span className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100 w-fit">
                                <CheckCircle2 size={16} /> Recorded
                              </span>
                            ) : (
                              <div className="flex flex-col gap-2">
                                <input
                                  type="datetime-local"
                                  value={arrivalTimes[student.id] || ""}
                                  onChange={(e) =>
                                    handleTimeChange(student.id, e.target.value)
                                  }
                                  className="p-2 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500 text-black font-medium w-full max-w-[220px]"
                                />
                                <label className="flex items-center gap-2 cursor-pointer w-fit">
                                  <input
                                    type="checkbox"
                                    checked={excuses[student.id] || false}
                                    onChange={(e) =>
                                      setExcuses((prev) => ({
                                        ...prev,
                                        [student.id]: e.target.checked,
                                      }))
                                    }
                                    className="w-4 h-4 text-indigo-600 rounded cursor-pointer"
                                  />
                                  <span className="text-xs font-bold text-gray-600">
                                    Official Excuse (No Fine)
                                  </span>
                                </label>
                              </div>
                            )}
                          </td>

                          <td className="p-4 pr-6 text-right">
                            {hasArrived ? (
                              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                                Session Locked
                              </span>
                            ) : (
                              <button
                                disabled={
                                  !arrivalTimes[student.id] ||
                                  processingId === student.id
                                }
                                onClick={() => handleMarkArrival(student.id)}
                                className="bg-indigo-600 text-white font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {processingId === student.id
                                  ? "Saving..."
                                  : "Mark Arrived"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 🚀 Pagination Footer */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
        </>
      )}
    </div>
  );
}
