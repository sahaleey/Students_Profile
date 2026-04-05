// src/app/(dashboards)/usthad/attachments/page.tsx
"use client";

import { useState } from "react";
import {
  UserPlus,
  FileText,
  ArrowLeft,
  CheckCircle2,
  Search,
  Paperclip,
} from "lucide-react";

const STUDENT_DATA = [
  {
    className: "Nahjurrashad SS2",
    students: [
      { id: "1042", name: "Sahaleey" },
      { id: "1045", name: "Faris" },
    ],
  },
  {
    className: "Nahjurrashad SS1",
    students: [
      { id: "1080", name: "Ahmad" },
      { id: "1081", name: "Bilal" },
    ],
  },
];

export default function AttachmentsPage() {
  const [step, setStep] = useState(1);
  const [selectedStudent, setSelectedStudent] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [attachments, setAttachments] = useState([
    {
      id: "A105",
      student: "Sahaleey (1042)",
      punishment: "P01 (Late)",
      work: "Book Review",
      status: "Resolves Punishment",
    },
  ]);

  // 🔥 The Search Filter Logic
  const filteredStudents = STUDENT_DATA.map((group) => ({
    ...group,
    students: group.students.filter(
      (s) =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.id.includes(searchTerm),
    ),
  })).filter((group) => group.students.length > 0);

  const resetWizard = () => {
    setSelectedStudent(null);
    setStep(1);
    setSearchTerm(""); // Clear search on reset
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT COLUMN: MULTI-STEP WIZARD */}
      <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-blue-100 overflow-hidden flex flex-col h-[600px]">
        {/* Step Tracker */}
        <div className="bg-blue-50 p-4 border-b border-blue-100">
          <div className="flex items-center justify-between relative">
            <div
              className={`flex flex-col items-center z-10 ${step >= 1 ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 border-2 ${step >= 1 ? "bg-blue-100 border-blue-600" : "bg-gray-50 border-gray-300"}`}
              >
                1
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">
                Select
              </span>
            </div>
            <div
              className={`absolute top-4 left-8 right-8 h-[2px] z-0 ${step === 2 ? "bg-blue-600" : "bg-gray-300"}`}
            />
            <div
              className={`flex flex-col items-center z-10 ${step === 2 ? "text-blue-600" : "text-gray-400"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 border-2 ${step === 2 ? "bg-blue-100 border-blue-600" : "bg-gray-50 border-gray-300"}`}
              >
                2
              </div>
              <span className="text-xs font-bold uppercase tracking-wider">
                Attach
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {/* STEP 1: SEARCH & SELECT */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
              {/* Search Bar */}
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
                  className="w-full pl-10 pr-4 py-2 bg-[#fafafa] border border-gray-200 text-black rounded-xl outline-none focus:border-blue-500 transition-colors text-sm"
                />
              </div>

              {/* Student List */}
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
                            onClick={() => {
                              setSelectedStudent(student);
                              setStep(2);
                            }}
                            className="w-full flex items-center justify-between p-3 bg-[#fafafa] border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-colors group text-left"
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
                              className="text-gray-400 group-hover:text-blue-500 transition-colors"
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

          {/* STEP 2: ATTACHMENT FORM */}
          {step === 2 && selectedStudent && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="flex items-center gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
                <button
                  onClick={resetWizard}
                  className="p-1 hover:bg-blue-200 rounded-lg text-blue-700 transition-colors"
                >
                  <ArrowLeft size={18} />
                </button>
                <div>
                  <p className="text-xs text-blue-600 font-bold uppercase">
                    Attaching for:
                  </p>
                  <p className="font-bold text-blue-900">
                    {selectedStudent.name} ({selectedStudent.id})
                  </p>
                </div>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="text-sm font-bold text-gray-700">
                    Target Punishment
                  </label>
                  <select className="w-full mt-1 p-2 bg-[#fafafa] border border-gray-200 rounded-lg outline-none text-black focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <option>P01 - Late to class</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700">
                    Submitted Work
                  </label>
                  <select className="w-full mt-1 p-2 text-black bg-[#fafafa] border border-gray-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                    <option>Newspaper Translation</option>
                    <option>Book Review</option>
                  </select>
                </div>
                <button
                  type="button"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all flex justify-center items-center gap-2"
                >
                  <Paperclip size={18} /> Attach & Resolve
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
            <FileText size={18} className="text-gray-500" /> Attachment Records
          </h2>
        </div>
        <div className="p-4 flex-1 overflow-y-auto space-y-3">
          {attachments.map((a) => (
            <div
              key={a.id}
              className="p-4 border border-gray-100 rounded-xl bg-[#fafafa] hover:shadow-sm transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-gray-800">{a.student}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    Work:{" "}
                    <span className="font-semibold text-gray-800">
                      {a.work}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                    ↳ Clears:{" "}
                    <span className="text-red-500 font-semibold">
                      {a.punishment}
                    </span>
                  </p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 font-bold px-3 py-1 rounded-full flex items-center gap-1">
                  <CheckCircle2 size={14} /> {a.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
