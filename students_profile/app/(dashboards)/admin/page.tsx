"use client";

import { useState } from "react";
import { UserPlus, Shield, AlertTriangle } from "lucide-react";

export default function AdminCentre() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form State - Added studentClass
  const [formData, setFormData] = useState({
    fullName: "",
    role: "student",
    studentClass: "Senior Secondary 1st Year", // Default class
    username: "",
    password: "campus123",
  });

  const getToken = () => localStorage.getItem("token");

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMsg("");

    // If they aren't a student, we shouldn't send a class to the database
    const payload =
      formData.role === "student"
        ? { ...formData }
        : (({ studentClass, ...rest }) => rest)(formData);

    try {
      const response = await fetch("http://localhost:3001/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log("SERVER ERROR:", data); // ← THIS is what you've been missing
        throw new Error(data.message || "Failed to create user");
      }

      setSuccessMsg(`User ${formData.fullName} created successfully!`);
      setFormData({
        fullName: "",
        role: "student",
        studentClass: "Senior Secondary 1st Year",
        username: "",
        password: "campus123",
      });
    } catch (err) {
      setError("Failed to create user. Username might already exist.");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccessMsg(""), 3000); // Hide success message after 3s
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center shadow-lg">
          <Shield size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Centre</h1>
          <p className="text-gray-500 mt-1 font-medium">
            Register new members to the campus portal.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-200">
          <AlertTriangle size={20} /> {error}
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-center gap-3 border border-emerald-200">
          <UserPlus size={20} /> {successMsg}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-900 p-5 text-white">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <UserPlus size={18} /> Account Details
          </h2>
        </div>

        <form
          onSubmit={handleCreateUser}
          className="p-6 space-y-5 bg-[#fafafa]"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-bold text-gray-700">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
                placeholder="e.g., Muhammed Bilal"
                className="w-full mt-1.5 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">Role</label>
              <select
                value={formData.role}
                onChange={(e) =>
                  setFormData({ ...formData, role: e.target.value })
                }
                className="w-full mt-1.5 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="student">Student</option>
                <option value="usthad">Usthad</option>
                <option value="hisan">HISAN / Union</option>
                <option value="admin">System Admin</option>
              </select>
            </div>
          </div>

          {/* DYNAMIC CLASS FIELD: Only shows if the user is a student */}
          {formData.role === "student" && (
            <div className="animate-fadeIn">
              <label className="text-sm font-bold text-gray-700">
                Class / Batch
              </label>
              <select
                value={formData.studentClass}
                onChange={(e) =>
                  setFormData({ ...formData, studentClass: e.target.value })
                }
                className="w-full mt-1.5 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900"
              >
                <option value="Senior Secondary 1st Year">
                  Senior Secondary 1st Year
                </option>
                <option value="Senior Secondary 2nd Year">
                  Senior Secondary 2nd Year
                </option>
                <option value="Degree 1st Year">Degree 1st Year</option>
                <option value="Degree 2nd Year">Degree 2nd Year</option>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-bold text-gray-700">
                Username / Admn No.
              </label>
              <input
                type="text"
                required
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                placeholder="e.g., 1080"
                className="w-full mt-1.5 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                Temporary Password
              </label>
              <input
                type="text"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full mt-1.5 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-gray-900 text-gray-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gray-900 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-black transition-all flex justify-center items-center gap-2 disabled:opacity-70 mt-4"
          >
            {isSubmitting ? "Creating..." : "Create Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
