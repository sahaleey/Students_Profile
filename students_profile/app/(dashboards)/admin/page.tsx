"use client";

import { useState, useEffect } from "react";
import {
  UserPlus,
  Shield,
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  Key,
  Sparkles,
  Users, // 🚀 Added
  Search, // 🚀 Added
  ChevronLeft, // 🚀 Added
  ChevronRight, // 🚀 Added
} from "lucide-react";

export default function AdminCentre() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 🚀 NEW: States for the User List & Pagination
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    role: "student",
    class: "1",
    username: "",
    password: "campus123",
  });

  const getToken = () => localStorage.getItem("token");

  // 🚀 NEW: Fetch existing users to show in the paginated list
  const fetchUsers = async () => {
    try {
      const res = await fetch(
        "https://students-profile.onrender.com/admin/users",
        {
          headers: { Authorization: `Bearer ${getToken()}` },
        },
      );
      if (res.ok) {
        const data = await res.json();
        setUsersList(data);
      }
    } catch (err) {
      console.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🚀 Reset pagination when searching
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMsg("");

    let payload: any = {
      fullName: formData.fullName,
      role: formData.role,
      username: formData.username,
      password: formData.password,
    };

    if (formData.role === "student") {
      payload.class = formData.class;
    }

    try {
      const response = await fetch(
        "https://students-profile.onrender.com/admin/users",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify(payload),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create user");
      }

      setSuccessMsg(`User ${formData.fullName} created successfully!`);

      setFormData({
        fullName: "",
        role: "student",
        class: "1",
        username: "",
        password: "campus123",
      });

      // 🚀 Refresh the list immediately so the new user appears!
      await fetchUsers();
    } catch (err) {
      setError("Failed to create user. Username might already exist.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  const roleColors = {
    student: "from-emerald-500 to-emerald-600",
    usthad: "from-blue-500 to-blue-600",
    hisan: "from-purple-500 to-purple-600",
    admin: "from-red-500 to-red-600",
    subwing: "from-orange-500 to-orange-600",
    staff: "from-teal-500 to-teal-600",
  };

  // 🚀 Filter and Paginate Logic
  const filteredUsers = usersList.filter(
    (u) =>
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-14 h-14 bg-gradient-to-br from-[#004643] to-[#00665e] rounded-xl flex items-center justify-center shadow-xl">
              <Shield size={26} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#004643] to-[#00665e] bg-clip-text text-transparent">
              Admin Centre
            </h1>
            <p className="text-gray-500 mt-1 font-medium flex items-center gap-2">
              Register new members and manage the campus portal
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-slideIn max-w-4xl">
          <AlertTriangle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 p-4 rounded-xl flex items-center gap-3 animate-slideIn max-w-4xl">
          <CheckCircle2 size={20} />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* 🚀 GRID LAYOUT: FORM ON LEFT, LIST ON RIGHT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: CREATE FORM */}
        <div className="lg:col-span-1 space-y-6">
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl">
            <div className="bg-gradient-to-r from-[#004643] to-[#00665e] p-5 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -ml-12 -mb-12" />
              <h2 className="font-bold text-xl flex items-center gap-2 relative z-10">
                <UserPlus size={20} /> Create Account
              </h2>
            </div>

            <form
              onSubmit={handleCreateUser}
              className="p-5 space-y-4 bg-gradient-to-b from-white/50 to-white/30"
            >
              {/* Form fields compacted slightly */}
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <UserPlus size={14} /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="e.g., Muhammed Bilal"
                  className="w-full mt-1 p-2.5 bg-white/80 backdrop-blur-sm text-black border border-gray-200 rounded-xl outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Shield size={14} /> Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                  className="w-full mt-1 p-2.5 bg-white/80 text-black backdrop-blur-sm border border-gray-200 rounded-xl outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all cursor-pointer"
                >
                  <option value="student">Student</option>
                  <option value="usthad">Usthad (Teacher)</option>
                  <option value="hisan">HISAN / Union</option>
                  <option value="admin">System Admin</option>
                  <option value="subwing">Hisan Subwing</option>
                  <option value="staff">Staff</option>
                </select>
              </div>

              {formData.role === "student" && (
                <div className="animate-slideIn">
                  <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <GraduationCap size={14} /> Class / Batch
                  </label>
                  <select
                    value={formData.class}
                    onChange={(e) =>
                      setFormData({ ...formData, class: e.target.value })
                    }
                    className="w-full mt-1 p-2.5 bg-white/80 backdrop-blur-sm border text-black border-gray-200 rounded-xl outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all cursor-pointer"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num.toString()}>
                        Class {num}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Key size={14} /> Username / Admn No.
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  placeholder={
                    formData.role === "staff"
                      ? "e.g., central_staff"
                      : "e.g., 1080"
                  }
                  className="w-full mt-1 p-2.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl outline-none text-black focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Key size={14} /> Password
                </label>
                <input
                  type="text"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full mt-1 p-2.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all text-gray-600"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-[#004643] to-[#00665e] hover:from-[#003634] hover:to-[#004643] text-white font-bold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] mt-4"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <UserPlus size={18} /> Create Account
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Tips */}
          <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-white/50">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white/50 rounded-lg">
                <Sparkles size={16} className="text-[#004643]" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-700">
                  Admin Tips
                </p>
                <p className="text-xs text-gray-600 mt-0.5">
                  • Student usernames should be their admission numbers
                  <br />• Staff usernames should be simple
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 🚀 RIGHT COLUMN: PAGINATED USERS LIST */}
        <div className="lg:col-span-2">
          <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 overflow-hidden h-[730px] flex flex-col transition-all duration-300 hover:shadow-2xl">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
                <Users size={20} className="text-[#004643]" /> Registered Users
              </h2>
              <span className="text-xs font-bold bg-[#004643]/10 text-[#004643] px-3 py-1 rounded-full">
                {usersList.length} Total
              </span>
            </div>

            <div className="p-4 border-b border-gray-100">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name, ID, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#004643] text-black font-medium transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {paginatedUsers.length === 0 ? (
                <div className="text-center text-gray-400 mt-12">
                  <Users size={40} className="mx-auto mb-3 opacity-20" />
                  <p>No users found matching your search.</p>
                </div>
              ) : (
                paginatedUsers.map((user, index) => (
                  <div
                    key={user.id || index}
                    className="flex items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-[#004643]/30 hover:shadow-md transition-all"
                  >
                    <div>
                      <p className="font-bold text-gray-900 capitalize">
                        {user.fullName}
                      </p>
                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                        ID: {user.username}
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3">
                      {user.class && user.role === "student" && (
                        <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                          Class {user.class}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${
                          user.role === "admin"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : user.role === "usthad"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : user.role === "student"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : user.role === "staff"
                                  ? "bg-teal-50 text-teal-700 border-teal-200"
                                  : "bg-purple-50 text-purple-700 border-purple-200"
                        }`}
                      >
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* 🚀 Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
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
      </div>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }
        .animate-slideIn {
          animation: slideIn 0.4s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
