"use client";

import { useState, useEffect, useMemo } from "react";
import { BookX, Coins, Search, User, Filter } from "lucide-react";

export default function LibraryFinesPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState<string>("All"); // 🚀 New State for Class Filter
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const [title, setTitle] = useState("Late Book Return");
  const [amount, setAmount] = useState("50");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchStudents = async () => {
      const res = await fetch(
        "https://students-profile.onrender.com/usthad/students",
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (res.ok) setStudents(await res.json());
    };
    fetchStudents();
  }, []);

  // 🚀 Extract unique classes from the student list
  const availableClasses = useMemo(() => {
    const classes = new Set(students.map((s) => s.class).filter(Boolean));
    return [
      "All",
      ...Array.from(classes).sort((a, b) => parseInt(a) - parseInt(b)),
    ];
  }, [students]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(
        "https://students-profile.onrender.com/staff/fines",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            studentId: selectedStudent.id,
            title,
            description,
            amount,
          }),
        },
      );

      if (res.ok) {
        alert("Fine Issued Successfully!");
        setSelectedStudent(null);
        setDescription("");
      } else {
        alert(
          "Failed to issue fine. Are you assigned to the Library department?",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🚀 Filter students by BOTH Search Term AND Selected Class
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === "All" || s.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fadeInUp">
      <div className="bg-amber-50 p-6 rounded-2xl border border-amber-200 flex items-center gap-4 shadow-sm">
        <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg text-white">
          <BookX size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-amber-900 tracking-tight">
            Library Fines
          </h1>
          <p className="text-amber-700 font-medium">
            Issue monetary fines for damaged or late books.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 🚀 STUDENT SELECTION CARD */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col h-full">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg border-b pb-3">
            <User size={20} className="text-amber-600" /> 1. Select Student
          </h2>

          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-black font-medium transition-all"
              />
            </div>

            <div className="relative w-32">
              <Filter
                className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600"
                size={16}
              />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-amber-50 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-amber-900 font-bold cursor-pointer appearance-none transition-all"
              >
                {availableClasses.map((c) => (
                  <option key={c} value={c}>
                    {c === "All" ? "All Classes" : `Class ${c}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-2 max-h-[400px]">
            {filteredStudents.length === 0 ? (
              <p className="text-center text-gray-400 py-8 font-medium">
                No students found matching your criteria.
              </p>
            ) : (
              filteredStudents.map((student) => (
                <button
                  key={student.id}
                  onClick={() => setSelectedStudent(student)}
                  className={`w-full text-left p-4 rounded-xl border transition-all flex justify-between items-center ${
                    selectedStudent?.id === student.id
                      ? "bg-gradient-to-r from-amber-50 to-amber-100 border-amber-400 shadow-sm"
                      : "hover:bg-gray-50 border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div>
                    <p
                      className={`font-bold capitalize ${selectedStudent?.id === student.id ? "text-amber-900" : "text-gray-800"}`}
                    >
                      {student.fullName}
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      Admn: {student.username}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${
                      selectedStudent?.id === student.id
                        ? "bg-amber-200 text-amber-800"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    Class {student.class}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* 🚀 FINE FORM CARD */}
        <div
          className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-200 transition-all duration-300 ${
            !selectedStudent
              ? "opacity-60 grayscale-[0.5] pointer-events-none"
              : ""
          }`}
        >
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg border-b pb-3">
            <Coins size={20} className="text-amber-600" /> 2. Fine Details
          </h2>

          <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 mb-6 shadow-inner">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Target Student
            </p>
            {selectedStudent ? (
              <p className="font-black text-lg text-gray-900 capitalize flex items-center gap-2">
                {selectedStudent.fullName}
                <span className="bg-gray-200 text-gray-700 text-[10px] px-2 py-0.5 rounded-full">
                  Class {selectedStudent.class}
                </span>
              </p>
            ) : (
              <p className="font-medium text-gray-400 italic">
                Please select a student first...
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1.5">
                Fine Reason
              </label>
              <select
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-3 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-gray-900 font-bold cursor-pointer transition-all"
              >
                <option value="Late Book Return">Late Book Return</option>
                <option value="Torn / Damaged Book">Torn / Damaged Book</option>
                <option value="Lost Book Replacement">
                  Lost Book Replacement
                </option>
                <option value="Misbehavior in Library">
                  Misbehavior in Library
                </option>
              </select>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1.5">
                Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-amber-600 text-lg">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-amber-200 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-black text-amber-900 bg-amber-50/50 text-lg transition-all"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1.5">
                Specific Details / Book Name
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Kept 'History of Kerala' 5 days past due date."
                className="w-full p-3 border border-gray-200 bg-gray-50 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-gray-800 transition-all resize-none"
                rows={3}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !selectedStudent}
              className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black text-lg py-4 rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none disabled:cursor-not-allowed mt-2"
            >
              {isSubmitting ? "Processing..." : "Issue Library Fine"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
