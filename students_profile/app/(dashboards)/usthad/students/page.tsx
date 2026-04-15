"use client";

import { useState, useEffect } from "react";
import { Users, Search, GraduationCap, ChevronRight } from "lucide-react";
import Link from "next/link";

interface Student {
  id: string;
  fullName: string;
  username: string;
  class: string;
}

export default function HisanStudentDirectory() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch("http://localhost:3001/usthad/students", {
          headers: { Authorization: `Bearer ${getToken()}` },
        });
        if (res.ok) setStudents(await res.json());
      } catch (error) {
        console.error("Failed to fetch students");
      } finally {
        setIsLoading(false);
      }
    };
    fetchStudents();
  }, []);

  // 1. Group by Class
  const groupedStudents = students.reduce(
    (acc, student) => {
      const cName = student.class ? `Class ${student.class}` : "Unassigned";
      if (!acc[cName]) acc[cName] = { className: cName, students: [] };
      acc[cName].students.push(student);
      return acc;
    },
    {} as Record<string, { className: string; students: Student[] }>,
  );

  // 2. Filter by Search Term
  const filteredStudents = Object.values(groupedStudents)
    .map((group) => ({
      ...group,
      students: group.students.filter(
        (s) =>
          s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.username.includes(searchTerm),
      ),
    }))
    .filter((group) => group.students.length > 0);

  // 3. Sort classes numerically if possible
  const sortedFilteredGroups = filteredStudents.sort((a, b) => {
    const numA = parseInt(a.className.replace(/\D/g, "")) || 0;
    const numB = parseInt(b.className.replace(/\D/g, "")) || 0;
    return numA - numB;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-fuchsia-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Users size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Student Directory
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Search and analyze individual student performance.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="relative max-w-xl">
            <Search
              className="absolute left-4 top-3.5 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by student name or admission number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-black font-medium"
            />
          </div>
        </div>

        {/* Categorized List */}
        <div className="p-6 space-y-8">
          {isLoading ? (
            <p className="text-center text-purple-600 font-bold animate-pulse">
              Loading directory...
            </p>
          ) : sortedFilteredGroups.length === 0 ? (
            <p className="text-center text-gray-400">
              No students found matching your search.
            </p>
          ) : (
            sortedFilteredGroups.map((group) => (
              <div key={group.className}>
                <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
                  <GraduationCap size={18} /> {group.className}
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.students.map((student) => (
                    <Link
                      key={student.id}
                      href={`/usthad/students/${student.id}`}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-purple-400 hover:shadow-md transition-all group"
                    >
                      <div>
                        <h3 className="font-bold text-gray-900 group-hover:text-purple-700 transition-colors capitalize">
                          {student.fullName}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          Admn: {student.username}
                        </p>
                      </div>
                      <ChevronRight
                        size={20}
                        className="text-gray-300 group-hover:text-purple-500 group-hover:translate-x-1 transition-all"
                      />
                    </Link>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
