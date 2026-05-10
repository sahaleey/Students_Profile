"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  GraduationCap,
  ShieldCheck,
  BellRing,
  Rocket,
  ArrowRight,
} from "lucide-react";

export default function LaunchPage() {
  const [mounted, setMounted] = useState(false);

  // 🚀 NEW: State to track if the countdown has naturally finished
  const [isTimeUp, setIsTimeUp] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Hidden Bypass States
  const [clicks, setClicks] = useState(0);
  const [showLaunchButton, setShowLaunchButton] = useState(false);

  // Set your exact launch date here! (Monday, May 11, 2026, 8:00 PM)
  const TARGET_DATE = new Date("2026-05-11T20:00:00").getTime();

  useEffect(() => {
    setMounted(true);

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = TARGET_DATE - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        // 🚀 THE FIX: If time is up, trigger the reveal!
        setIsTimeUp(true);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [TARGET_DATE]);

  // The Hidden Bypass Logic (Still works even before time is up!)
  const handleSecretClick = () => {
    const newClicks = clicks + 1;
    setClicks(newClicks);
    if (newClicks >= 5) {
      setShowLaunchButton(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 relative overflow-hidden flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* BACKGROUND GLOW EFFECTS */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[#004643] rounded-full blur-[120px] opacity-40 pointer-events-none animate-pulse-slow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-emerald-800 rounded-full blur-[120px] opacity-20 pointer-events-none" />

      {/* NAVBAR */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full animate-fadeInUp">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-[#004643] to-emerald-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(0,70,67,0.5)]">
            <GraduationCap size={24} className="text-white" />
          </div>
          {/* SECRET CLICK AREA */}
          <span
            onClick={handleSecretClick}
            className="font-black text-xl text-white tracking-tight cursor-default select-none"
          >
            Nahjurrashad
          </span>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto w-full">
        {/* Pre-launch Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#004643]/30 border border-[#004643]/50 text-emerald-300 font-bold text-xs uppercase tracking-wider mb-8 shadow-sm backdrop-blur-md animate-slideIn">
          <Sparkles size={14} />
          {isTimeUp ? "The Wait is Over" : "The Wait is Almost Over"}
        </div>

        <h1
          className="text-5xl md:text-7xl font-black text-white leading-[1.1] tracking-tight mb-6 animate-fadeInUp"
          style={{ animationDelay: "0.1s" }}
        >
          The Digital Campus <br className="hidden md:block" />
          <span className="bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
            {isTimeUp ? "Is Now Live." : "Goes Live Soon."}
          </span>
        </h1>

        <p
          className="text-lg md:text-xl text-gray-400 font-medium max-w-2xl mb-12 leading-relaxed animate-fadeInUp"
          style={{ animationDelay: "0.2s" }}
        >
          {isTimeUp
            ? "Nahjurrashad Islamic College has upgraded. The centralized portal for Students, Parents, and Usthads is officially open."
            : "Nahjurrashad Islamic College is upgrading. A centralized portal for Students, Parents, and Usthads is launching this Monday night. Get your Admission Numbers ready."}
        </p>

        {/* 🚀 LOGIC FIX: Show Button if Time is Up OR Developer Bypass is Active */}
        {!(isTimeUp || showLaunchButton) ? (
          mounted ? (
            <div
              className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full max-w-3xl animate-fadeInUp"
              style={{ animationDelay: "0.3s" }}
            >
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
                <span className="text-5xl md:text-6xl font-black text-white font-mono tracking-tighter">
                  {String(timeLeft.days).padStart(2, "0")}
                </span>
                <span className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">
                  Days
                </span>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
                <span className="text-5xl md:text-6xl font-black text-white font-mono tracking-tighter">
                  {String(timeLeft.hours).padStart(2, "0")}
                </span>
                <span className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">
                  Hours
                </span>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 flex flex-col items-center justify-center shadow-2xl relative overflow-hidden group">
                <span className="text-5xl md:text-6xl font-black text-white font-mono tracking-tighter">
                  {String(timeLeft.minutes).padStart(2, "0")}
                </span>
                <span className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mt-2">
                  Minutes
                </span>
              </div>
              <div className="bg-white/5 backdrop-blur-xl border border-emerald-500/30 rounded-3xl p-6 flex flex-col items-center justify-center shadow-[0_0_30px_rgba(0,255,150,0.1)] relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-transparent opacity-100 animate-pulse" />
                <span className="text-5xl md:text-6xl font-black text-emerald-400 font-mono tracking-tighter">
                  {String(timeLeft.seconds).padStart(2, "0")}
                </span>
                <span className="text-xs md:text-sm font-bold text-emerald-600 uppercase tracking-widest mt-2">
                  Seconds
                </span>
              </div>
            </div>
          ) : (
            <div className="h-[140px] md:h-[160px] w-full max-w-3xl flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
          )
        ) : (
          /* THE LAUNCH BUTTON REVEALED */
          <div className="animate-slideIn">
            <Link
              href="/login"
              className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-emerald-500 to-[#004643] text-white font-black text-xl rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Rocket size={24} className={!isTimeUp ? "animate-pulse" : ""} />
              {isTimeUp ? "Enter Portal" : "Force Launch Portal"}{" "}
              <ArrowRight size={20} />
            </Link>
            {!isTimeUp && showLaunchButton && (
              <p className="text-emerald-500 mt-4 text-sm font-bold animate-pulse">
                Developer Override Activated
              </p>
            )}
          </div>
        )}

        <div
          className="mt-12 flex items-center justify-center gap-2 text-gray-500 text-sm font-medium animate-fadeInUp"
          style={{ animationDelay: "0.4s" }}
        >
          <BellRing size={16} /> Notification systems will activate on launch.
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-white/5 bg-gray-950 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-gray-600">
            © {new Date().getFullYear()} Nahjurrashad Islamic College.
          </p>
          <div className="flex items-center gap-2 text-sm font-bold text-gray-500 bg-white/5 px-4 py-2 rounded-full backdrop-blur-md">
            Secured Infrastructure{" "}
            <ShieldCheck size={16} className="text-emerald-500" />
          </div>
        </div>
      </footer>

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
            transform: translateY(-20px);
            scale: 0.9;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            scale: 1;
          }
        }
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
        }
        .animate-slideIn {
          animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
