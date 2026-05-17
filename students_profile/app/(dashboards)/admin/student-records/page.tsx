"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  GraduationCap,
  FolderOpen,
} from "lucide-react";
import toast from "react-hot-toast";

interface UserProfile {
  id: string;
  username: string;
  role: string;
  fullName: string;
  class?: string;
}

export default function StudentRecordsDirectory() {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:3001/admin/users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        // 🚀 Filter out staff/usthads so we only see students
        setStudents(data.filter((u: any) => u.role === "student"));
      } catch (error) {
        toast.error("Failed to load directory.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => setCurrentPage(1), [searchTerm]);

  const filteredStudents = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.class && s.class.includes(searchTerm)),
  );

  const totalPages = Math.ceil(filteredStudents.length / ITEMS_PER_PAGE) || 1;
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      <div className="flex flex-col gap-1 pb-4">
        <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
          <FolderOpen size={28} className="text-gray-400" /> Student Dossiers
        </h1>
        <p className="text-sm text-gray-500 font-medium ml-10">
          View full disciplinary and achievement histories for all students.
        </p>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[75vh]">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="relative">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name, Admn No, or class..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white border border-gray-200 rounded-2xl outline-none focus:ring-4 focus:ring-gray-100 text-gray-900 font-medium transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="text-center text-sm font-medium text-gray-400 mt-10 animate-pulse">
              Loading directory...
            </div>
          ) : paginatedStudents.length === 0 ? (
            <div className="text-center text-sm font-medium text-gray-400 mt-10">
              No students found.
            </div>
          ) : (
            paginatedStudents.map((student) => (
              <Link
                href={`/admin/student-records/${student.id}`}
                key={student.id}
                className="group flex items-center justify-between p-4 rounded-2xl transition-all duration-300 bg-transparent hover:bg-gray-900 hover:shadow-lg border border-gray-100 hover:border-gray-900"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center transition-colors group-hover:bg-gray-800">
                    <GraduationCap
                      size={20}
                      className="text-gray-400 group-hover:text-gray-300"
                    />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 capitalize group-hover:text-white transition-colors">
                      {student.fullName}
                    </p>
                    <p className="text-xs font-semibold text-gray-400 group-hover:text-gray-400 mt-0.5">
                      Admn: {student.username}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 group-hover:bg-gray-800 group-hover:text-gray-300 transition-colors">
                  Class {student.class || "N/A"}
                </span>
              </Link>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-20"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-20"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
