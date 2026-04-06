// src/app/(dashboards)/usthad/punishments/page.tsx
"use client";

import { useState } from "react";
import {
  UserPlus,
  FileText,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Search,
} from "lucide-react";

// Dummy Data structured Class-wise
const STUDENT_DATA = [
  {
    className: "Senior Secondary Year 2",
    students: [
      { id: "1042", name: "Sahaleey" },
      { id: "1045", name: "Faris" },
    ],
  },
  {
    className: "Senior Secondary Year 1",
    students: [
      { id: "1080", name: "Ahmad" },
      { id: "1081", name: "Bilal" },
    ],
  },
];

export default function PunishmentsPage() {
  const [step, setStep] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  // Dummy List Data
  const [punishments, setPunishments] = useState([
    {
      id: "P01",
      student: "Sahaleey (1042)",
      status: "Active",
      reason: "Late to class",
    },
    {
      id: "P02",
      student: "Faris (1045)",
      status: "Resolved",
      reason: "Assignment missing",
    },
  ]);
  const filteredStudents = STUDENT_DATA.map((group) => ({
    ...group,
    students: group.students.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.includes(searchTerm),
    ),
  })).filter((group) => group.students.length > 0);

  // Handlers
  const handleSelectStudent = (student: { id: string; name: string }) => {
    setSelectedStudent(student);
    setStep(2);
  };

  const resetWizard = () => {
    setSelectedStudent(null);
    setStep(1);
    setSearchTerm("");
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT COLUMN: MULTI-STEP  */}
      <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden flex flex-col h-[600px]">
        {/* Step Tracker Header */}
        <div className="bg-red-50 p-4 border-b border-red-100">
          <div className="flex items-center justify-between relative">
            {/* Step 1 Indicator */}
            <div
              className={`flex flex-col items-center z-10 ${step >= 1 ? "text-red-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 border-2 ${step >= 1 ? "bg-red-100 border-red-600" : "bg-gray-50 border-gray-300"}`}
              >
                1
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">
                Select
              </span>
            </div>

            {/* Connecting Line */}
            <div
              className={`absolute top-4 left-8 right-8 h-[2px] z-0 ${step === 2 ? "bg-red-600" : "bg-gray-300"}`}
            />

            {/* Step 2 Indicator */}
            <div
              className={`flex flex-col items-center z-10 ${step === 2 ? "text-red-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 border-2 ${step === 2 ? "bg-red-100 border-red-600" : "bg-gray-50 border-gray-300"}`}
              >
                2
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">
                Details
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="p-4 flex-1 overflow-y-auto">
          {/* STEP 1: CLASS-WISE STUDENT LIST */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
              {/* SEARCH */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name or admn no..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 text-black pr-4 py-2 bg-[#fafafa] border border-gray-200 rounded-xl outline-none focus:border-red-500 transition-colors text-sm"
                />
              </div>

              {/* STUDENT LIST */}
              <div className="space-y-6 mt-4">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((group) => (
                    <div key={group.className}>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b pb-1">
                        {group.className}
                      </h3>
                      <div className="space-y-2">
                        {group.students.map((student) => (
                          <button
                            key={student.id}
                            onClick={() => handleSelectStudent(student)}
                            className="w-full flex items-center justify-between p-3 bg-[#fafafa] border border-gray-200 rounded-xl hover:border-red-300 hover:bg-red-50 transition-colors group text-left"
                          >
                            <div>
                              <p className="font-bold text-gray-800">
                                {student.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Admn: {student.id}
                              </p>
                            </div>
                            <UserPlus
                              size={18}
                              className="text-gray-400 group-hover:text-red-500 transition-colors"
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-gray-500 mt-8">
                    No students found.
                  </p>
                )}
              </div>
            </div>
          )}

          {/* STEP 2: PUNISHMENT FORM */}
          {step === 2 && selectedStudent && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              {/* Selected Student Banner */}
              <div className="flex items-center gap-3 bg-red-50 p-3 rounded-xl border border-red-100">
                <button
                  onClick={resetWizard}
                  className="p-1 hover:bg-red-200 rounded-lg text-red-700 transition-colors"
                  title="Back to list"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <p className="text-xs text-red-600 font-bold uppercase">
                    Assigning to:
                  </p>
                  <p className="font-bold text-red-900">
                    {selectedStudent.name} ({selectedStudent.id})
                  </p>
                </div>
              </div>

              {/* Form Inputs */}
              <form className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-700">
                    Punishment Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Library Duty"
                    className="w-full text-black mt-1 p-2 bg-[#fafafa] border border-gray-200 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700">
                    Category / Reason
                  </label>
                  <select className="w-full text-black mt-1 p-2 bg-[#fafafa] border border-gray-200 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500">
                    <option>Public Behavior</option>
                    <option>Academics</option>
                    <option>Mosque Attendance</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-bold text-gray-700">
                    Detailed Description
                  </label>
                  <textarea
                    placeholder="Describe the incident..."
                    className="w-full text-black mt-1 p-2 bg-[#fafafa] border border-gray-200 rounded-lg outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 min-h-[80px]"
                  />
                </div>

                <button
                  type="button"
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                >
                  <AlertCircle size={18} /> Apply Punishment
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: LIST */}
      <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden h-[600px] flex flex-col">
        <div className="bg-gray-50 p-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <FileText size={18} className="text-gray-500" /> Punishment Records
          </h2>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {punishments.map((p) => (
            <div
              key={p.id}
              className="flex justify-between items-center p-4 border border-gray-100 rounded-xl bg-[#fafafa] hover:shadow-sm transition-shadow"
            >
              <div>
                <p className="font-bold text-gray-800">{p.student}</p>
                <p className="text-sm text-gray-500 mt-1">{p.reason}</p>
              </div>
              <span
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${p.status === "Active" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
              >
                {p.status === "Resolved" && <CheckCircle2 size={14} />}
                {p.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
