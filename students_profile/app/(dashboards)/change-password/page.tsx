"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, KeyRound, Loader2 } from "lucide-react";

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setError("All fields are required.");
      return;
    }

    if (newPassword.length < 4 || newPassword.length > 8) {
      setError("New password must be between 4 and 8 characters.");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("New password and confirmation password do not match.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      setError("Session expired. Please log in again.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(
        "http://localhost:3001/auth/change-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            currentPassword,
            newPassword,
            confirmNewPassword,
          }),
        },
      );

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        const message =
          typeof data?.message === "string"
            ? data.message
            : Array.isArray(data?.message)
              ? data.message.join(", ")
              : "Failed to change password";
        throw new Error(message);
      }

      setSuccess(data?.message || "Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="backdrop-blur-xl bg-white/80 rounded-2xl shadow-xl border border-white/50 overflow-hidden">
        <div className="bg-gradient-to-r from-[#004643] to-[#00665e] p-6 text-white">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <KeyRound size={22} />
            Change Password
          </h1>
          <p className="text-white/80 text-sm mt-1">
            Update your account password securely.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 text-red-700 border border-red-200 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
              <AlertTriangle size={16} />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-4 py-3 text-sm flex items-center gap-2">
              <CheckCircle2 size={16} />
              <span>{success}</span>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full text-black mt-1.5 p-3 bg-white/80 border border-gray-200 rounded-xl outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={4}
              maxLength={8}
              className="w-full mt-1.5 p-3 text-black bg-white/80 border border-gray-200 rounded-xl outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all"
              placeholder="4 to 8 characters"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              required
              minLength={4}
              maxLength={8}
              className="w-full mt-1.5 p-3 text-black bg-white/80 border border-gray-200 rounded-xl outline-none focus:border-[#004643] focus:ring-2 focus:ring-[#004643]/20 transition-all"
              placeholder="Re-enter new password"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-[#004643] to-[#00665e] hover:from-[#003634] hover:to-[#004643] text-white font-semibold py-3 rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Updating Password...
              </>
            ) : (
              <>
                <KeyRound size={18} />
                Update Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
