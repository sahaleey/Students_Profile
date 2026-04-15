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
  Filter, // Added a nice icon for the filters
} from "lucide-react";

interface User {
  id: string;
  fullName: string;
  username: string;
  role: string;
  isActive: boolean;
  class?: string; // NOTE: I changed this back to 'class' assuming your backend sends it as 'class'
  currentMonthPoints?: number;
  pastMonthPoints?: number;
}

export default function ManageUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. NEW STATE: Filter selections
  const [filterRole, setFilterRole] = useState("all");
  const [filterClass, setFilterClass] = useState("all");

  const [isLoading, setIsLoading] = useState(true);

  const getToken = () => localStorage.getItem("token");

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:3001/admin/users", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(data);
      console.log(getToken());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleAccess = async (id: string, currentStatus: boolean) => {
    try {
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
    } catch (err) {
      await fetchUsers();
      alert("Error updating user access.");
    }
  };

  // 2. DYNAMIC CLASSES: Extract unique classes from the data so we don't hardcode them
  const availableClasses = Array.from(
    new Set(users.map((u) => u.class).filter(Boolean)),
  ).sort(); // Sorts them alphabetically

  // 3. THE WATERFALL FILTER
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.includes(searchTerm);

    const matchesRole = filterRole === "all" || u.role === filterRole;

    // Only check class if a specific class is selected
    const matchesClass = filterClass === "all" || u.class === filterClass;

    return matchesSearch && matchesRole && matchesClass;
  });

  // 4. Custom Sorting Logic (Unchanged, it just sorts whatever survives the filter)
  const roleWeights: Record<string, number> = {
    admin: 1,
    usthad: 2,
    parent: 3,
    hisan: 4,
    student: 5,
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
        <div className="p-5 border-b border-gray-200 bg-gray-50 space-y-4">
          {/* 5. UPDATED UI: Added Flexbox to hold Search and Dropdowns */}
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
                  // Reset class filter if we switch to a role that doesn't have classes (like admin)
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
                <option value="usthad">Usthads</option>
                <option value="student">Students</option>
              </select>
            </div>

            {/* Class Filter (Disabled if searching for non-students) */}
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

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full text-gray-400">
              Loading directory...
            </div>
          ) : sortedAndFilteredUsers.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-400">
              No users match your filters.
            </div>
          ) : (
            sortedAndFilteredUsers.map((user) => (
              <div
                key={user.id}
                className={`flex items-center justify-between p-4 mb-3 rounded-xl border transition-all ${user.isActive ? "bg-white border-gray-100 hover:border-gray-300" : "bg-red-50/50 border-red-100 grayscale opacity-80"}`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-xl ${user.role === "admin" ? "bg-purple-100 text-purple-700" : user.role === "student" ? "bg-blue-50 text-blue-600" : "bg-[#004643]/10 text-[#004643]"}`}
                  >
                    {user.role === "admin" ? (
                      <Shield size={20} />
                    ) : user.role === "student" ? (
                      <GraduationCap size={20} />
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

                {/* 🚀 NEW Right Side: Points Display & Button */}
                <div className="flex items-center gap-6">
                  {user.role === "student" && (
                    <div className="text-right hidden sm:block">
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
                </div>

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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
