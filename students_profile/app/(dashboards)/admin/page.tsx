"use client";

import { useState } from "react";
import {
  Users,
  UserPlus,
  ShieldBan,
  CheckCircle2,
  Search,
  Shield,
  GraduationCap,
  BookOpen,
} from "lucide-react";

export default function AdminDashboard() {
  // Dummy State for the Form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Dummy Directory Data
  const [users, setUsers] = useState([
    {
      id: 1,
      name: "Sahaleey",
      username: "1042",
      role: "student",
      isActive: true,
    },
    {
      id: 2,
      name: "Usthad Ahmad",
      username: "usthad_ahmad",
      role: "usthad",
      isActive: true,
    },
    {
      id: 3,
      name: "Faris",
      username: "1045",
      role: "student",
      isActive: false,
    }, // Access Revoked
  ]);

  const toggleAccess = (id: number) => {
    setUsers(
      users.map((user) =>
        user.id === id ? { ...user, isActive: !user.isActive } : user,
      ),
    );
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username.includes(searchTerm),
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg">
          <Shield size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Admin Control Center
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Manage user accounts and system access.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: ADD USER FORM */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden sticky top-6">
            <div className="bg-gray-900 p-5 text-white">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <UserPlus size={18} /> Register New User
              </h2>
            </div>

            <form className="p-6 space-y-5 bg-[#fafafa]">
              <div>
                <label className="text-sm font-bold text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Muhammed Bilal"
                  className="w-full mt-1.5 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700">Role</label>
                <select className="w-full mt-1.5 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 transition-all">
                  <option value="student">Student</option>
                  <option value="usthad">Usthad</option>
                  <option value="hisan">HISAN / Union</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700">
                  Username / Admn No.
                </label>
                <input
                  type="text"
                  placeholder="e.g., 1080"
                  className="w-full mt-1.5 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700">
                  Temporary Password
                </label>
                <input
                  type="text"
                  defaultValue="campus123"
                  className="w-full mt-1.5 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 transition-all text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-2">
                  They will be asked to change this on first login.
                </p>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => {
                  setIsSubmitting(true);
                  setTimeout(() => setIsSubmitting(false), 1000);
                }}
                className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-black transition-all flex justify-center items-center gap-2"
              >
                {isSubmitting ? "Creating..." : "Create Account"}
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: USER DIRECTORY */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[700px]">
            {/* Directory Header & Search */}
            <div className="p-5 border-b border-gray-200 bg-gray-50 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users size={18} /> Campus Directory
                </h2>
                <div className="flex gap-2">
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                    310 Active
                  </span>
                  <span className="text-xs font-bold bg-red-100 text-red-800 px-3 py-1 rounded-full">
                    5 Revoked
                  </span>
                </div>
              </div>

              <div className="relative">
                <Search
                  className="absolute left-3 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by name or username..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:border-gray-900 transition-colors text-sm"
                />
              </div>
            </div>

            {/* User List */}
            <div className="flex-1 overflow-y-auto p-2">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`flex items-center justify-between p-4 mb-2 rounded-xl border transition-all ${user.isActive ? "bg-white border-gray-100 hover:border-gray-300" : "bg-red-50/50 border-red-100 grayscale opacity-80"}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`p-3 rounded-xl ${user.role === "student" ? "bg-blue-50 text-blue-600" : "bg-[#004643]/10 text-[#004643]"}`}
                    >
                      {user.role === "student" ? (
                        <GraduationCap size={20} />
                      ) : (
                        <BookOpen size={20} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        {user.name}
                        {!user.isActive && (
                          <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            Access Revoked
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {user.role} • ID: {user.username}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleAccess(user.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors ${
                      user.isActive
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    }`}
                  >
                    {user.isActive ? (
                      <>
                        <ShieldBan size={16} /> Revoke Access
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={16} /> Restore Access
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
