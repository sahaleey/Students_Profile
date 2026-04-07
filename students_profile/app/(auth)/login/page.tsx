"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock, LogIn } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(""); // Add an error state!

    try {
      const response = await fetch("http://localhost:3001/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }), // Assuming you have state for these
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();

      // 1. Save token to localStorage or Cookies (Cookies are safer for Next.js SSR)
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));

      // 2. Route based on the backend role!
      if (data.user.role === "student") router.push("/student");
      else if (data.user.role === "usthad") router.push("/usthad");
      else if (data.user.role === "hisan" || data.user.role === "subwing")
        router.push("/hisan");
    } catch (err) {
      setError("Invalid username or password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-[#003634] via-[#00665e] to-[#009689] flex items-center justify-center p-4">
      {/* Glassmorphism Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="backdrop-blur-xl bg-white/30 rounded-3xl shadow-2xl overflow-hidden border border-white/20">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-[#004643]/90 to-[#004643]/70 backdrop-blur-sm p-8 text-center border-b border-white/20">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
              <User size={32} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Campus Portal
            </h1>
            <p className="text-white/80 mt-2 text-sm font-light">
              Welcome back! Please sign in
            </p>
          </div>

          {/* Form Section */}
          <div className="p-8 backdrop-blur-sm">
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50/90 backdrop-blur-sm p-3 rounded-xl text-center border border-red-200 animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                {/* Username Field */}
                <div className="relative group">
                  <User
                    size={18}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black group-focus-within:text-[#004643] transition-colors duration-200"
                  />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username or Admission No."
                    className="w-full pl-11 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-[#004643] focus:border-transparent outline-none transition-all duration-200 text-[#004643] placeholder:text-gray-400"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#004643]/0 via-[#004643]/0 to-[#004643]/0 group-focus-within:via-[#004643]/5 pointer-events-none transition-all duration-300"></div>
                </div>

                {/* Password Field */}
                <div className="relative group">
                  <Lock
                    size={18}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-black group-focus-within:text-[#004643] transition-colors duration-200"
                  />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full pl-11 pr-4 py-3.5 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:ring-2 focus:ring-[#004643] focus:border-transparent outline-none transition-all duration-200 text-[#004643] placeholder:text-gray-400"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#004643]/0 via-[#004643]/0 to-[#004643]/0 group-focus-within:via-[#004643]/5 pointer-events-none transition-all duration-300"></div>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full bg-gradient-to-r from-[#004643] to-[#00665e] hover:from-[#003634] hover:to-[#004643] text-white font-semibold py-3.5 rounded-xl flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl overflow-hidden group"
              >
                <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300"></span>
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <LogIn size={18} />
                    <span>Sign In</span>
                  </>
                )}
              </button>

              {/* Demo Credentials */}

              <div className="mt-6 pt-4 border-t border-white/20">
                <p className="text-xs text-[#004643]/70 text-center font-medium mb-2">
                  Demo Credentials (from Database)
                </p>
                <div className="flex justify-center gap-6 text-xs">
                  <div className="text-center">
                    <p className="font-semibold text-[#004643]">Usthad</p>
                    <p className="text-[#004643]/60">
                      usthad_ahmad
                      <br />
                      password123
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-[#004643]">Student</p>
                    <p className="text-[#004643]/60">
                      1042
                      <br />
                      password123
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-white/60 text-xs mt-6 font-light">
          Secure campus portal • All data is encrypted
        </p>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          10%,
          30%,
          50%,
          70%,
          90% {
            transform: translateX(-2px);
          }
          20%,
          40%,
          60%,
          80% {
            transform: translateX(2px);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
}
