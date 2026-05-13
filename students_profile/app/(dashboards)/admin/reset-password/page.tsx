"use client";

import { useEffect, useState } from "react";
import {
  KeyRound,
  Search,
  ShieldAlert,
  Check,
  Copy,
  ChevronLeft,
  ChevronRight,
  Shield,
  User as UserIcon,
} from "lucide-react";

import toast from "react-hot-toast";

interface UserProfile {
  id: string;
  username: string;
  role: string;
  fullName: string;
  class?: string;
}

export default function AdminPasswordResetPage() {
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const [newPassword, setNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasCopied, setHasCopied] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const ITEMS_PER_PAGE = 8;

  const API_URL = "https://students-profile.onrender.com";

  const getToken = () => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  };

  // =========================
  // FETCH USERS
  // =========================
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = getToken();
        if (!token) {
          toast.error("Authentication token missing");
          return;
        }

        const res = await fetch(`${API_URL}/admin/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Failed to fetch users");

        setUsersList(data);
      } catch (error: any) {
        toast.error(error.message || "Failed to load users directory");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // =========================
  // SEARCH FILTER
  // =========================
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredUsers = usersList.filter((u) => {
    return (
      u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.role?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  // =========================
  // COPY PASSWORD
  // =========================
  const copyToClipboard = async (text: string) => {
    if (!text) {
      toast.error("Nothing to copy");
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
        toast.success("Password copied!");
      } else {
        toast.error("Clipboard access denied. Please copy manually.");
      }
    } catch (error) {
      toast.error("Failed to copy password");
    }
  };

  // =========================
  // RESET PASSWORD
  // =========================
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    if (!newPassword.trim() || newPassword.length < 4) {
      toast.error("Password must be at least 4 characters long");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = getToken();
      if (!token) return;

      const url = `${API_URL}/admin/users/${selectedUser.id}/reset-password`;
      const loadingToast = toast.loading(`Resetting password...`);

      const res = await fetch(url, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ newPassword }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {}

      if (!res.ok) throw new Error(data.message || "Failed to reset password");

      toast.success("Access restored successfully!", { id: loadingToast });
      await copyToClipboard(newPassword);
      setNewPassword("");
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-12 font-sans animate-fadeInUp">
      {/* HEADER: Ultra Minimal */}
      <div className="flex flex-col gap-1 pb-2">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <KeyRound size={28} strokeWidth={2.5} className="text-gray-300" />
          Access Recovery
        </h1>
        <p className="text-sm text-gray-500 font-medium ml-[44px]">
          Securely override user credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* USERS PANEL (Left - 5 Columns) */}
        <div className="lg:col-span-5 flex flex-col h-[650px]">
          <div className="relative mb-6">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search directory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border-transparent rounded-[1.25rem] outline-none focus:bg-white focus:ring-4 focus:ring-gray-100 text-gray-900 text-sm font-semibold transition-all placeholder:text-gray-400 placeholder:font-medium shadow-sm"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-1.5 pr-2 custom-scrollbar">
            {isLoading ? (
              <div className="text-center text-sm font-medium text-gray-400 mt-10 animate-pulse">
                Loading directory...
              </div>
            ) : paginatedUsers.length === 0 ? (
              <div className="text-center text-sm font-medium text-gray-400 mt-10">
                No users found.
              </div>
            ) : (
              paginatedUsers.map((user) => {
                const isSelected = selectedUser?.id === user.id;
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => {
                      setSelectedUser(user);
                      setNewPassword("");
                    }}
                    className={`w-full text-left group p-4 rounded-2xl transition-all duration-300 flex items-center justify-between ${
                      isSelected
                        ? "bg-gray-900 shadow-xl scale-[1.02]"
                        : "bg-transparent hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isSelected ? "bg-gray-800" : "bg-gray-100 group-hover:bg-white"}`}
                      >
                        <UserIcon
                          size={18}
                          className={
                            isSelected ? "text-gray-300" : "text-gray-400"
                          }
                        />
                      </div>
                      <div>
                        <p
                          className={`font-bold text-sm capitalize truncate max-w-[140px] transition-colors ${isSelected ? "text-white" : "text-gray-900"}`}
                        >
                          {user.fullName}
                        </p>
                        <p
                          className={`text-[11px] font-semibold tracking-wide mt-0.5 transition-colors ${isSelected ? "text-gray-400" : "text-gray-400"}`}
                        >
                          {user.username}
                        </p>
                      </div>
                    </div>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Minimal Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-6 mt-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-20 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-1.5">
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-1.5 rounded-full transition-all ${currentPage === idx + 1 ? "w-4 bg-gray-800" : "w-1.5 bg-gray-200"}`}
                  />
                ))}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-20 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          )}
        </div>

        {/* RESET PANEL (Right - 7 Columns) */}
        <div className="lg:col-span-7 bg-white rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden h-[650px] flex flex-col relative">
          {!selectedUser ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/30">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                <ShieldAlert
                  size={32}
                  strokeWidth={1.5}
                  className="text-gray-300"
                />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Target Selection Required
              </h3>
              <p className="mt-2 text-sm text-gray-500 max-w-xs leading-relaxed font-medium">
                Locate a user in the directory to securely overwrite their
                active credentials.
              </p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col animate-slideIn">
              {/* Target Profile Header */}
              <div className="px-10 py-10 flex items-center gap-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <UserIcon size={28} className="text-gray-400" />
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md bg-gray-900 text-white">
                      {selectedUser.role}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 capitalize tracking-tight">
                    {selectedUser.fullName}
                  </h2>
                </div>
              </div>

              {/* Reset Form */}
              <form
                onSubmit={handleResetPassword}
                className="px-10 flex-1 flex flex-col justify-start"
              >
                <div className="bg-orange-50/50 p-5 rounded-2xl mb-10 flex gap-4 text-orange-800">
                  <Shield size={20} className="shrink-0 text-orange-500" />
                  <p className="text-xs font-semibold leading-relaxed">
                    This action is irreversible. The user's current password
                    will be immediately invalidated across all devices.
                  </p>
                </div>

                <div className="space-y-12">
                  <div>
                    <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest block mb-4">
                      Override Credential
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Type new password..."
                        className="w-full pb-4 bg-transparent border-b-2 border-gray-100 outline-none focus:border-gray-900 text-gray-900 font-bold text-xl transition-colors placeholder:text-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(newPassword)}
                        className={`absolute right-0 top-0 p-2 transition-all rounded-lg border shadow-sm ${
                          hasCopied
                            ? "bg-emerald-50 border-emerald-200 text-emerald-600 opacity-100"
                            : "bg-white border-gray-100 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-gray-900"
                        }`}
                      >
                        {hasCopied ? (
                          <Check size={16} strokeWidth={3} />
                        ) : (
                          <Copy size={16} />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting || newPassword.length < 4}
                    className="w-full bg-gray-900 hover:bg-black text-white font-bold py-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] transition-all flex justify-center items-center gap-3 disabled:opacity-30 disabled:shadow-none active:scale-[0.98] text-sm tracking-wide"
                  >
                    {isSubmitting ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      "AUTHORIZE OVERRIDE"
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #f3f4f6;
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: #e5e7eb;
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}
