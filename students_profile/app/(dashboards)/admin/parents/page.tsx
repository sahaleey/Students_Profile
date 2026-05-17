"use client";

import { useState, useEffect } from "react";
import {
  Users,
  Search,
  Phone,
  UserPlus,
  GraduationCap,
  Shield,
} from "lucide-react";
import LinkParentTool from "./LinkParentTool"; // Assuming you saved the component we built earlier in the same folder!

export default function AdminParentsPage() {
  const [parents, setParents] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  const getToken = () => localStorage.getItem("token");

  const fetchParents = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("http://localhost:3001/admin/parents", {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) setParents(await res.json());
    } catch (error) {
      console.error("Failed to fetch parents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchParents();
  }, []);

  // Filter parents based on search (by parent name, phone, or child name)
  const filteredParents = parents.filter(
    (parent) =>
      parent.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      parent.username.includes(searchTerm) ||
      parent.children?.some((child: any) =>
        child.fullName.toLowerCase().includes(searchTerm.toLowerCase()),
      ),
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-fadeInUp">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Users size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Parent Directory
            </h1>
            <p className="text-gray-500 mt-1 font-medium">
              Manage parent accounts and their linked students.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl shadow-md hover:bg-emerald-700 transition-all flex items-center gap-2"
        >
          <UserPlus size={18} />{" "}
          {showAddForm ? "Close Form" : "Add & Link Parent"}
        </button>
      </div>

      {/* The Link Parent Tool (Toggled) */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100 animate-slideIn">
          {/* Note: I'm assuming you saved the LinkParentTool component in a separate file. 
              If you pasted it directly in here, just render the JSX instead! */}
          <LinkParentTool
            onSuccess={() => {
              fetchParents(); // Refresh list after adding!
              setShowAddForm(false);
            }}
          />
        </div>
      )}

      {/* Parent Directory List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Search Bar */}
        <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <Search
              className="absolute left-4 top-3.5 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search by parent name, phone, or child's name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all text-black font-medium"
            />
          </div>
          <div className="text-sm font-bold text-gray-500 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
            Total Parents: {parents.length}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white border-b border-gray-100 text-gray-500">
              <tr>
                <th className="p-4 pl-6 font-bold uppercase tracking-wider text-[10px]">
                  Parent Name
                </th>
                <th className="p-4 font-bold uppercase tracking-wider text-[10px]">
                  Contact (Login ID)
                </th>
                <th className="p-4 font-bold uppercase tracking-wider text-[10px]">
                  Linked Children
                </th>
                <th className="p-4 pr-6 font-bold uppercase tracking-wider text-[10px] text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-emerald-600 font-bold animate-pulse"
                  >
                    Loading directory...
                  </td>
                </tr>
              ) : filteredParents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-gray-400">
                    No parent accounts found.
                  </td>
                </tr>
              ) : (
                filteredParents.map((parent) => (
                  <tr
                    key={parent.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Parent Name */}
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                          {parent.fullName.charAt(0)}
                        </div>
                        <span className="font-bold text-gray-900 text-base capitalize">
                          {parent.fullName}
                        </span>
                      </div>
                    </td>

                    {/* Contact Info */}
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-600 font-medium">
                        <Phone size={14} className="text-gray-400" />
                        {parent.username}
                      </div>
                    </td>

                    {/* Linked Children */}
                    <td className="p-4">
                      {!parent.children || parent.children.length === 0 ? (
                        <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                          No Children Linked
                        </span>
                      ) : (
                        <div className="space-y-2">
                          {parent.children.map((child: any) => (
                            <div
                              key={child.id}
                              className="flex items-center gap-2 bg-white border border-gray-200 px-3 py-1.5 rounded-lg w-fit shadow-sm"
                            >
                              <GraduationCap
                                size={14}
                                className="text-emerald-600"
                              />
                              <div>
                                <p className="font-bold text-gray-800 text-xs capitalize">
                                  {child.fullName}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  Class {child.class} • Admn: {child.username}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="p-4 pr-6 text-right">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          parent.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : "bg-red-50 text-red-700 border border-red-100"
                        }`}
                      >
                        {parent.isActive ? "Active" : "Disabled"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
