"use client";

import { useState, useEffect } from "react";
import {
  UserPlus,
  Phone,
  User,
  CheckCircle2,
  Search,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
} from "lucide-react";

export default function LinkParentTool({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  // 🚀 UI STATE: Which step are we on?
  const [step, setStep] = useState<1 | 2>(1);

  // Data States
  const [students, setStudents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  // Form States
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const getToken = () => localStorage.getItem("token");

  // Fetch students on load
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("http://localhost:3001/usthad/students", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) setStudents(await res.json());
      } catch (error) {
        console.error("Failed to fetch students");
      }
    };
    fetchStudents();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.includes(searchTerm),
  );

  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    setStep(2); // Move to Step 2!
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(
        "http://localhost:3001/admin/users/create-parent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({
            studentId: selectedStudent.id,
            parentName,
            parentPhone,
          }),
        },
      );

      if (res.ok) {
        setSuccessMsg("Parent account created and linked to student!");
        setParentName("");
        setParentPhone("");

        if (onSuccess) {
          setTimeout(() => onSuccess(), 1500);
        } else {
          setTimeout(() => {
            setSuccessMsg("");
            setStep(1); // Go back to the start
          }, 2000);
        }
      } else {
        alert("Failed to link parent. They might already exist.");
      }
    } catch (error) {
      alert("Server error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Dynamic Header */}
      <div className="bg-emerald-600 p-5 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          {step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="p-1 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <UserPlus size={24} />
          <h2 className="font-bold text-lg">
            {step === 1 ? "Step 1: Select Student" : "Step 2: Parent Details"}
          </h2>
        </div>
        <span className="text-emerald-200 font-bold text-sm bg-emerald-800/50 px-3 py-1 rounded-full">
          {step} / 2
        </span>
      </div>

      <div className="p-6 bg-gray-50 min-h-[300px]">
        {successMsg ? (
          <div className="flex flex-col items-center justify-center h-full text-emerald-600 py-10 animate-slideIn">
            <CheckCircle2 size={64} className="mb-4" />
            <h3 className="text-xl font-bold">{successMsg}</h3>
            <p className="text-gray-500 mt-2 text-sm">
              Returning to directory...
            </p>
          </div>
        ) : step === 1 ? (
          // ================= STEP 1: STUDENT SELECTION =================
          <div className="space-y-4 animate-slideIn">
            <div className="relative">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search students by name or admission number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 text-black"
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {filteredStudents.length === 0 ? (
                <p className="text-center text-gray-400 py-8">
                  No students found.
                </p>
              ) : (
                filteredStudents.map((student) => (
                  <button
                    key={student.id}
                    onClick={() => handleStudentSelect(student)}
                    className="w-full flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl hover:border-emerald-400 hover:shadow-md transition-all group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <GraduationCap size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 capitalize group-hover:text-emerald-700 transition-colors">
                          {student.fullName}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium">
                          Class {student.class} • Admn: {student.username}
                        </p>
                      </div>
                    </div>
                    <ChevronRight
                      size={20}
                      className="text-gray-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          // ================= STEP 2: PARENT FORM =================
          <form onSubmit={handleSubmit} className="space-y-6 animate-slideIn">
            {/* Selected Student Banner */}
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-wider text-emerald-600 mb-1">
                  Linking to
                </p>
                <p className="font-bold text-gray-900 capitalize">
                  {selectedStudent?.fullName}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-bold text-emerald-600 hover:underline"
              >
                Change
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-1">
                  <User size={14} /> Parent Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Abdul Rahman"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 text-black"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-1">
                  <Phone size={14} /> Mobile Number (Login ID)
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9876543210"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-medium tracking-wide text-black"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-black transition-all disabled:opacity-50"
            >
              {isSubmitting ? "Generating Account..." : "Confirm & Link Parent"}
            </button>
          </form>
        )}
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.2s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #d1d5db;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}
