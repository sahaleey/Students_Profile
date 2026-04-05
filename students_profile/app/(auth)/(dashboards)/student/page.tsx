
'use client';

import { AlertOctagon, ShieldCheck, Trophy, BookOpen, User, Star } from 'lucide-react';
import { useState } from 'react';

// Assume these come from your components folder
// import ProgressTracker from '@/components/student/ProgressTracker';
// import CategoryCard from '@/components/student/CategoryCard';

export default function StudentDashboard() {
  // Simulated Backend State
  const [student] = useState({
    name: "Sahaleey",
    points: 450,
    hasActivePunishment: true,
    categories: [
      { id: 1, title: 'Academics', status: 'GREEN', icon: <BookOpen /> },
      { id: 2, title: 'Mosque', status: 'YELLOW', icon: <User /> },
      { id: 3, title: 'Public Behavior', status: 'RED', icon: <AlertOctagon /> },
    ]
  });

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      
      {/* 1. Header & Status Banner */}
      <section>
        <h1 className="text-3xl font-bold text-[#004643] mb-4">My Portal</h1>
        {student.hasActivePunishment ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded-r-2xl flex items-start gap-4 shadow-sm">
            <AlertOctagon className="text-red-500 mt-1" size={24} />
            <div>
              <h3 className="text-red-800 font-bold text-lg">Action Required: Active Punishment</h3>
              <p className="text-red-600 mt-1">Your points are frozen. Complete your assigned tasks to restore your good standing and unlock rewards.</p>
            </div>
          </div>
        ) : (
          <div className="bg-emerald-50 border-l-4 border-[#004643] p-5 rounded-r-2xl flex items-center gap-4 shadow-sm">
            <ShieldCheck className="text-[#004643]" size={24} />
            <h3 className="text-emerald-800 font-bold text-lg">Status Normal: Good Standing</h3>
          </div>
        )}
      </section>

      {/* 2. Points & Gamification */}
      <section className={`transition-all duration-500 ${student.hasActivePunishment ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-gray-500 font-bold uppercase tracking-wider text-sm">Monthly Points</h2>
            <div className="text-5xl font-black text-[#004643] mt-2 flex items-baseline gap-2">
              {student.points} <span className="text-xl text-gray-400 font-medium">/ 1000</span>
            </div>
          </div>
          <Trophy size={64} className="text-yellow-400 opacity-20" />
        </div>
      </section>

      {/* 3. Behavior Categories Grid */}
      <section>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Behavior Status</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {student.categories.map((cat) => (
             <div key={cat.id} className={`p-5 rounded-2xl border-2 flex flex-col gap-4 
              ${cat.status === 'GREEN' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 
                cat.status === 'YELLOW' ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 
                'bg-red-50 border-red-200 text-red-700'}`}>
              <div className="flex justify-between items-start">
                <div className="p-3 bg-white/60 rounded-xl backdrop-blur-sm">{cat.icon}</div>
              </div>
              <div>
                <h3 className="font-bold text-lg">{cat.title}</h3>
                <p className="text-xs uppercase tracking-wider font-bold mt-1 opacity-80">{cat.status}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}