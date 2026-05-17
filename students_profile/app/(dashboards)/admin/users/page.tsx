"use client";

import { useState, useEffect } from "react";
import {
  Users,
  ShieldBan,
  CheckCircle2,
  Search,
  Shield,
  GraduationCap,
  BookOpen,
  Filter,
  ChevronLeft, // 🚀 Added
  ChevronRight, // 🚀 Added
} from "lucide-react";
import toast from "react-hot-toast"; // 🚀 Added for premium notifications

interface User {
  id: string;
  fullName: string;
  username: string;
  role: string;
  isActive: boolean;
  class?: string;
  currentMonthPoints?: number;
  pastMonthPoints?: number;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter selections
  const [filterRole, setFilterRole] = useState("all");
  const [filterClass, setFilterClass] = useState("all");

  const [isLoading, setIsLoading] = useState(true);

  // 🚀 Added Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 8; // Adjust based on how many you want to show

  const getToken = () => localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3001/admin/users", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🚀 Reset to Page 1 whenever ANY filter changes!
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterClass]);

  const toggleAccess = async (id: string, currentStatus: boolean) => {
    try {
      // Optimistic UI Update
      setUsers(
        users.map((u) =>
          u.id === id ? { ...u, isActive: !currentStatus } : u,
        ),
      );
      const response = await fetch(
        `http://localhost:3001/admin/users/${id}/access`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ isActive: !currentStatus }),
        },
      );

      if (!response.ok) throw new Error("Failed");
      toast.success(currentStatus ? "Access revoked." : "Access restored.");
    } catch (err) {
      await fetchUsers(); // Revert on failure
      toast.error("Error updating user access.");
    }
  };

  // Extract unique classes
  const availableClasses = Array.from(
    new Set(users.map((u) => u.class).filter(Boolean)),
  ).sort();

  // THE WATERFALL FILTER
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.includes(searchTerm);

    const matchesRole = filterRole === "all" || u.role === filterRole;

    const matchesClass = filterClass === "all" || u.class === filterClass;

    return matchesSearch && matchesRole && matchesClass;
  });

  // Custom Sorting Logic
  const roleWeights: Record<string, number> = {
    admin: 1,
    usthad: 2,
    staff: 3,
    parent: 4,
    hisan: 5,
    subwing: 6,
    student: 7,
  };

  const sortedAndFilteredUsers = [...filteredUsers].sort((a, b) => {
    const weightA = roleWeights[a.role] || 99;
    const weightB = roleWeights[b.role] || 99;

    if (weightA !== weightB) {
      return weightA - weightB;
    }

    const classA = a.class || "";
    const classB = b.class || "";
    return classA.localeCompare(classB);
  });

  // 🚀 Calculate Pagination Data
  const totalPages =
    Math.ceil(sortedAndFilteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = sortedAndFilteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12 animate-fadeInUp">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#004643] rounded-xl flex items-center justify-center shadow-lg">
            <Users size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
            <p className="text-gray-500 mt-1 font-medium">
              View, search, and manage campus access.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[75vh]">
        <div className="p-5 border-b border-gray-200 bg-gray-50 space-y-4 shrink-0">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-3 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search by name or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 text-black py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#004643] focus:ring-1 focus:ring-[#004643] transition-all text-sm shadow-sm"
              />
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-3 shadow-sm focus-within:border-[#004643] transition-all">
              <Filter size={16} className="text-gray-400" />
              <select
                value={filterRole}
                onChange={(e) => {
                  setFilterRole(e.target.value);
                  if (
                    e.target.value !== "student" &&
                    e.target.value !== "all"
                  ) {
                    setFilterClass("all");
                  }
                }}
                className="py-2.5 bg-transparent outline-none text-sm font-medium text-gray-700 cursor-pointer"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins</option>
                <option value="staff">Staff</option>
                <option value="usthad">Usthads</option>
                <option value="student">Students</option>
                <option value="parent">Parents</option>
              </select>
            </div>

            {/* Class Filter */}
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              disabled={filterRole !== "all" && filterRole !== "student"}
              className="py-2.5 px-4 bg-white border border-gray-200 rounded-xl outline-none focus:border-[#004643] text-sm font-medium text-gray-700 shadow-sm cursor-pointer disabled:bg-gray-100 disabled:text-gray-400 transition-all"
            >
              <option value="all">All Classes</option>
              {availableClasses.map((className) => (
                <option key={className} value={className}>
                  {className}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 🚀 Render paginatedUsers instead of sortedAndFilteredUsers */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-gray-400 animate-pulse">
              Loading directory...
            </div>
          ) : paginatedUsers.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-400">
              No users match your filters.
            </div>
          ) : (
            paginatedUsers.map((user) => (
              <div
                key={user.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 mb-3 rounded-xl border transition-all gap-4 sm:gap-0 ${
                  user.isActive
                    ? "bg-white border-gray-100 hover:border-gray-300"
                    : "bg-red-50/50 border-red-100 grayscale opacity-80"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl shrink-0 ${
                      user.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : user.role === "student"
                          ? "bg-blue-50 text-blue-600"
                          : "bg-[#004643]/10 text-[#004643]"
                    }`}
                  >
                    {user.role === "admin" ? (
                      <Shield size={20} />
                    ) : user.role === "student" ? (
                      <GraduationCap size={20} />
                    ) : user.role === "parent" ? (
                      <Users size={20} />
                    ) : (
                      <BookOpen size={20} />
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      {user.fullName}
                    </h3>
                    <p className="text-sm text-gray-500 capitalize">
                      {user.role} • {user.username}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  {user.role === "student" && (
                    <div className="text-left sm:text-right">
                      <p className="font-black text-[#004643] text-lg">
                        {user.currentMonthPoints || 0}{" "}
                        <span className="text-xs font-normal text-gray-500">
                          pts (Active)
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                        Past Period: {user.pastMonthPoints || 0} pts
                      </p>
                    </div>
                  )}

                  <button
                    onClick={() => toggleAccess(user.id, user.isActive)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${
                      user.isActive
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    }`}
                  >
                    {user.isActive ? (
                      <>
                        <ShieldBan size={16} /> Revoke
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} /> Restore
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 🚀 Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-bold text-gray-500">
              Page {currentPage} of {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
