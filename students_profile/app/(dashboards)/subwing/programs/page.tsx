"use client";

import { useState, useEffect } from "react";
import {
  Megaphone,
  CalendarPlus,
  FileText,
  AlignLeft,
  Info,
  Clock,
  CheckCircle2,
} from "lucide-react";

export default function SubWingProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    eligibility: "",
    conditions: "",
  });

  const getToken = () => localStorage.getItem("token");

  const fetchPrograms = async () => {
    try {
      const res = await fetch("http://localhost:3001/subwing/programs", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setPrograms(await res.json());
    } catch (error) {
      console.error("Failed to fetch programs");
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("http://localhost:3001/subwing/programs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Failed to create program");

      setSuccessMsg("Program launched successfully!");
      setFormData({
        title: "",
        description: "",
        duration: "",
        eligibility: "",
        conditions: "",
      });
      await fetchPrograms();
    } catch (error) {
      alert("Error creating program");
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setSuccessMsg(""), 3000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Megaphone size={28} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Program Management
          </h1>
          <p className="text-gray-500 mt-1 font-medium">
            Create and manage your wing's events.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-600 p-4 rounded-xl flex items-center gap-3 border border-emerald-200">
          <CheckCircle2 size={20} /> {successMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT: CREATE FORM */}
        <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-fit">
          <div className="bg-indigo-600 p-5 text-white">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <CalendarPlus size={18} /> Launch New Program
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-gray-50">
            <div>
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <FileText size={14} /> Program Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g., Essay Writing Contest"
                className="w-full mt-1.5 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <AlignLeft size={14} /> Description
              </label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Details about the topic and rules..."
                className="w-full mt-1.5 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-black resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Clock size={14} /> Duration/Date
                </label>
                <input
                  type="text"
                  required
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                  placeholder="e.g., 2 Hours"
                  className="w-full mt-1.5 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Info size={14} /> Eligibility
                </label>
                <input
                  type="text"
                  required
                  value={formData.eligibility}
                  onChange={(e) =>
                    setFormData({ ...formData, eligibility: e.target.value })
                  }
                  placeholder="e.g., SS1 & SS2 only"
                  className="w-full mt-1.5 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-bold text-gray-700">
                Conditions (Optional)
              </label>
              <input
                type="text"
                value={formData.conditions}
                onChange={(e) =>
                  setFormData({ ...formData, conditions: e.target.value })
                }
                placeholder="Any prerequisites..."
                className="w-full mt-1.5 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-black"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-md hover:bg-indigo-700 transition-all flex justify-center items-center gap-2 disabled:opacity-70 mt-2"
            >
              {isSubmitting ? "Launching..." : "Publish Program"}
            </button>
          </form>
        </div>

        {/* RIGHT: ACTIVE PROGRAMS LIST */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[700px]">
          <div className="bg-gray-50 p-5 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-bold text-lg text-gray-800">My Programs</h2>
            <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full">
              {programs.length} Total
            </span>
          </div>

          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {programs.length === 0 ? (
              <p className="text-center text-gray-400 mt-10">
                No programs launched yet.
              </p>
            ) : (
              programs.map((prog) => (
                <div
                  key={prog.id}
                  className="p-5 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-xl text-gray-900 capitalize">
                      {prog.title}
                    </h3>
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded ${
                        prog.status === "Ongoing"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {prog.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    {prog.description}
                  </p>

                  <div className="flex flex-wrap gap-3">
                    <span className="text-xs font-semibold bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 flex items-center gap-1">
                      <Clock size={12} /> {prog.duration}
                    </span>
                    <span className="text-xs font-semibold bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-gray-600 flex items-center gap-1">
                      <Info size={12} /> For: {prog.eligibility}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
