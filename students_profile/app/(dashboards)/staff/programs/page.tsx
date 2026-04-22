"use client";

import { useState, useEffect } from "react";
import { ClipboardList, PlusCircle, Calendar, User } from "lucide-react";

export default function ManageProgramsPage() {
  const [programs, setPrograms] = useState<any[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getToken = () => localStorage.getItem("token");

  const fetchPrograms = async () => {
    const res = await fetch(
      "https://students-profile.onrender.com/staff/programs",
      {
        headers: { Authorization: `Bearer ${getToken()}` },
      },
    );
    if (res.ok) setPrograms(await res.json());
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch(
        "https://students-profile.onrender.com/staff/programs",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
          },
          body: JSON.stringify({ title, description }),
        },
      );
      if (res.ok) {
        setTitle("");
        setDescription("");
        fetchPrograms(); // Refresh the list
      } else {
        alert("Failed to create program.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get department for styling
  const dept =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}").department
      : "Staff";
  const isOutreach = dept === "Outreach";

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fadeInUp">
      <div
        className={`p-6 rounded-2xl flex items-center gap-4 border ${isOutreach ? "bg-blue-50 border-blue-200" : "bg-rose-50 border-rose-200"}`}
      >
        <div
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${isOutreach ? "bg-blue-600" : "bg-rose-500"}`}
        >
          <ClipboardList size={28} />
        </div>
        <div>
          <h1
            className={`text-3xl font-bold ${isOutreach ? "text-blue-900" : "text-rose-900"}`}
          >
            {dept} Programs
          </h1>
          <p className={isOutreach ? "text-blue-700" : "text-rose-700"}>
            Log official departmental events and records.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create Form */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <PlusCircle size={18} /> Log New Program
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">
                Program Title
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Blood Donation Drive"
                className={`w-full p-3 border rounded-xl outline-none focus:ring-2 ${isOutreach ? "focus:ring-blue-500" : "focus:ring-rose-500"} text-black`}
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 block mb-1">
                Description & Details
              </label>
              <textarea
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter details about the program..."
                className={`w-full p-3 border rounded-xl outline-none focus:ring-2 ${isOutreach ? "focus:ring-blue-500" : "focus:ring-rose-500"} text-black`}
                rows={4}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full text-white font-bold py-3 rounded-xl shadow-md transition-colors ${isOutreach ? "bg-blue-600 hover:bg-blue-700" : "bg-rose-600 hover:bg-rose-700"}`}
            >
              {isSubmitting ? "Saving..." : "Save Program Record"}
            </button>
          </form>
        </div>

        {/* History List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-5 bg-gray-50 border-b border-gray-200">
            <h2 className="font-bold text-gray-800">Program History</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {programs.length === 0 ? (
              <p className="p-8 text-center text-gray-500">
                No programs logged yet.
              </p>
            ) : (
              programs.map((prog) => (
                <div
                  key={prog.id}
                  className="p-5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900 capitalize">
                      {prog.title}
                    </h3>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-1 rounded-md ${isOutreach ? "bg-blue-100 text-blue-700" : "bg-rose-100 text-rose-700"}`}
                    >
                      {prog.department}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 leading-relaxed mb-3">
                    {prog.description}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-gray-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />{" "}
                      {new Date(prog.date).toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User size={14} /> Logged by:{" "}
                      {prog.createdBy?.fullName || "Staff"}
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
