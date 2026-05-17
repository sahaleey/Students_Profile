"use client";

import { useState, useEffect } from "react";
import {
  ShieldCheck,
  Monitor,
  Smartphone,
  LogOut,
  Loader2,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";

// Define the shape of our data based on the NestJS entity
interface Session {
  id: string;
  deviceInfo: string;
  ipAddress: string;
  lastLoginAt: string;
}

export default function SecurityPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState(false);

  // 🚀 NEW: State to hold the exact session ID of the device you are holding
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Helper to get the API URL (falls back to localhost if env is missing)
  const API_URL = "http://localhost:3001";

  // 1. Fetch the data from NestJS
  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication token missing.");
        window.location.href = "/login";
        return;
      }

      // 🚀 THE FIX: Crack open the JWT token and read your actual sessionId
      try {
        const payloadBase64 = token.split(".")[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        setCurrentSessionId(decodedPayload.sessionId);
      } catch (e) {
        console.error("Could not decode token", e);
      }

      const res = await fetch(`${API_URL}/auth/sessions`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch sessions");

      const data = await res.json();
      setSessions(data); // Put the real database records into state
    } catch (error) {
      console.error(error);
      toast.error("Failed to load active sessions.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch immediately when the component mounts
  useEffect(() => {
    fetchSessions();
  }, []);

  // 2. The Kill Switch
  const handleRevokeOthers = async () => {
    if (
      !window.confirm(
        "Are you sure you want to log out of all other devices? They will be disconnected immediately.",
      )
    ) {
      return;
    }

    setIsRevoking(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/auth/sessions/revoke-others`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Failed to revoke sessions");

      toast.success("All other devices have been securely logged out.");

      // Re-fetch the sessions to ensure the UI perfectly matches the database!
      await fetchSessions();
    } catch (error) {
      console.error(error);
      toast.error("Failed to revoke sessions. Please try again.");
    } finally {
      setIsRevoking(false);
    }
  };

  // Helper to pick an icon based on device string
  const getDeviceIcon = (deviceInfo: string) => {
    const device = deviceInfo?.toLowerCase() || "";
    return device.includes("iphone") ||
      device.includes("android") ||
      device.includes("mobile") ? (
      <Smartphone className="w-6 h-6 text-gray-500" />
    ) : (
      <Monitor className="w-6 h-6 text-gray-500" />
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
            Security & Active Sessions
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the devices that are currently logged into your admin
            account.
          </p>
        </div>

        <button
          onClick={handleRevokeOthers}
          disabled={isRevoking || sessions.length <= 1 || isLoading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isRevoking ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogOut className="w-4 h-4" />
          )}
          Log out all other devices
        </button>
      </div>

      {/* Sessions List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border rounded-xl bg-gray-50">
          No active sessions found.
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => {
            // 🚀 THE FIX: Match the exact ID from the token instead of guessing index 0
            const isCurrentDevice = session.id === currentSessionId;

            return (
              <div
                key={session.id}
                className={`p-5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isCurrentDevice
                    ? "border-emerald-200 bg-emerald-50/30"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-full ${
                      isCurrentDevice ? "bg-emerald-100" : "bg-gray-100"
                    }`}
                  >
                    {getDeviceIcon(session.deviceInfo)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      {session.deviceInfo || "Unknown Device"}
                      {isCurrentDevice && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                          Current Device
                        </span>
                      )}
                    </h3>
                    <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-3">
                      <span>IP: {session.ipAddress}</span>
                      <span>•</span>
                      <span>
                        {new Date(session.lastLoginAt).toLocaleString(
                          undefined,
                          {
                            dateStyle: "medium",
                            timeStyle: "short",
                          },
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {!isCurrentDevice && (
                  <div className="text-sm text-gray-400 flex items-center gap-1">
                    <Info className="w-4 h-4" /> Active
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
