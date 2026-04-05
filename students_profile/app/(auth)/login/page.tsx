"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // 🔥 Dummy Users (simulate DB)
  const USERS = [
    {
      username: "teacher1",
      password: "1234",
      role: "teacher",
      name: "Usthad Rashid",
    },
    {
      username: "student1",
      password: "1234",
      role: "student",
      name: "Sahaleey",
    },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    setTimeout(() => {
      const user = USERS.find(
        (u) => u.username === username && u.password === password,
      );

      if (!user) {
        setError("Invalid credentials");
        setIsLoading(false);
        return;
      }

      // 🔥 Simulated JWT Payload
      const fakeJWT = {
        name: user.name,
        role: user.role,
      };

      // Save like real auth
      localStorage.setItem("auth", JSON.stringify(fakeJWT));

      // 🔥 Role-based routing
      if (user.role === "teacher") {
        router.push("/usthad");
      } else if (user.role === "student") {
        router.push("/student");
      }

      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
        {/* HEADER */}
        <div className="bg-[#004643] p-8 text-center">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            Campus Portal
          </h1>
          <p className="text-[#fafafa] opacity-80 mt-2 text-sm">
            Enter your credentials
          </p>
        </div>

        {/* FORM */}
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* ERROR */}
            {error && (
              <div className="text-sm text-red-600 bg-red-50 p-2 rounded-lg text-center">
                {error}
              </div>
            )}

            <div className="space-y-4">
              {/* USERNAME */}
              <div className="relative">
                <User
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username or Admission No."
                  className="w-full pl-10 pr-4 py-3 text-black bg-[#fafafa] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004643] outline-none"
                />
              </div>

              {/* PASSWORD */}
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3 top-3 text-gray-400"
                />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 text-black pr-4 py-3 bg-[#fafafa] border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#004643] outline-none"
                />
              </div>
            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#004643] hover:bg-[#003634] text-white font-bold py-3 rounded-xl flex justify-center items-center disabled:opacity-70"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                "Sign In"
              )}
            </button>

            {/* 🔥 DEMO CREDENTIALS */}
            <div className="text-xs text-gray-500 text-center mt-2">
              <p>
                <b>Teacher:</b> teacher1 / 1234
              </p>
              <p>
                <b>Student:</b> student1 / 1234
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
