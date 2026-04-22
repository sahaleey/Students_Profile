"use client";

import { useState } from "react";
import {
  UserPlus,
  Shield,
  AlertTriangle,
  CheckCircle2,
  GraduationCap,
  Key,
  Sparkles,
  Briefcase, // 🚀 Imported new icon for departments
} from "lucide-react";

export default function AdminCentre() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    fullName: "",
    role: "student",
    class: "1",
    department: "Library", // 🚀 Added default department state
    username: "",
    password: "campus123",
  });

  const getToken = () => localStorage.getItem("token");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMsg("");

    // 🚀 Dynamic Payload Construction
    let payload: any = {
      fullName: formData.fullName,
      role: formData.role,
      username: formData.username,
      password: formData.password,
    };

    if (formData.role === "student") {
      payload.class = formData.class;
    } else if (formData.role === "staff") {
      payload.department = formData.department; // 🚀 Include department if Staff!
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
        console.log("SERVER ERROR:", data);
        throw new Error(data.message || "Failed to create user");
      }

      setSuccessMsg(`User ${formData.fullName} created successfully!`);
      setFormData({
        fullName: "",
        role: "student",
        class: "1",
        department: "Library",
        username: "",
        password: "campus123",
      });
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

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header with Glass Effect */}
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
              Register new members to the campus portal
            </p>
          </div>
        </div>
      </div>

      {/* Error/Success Messages with Glass Effect */}
      {error && (
        <div className="backdrop-blur-xl bg-red-500/10 border border-red-500/30 text-red-700 p-4 rounded-xl flex items-center gap-3 animate-slideIn">
          <AlertTriangle size={20} />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 p-4 rounded-xl flex items-center gap-3 animate-slideIn">
          <CheckCircle2 size={20} />
          <span className="font-medium">{successMsg}</span>
        </div>
      )}

      {/* Main Form Card - Glassmorphism */}
      <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <div className="bg-gradient-to-r from-[#004643] to-[#00665e] p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -ml-12 -mb-12" />
          <h2 className="font-bold text-xl flex items-center gap-2 relative z-10">
            <UserPlus size={20} /> Create New Account
          </h2>
          <p className="text-white/80 text-sm mt-1 relative z-10">
            Fill in the details to register a new user
          </p>
        </div>

        <form
          onSubmit={handleCreateUser}
          className="p-6 space-y-5 bg-gradient-to-b from-white/50 to-white/30"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Full Name */}
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
                className="w-full mt-1.5 p-3 bg-white/80 backdrop-blur-sm text-black border border-gray-200 rounded-xl outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Role Selection */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Shield size={14} /> Role
              </label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full mt-1.5 p-3 bg-white/80 text-black backdrop-blur-sm border border-gray-200 rounded-xl outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all cursor-pointer"
              >
                <option value="student">Student</option>
                <option value="usthad">Usthad (Teacher)</option>
                <option value="hisan">HISAN / Union</option>
                <option value="admin">System Admin</option>
                <option value="subwing">Hisan Subwing</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* DYNAMIC CLASS FIELD - Only shows for students */}
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
                  className="w-full mt-1.5 p-3 bg-white/80 backdrop-blur-sm border text-black border-gray-200 rounded-xl outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all cursor-pointer"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num.toString()}>
                      Class {num}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 🚀 DYNAMIC DEPARTMENT FIELD - Only shows for Staff */}
            {formData.role === "staff" && (
              <div className="animate-slideIn">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Briefcase size={14} /> Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  className="w-full mt-1.5 p-3 bg-white/80 backdrop-blur-sm border text-black border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 transition-all cursor-pointer"
                >
                  <option value="Library">Library</option>
                  <option value="Outreach">Outreach</option>
                  <option value="Welfare">Welfare</option>
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Username */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Key size={14} /> Username / Admission No.
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
                    ? "e.g., library1"
                    : "e.g., 1080 or teacher1"
                }
                className="w-full mt-1.5 p-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl outline-none text-black focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all placeholder:text-gray-400"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Key size={14} />
                Password
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full mt-1.5 p-3 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all text-gray-600"
              />
              <p className="text-xs text-gray-400 mt-1">Default: campus123</p>
            </div>
          </div>

          {/* Role Preview Card */}
          <div className="mt-4 p-4 bg-gradient-to-r from-gray-50/50 to-white/30 rounded-xl border border-gray-200/50">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${roleColors[formData.role as keyof typeof roleColors]} flex items-center justify-center shadow-md`}
              >
                <Shield size={16} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  Account type to be created
                </p>
                <p className="font-semibold text-gray-800 capitalize">
                  {formData.role}
                </p>
              </div>

              {/* Conditional Preview details */}
              {formData.role === "student" && formData.class && (
                <div className="ml-auto text-right">
                  <p className="text-xs text-gray-500">Class</p>
                  <p className="font-semibold text-gray-800">
                    Class {formData.class}
                  </p>
                </div>
              )}
              {formData.role === "staff" && formData.department && (
                <div className="ml-auto text-right">
                  <p className="text-xs text-gray-500">Department</p>
                  <p className="font-semibold text-teal-800">
                    {formData.department}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#004643] to-[#00665e] hover:from-[#003634] hover:to-[#004643] text-white font-bold py-3.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98] mt-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Creating Account...
              </>
            ) : (
              <>
                <UserPlus size={18} />
                Create Account
              </>
            )}
          </button>
        </form>
      </div>

      {/* Quick Tips Card */}
      <div className="backdrop-blur-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl p-4 border border-white/50">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white/50 rounded-lg">
            <Sparkles size={16} className="text-[#004643]" />
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700">Admin Tips</p>
            <p className="text-xs text-gray-600 mt-0.5">
              • Student usernames should be their admission numbers
              <br />• Staff usernames should be simple (e.g., library1,
              outreach_admin)
            </p>
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
