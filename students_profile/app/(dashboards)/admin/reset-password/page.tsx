"use client";

import { useState, useEffect } from "react";
import {
  KeyRound,
  Search,
  UserCheck,
  ShieldAlert,
  Save,
  CheckCircle2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import toast from "react-hot-toast";

export default function AdminPasswordResetPage() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 7;

  const getToken = () => localStorage.getItem("token");

  // Fetch Users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch(
          "https://students-profile.onrender.com/admin/users",
          {
            headers: { Authorization: `Bearer ${getToken()}` },
          },
        );
        if (res.ok) setUsersList(await res.json());
      } catch (err) {
        toast.error("Failed to load users directory");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // Reset pagination on search
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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

  // 🚀 THE FIX: A Safe Copy Function
  const copyToClipboard = (text: string) => {
    if (navigator.clipboard && window.isSecureContext) {
      // Modern secure way
      navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard!", { icon: "📋" });
    } else {
      // Fallback or warning if HTTP
      toast.error("Clipboard access denied. Please copy manually.");
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !newPassword) return;

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }

    const toastId = toast.loading(
      `Resetting password for ${selectedUser.fullName}...`,
    );
    setIsSubmitting(true);

    try {
      const res = await fetch(
        `https://students-profile.onrender.com/admin/users/${selectedUser.id}/reset-password`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ newPassword }),
        },
      );

      if (!res.ok) throw new Error("Failed to reset password");

      toast.success("Password updated successfully!", { id: toastId });

      // 🚀 Use the safe copy function
      copyToClipboard(newPassword);

      setNewPassword("");
    } catch (error: any) {
      console.error("Reset Password Error:", error);
      toast.error(
        error.message || "Failed to reset password. Please try again.",
        { id: toastId },
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center shadow-lg">
          <KeyRound size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Security & Access
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Forcibly reset passwords for users who have lost access.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* LEFT COLUMN: User Selection */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[700px]">
          <div className="p-5 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-bold text-gray-800 flex items-center gap-2 text-lg">
              <Search size={18} className="text-gray-500" /> Find User
            </h2>
          </div>

          <div className="p-4 border-b border-gray-100">
            <input
              type="text"
              placeholder="Search by name, ID, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-black font-medium transition-all"
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isLoading ? (
              <div className="text-center text-gray-400 mt-12 animate-pulse">
                Loading directory...
              </div>
            ) : paginatedUsers.length === 0 ? (
              <div className="text-center text-gray-400 mt-12">
                No users found.
              </div>
            ) : (
              paginatedUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setSelectedUser(user);
                    setNewPassword("");
                  }}
                  className={`w-full text-left flex items-center justify-between p-4 rounded-xl border transition-all ${
                    selectedUser?.id === user.id
                      ? "bg-red-50 border-red-300 shadow-sm"
                      : "bg-white border-gray-100 hover:border-red-200 hover:bg-gray-50"
                  }`}
                >
                  <div>
                    <p
                      className={`font-bold capitalize ${selectedUser?.id === user.id ? "text-red-900" : "text-gray-900"}`}
                    >
                      {user.fullName}
                    </p>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">
                      ID: {user.username}
                    </p>
                  </div>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border ${
                      user.role === "admin"
                        ? "bg-purple-50 text-purple-700 border-purple-200"
                        : user.role === "student"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                    }`}
                  >
                    {user.role}
                  </span>
                </button>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between shrink-0">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
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
                className="p-2 rounded-lg bg-white border border-gray-200 hover:bg-gray-100 text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Reset Action */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden h-[700px] flex flex-col relative">
          {!selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-gray-400">
              <ShieldAlert size={64} className="mb-4 opacity-20" />
              <h3 className="text-xl font-bold text-gray-700">
                No User Selected
              </h3>
              <p className="mt-2 text-sm">
                Select a user from the directory to reset their password.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col animate-slideIn">
              <div className="bg-gradient-to-r from-red-600 to-red-800 p-8 text-white relative overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
                <h2 className="text-2xl font-black mb-1 capitalize">
                  {selectedUser.fullName}
                </h2>
                <p className="text-red-200 font-medium">
                  Admn No: {selectedUser.username}
                </p>
              </div>

              <form
                onSubmit={handleResetPassword}
                className="p-8 flex-1 flex flex-col justify-center"
              >
                <div className="bg-red-50 border border-red-100 p-4 rounded-xl mb-8 flex items-start gap-3">
                  <Shield size={20} className="text-red-600 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800 font-medium leading-relaxed">
                    You are about to forcibly overwrite this user's password.
                    This action cannot be undone. Ensure you securely
                    communicate the new password to the user.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-bold text-gray-700 block mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password..."
                        className="w-full p-4 bg-gray-50 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-red-500 text-black font-bold tracking-wide transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(newPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-700 transition-colors"
                        title="Copy to clipboard"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                      Tip: Use something simple like{" "}
                      <span className="font-bold text-gray-700">campus123</span>{" "}
                      and tell them to change it after logging in.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || !newPassword}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all flex justify-center items-center gap-2 disabled:opacity-50 active:scale-95"
                  >
                    <Save size={18} />{" "}
                    {isSubmitting ? "Overwriting..." : "Force Reset Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
