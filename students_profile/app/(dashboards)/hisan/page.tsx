import { CalendarPlus, Megaphone, Trophy } from "lucide-react";

export default function HisanDashboard() {
  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#004643]">
            HISAN Control Center
          </h1>
          <p className="text-gray-500 mt-1">
            Manage events, track participation, and declare winners.
          </p>
        </div>
        <button className="bg-[#004643] hover:bg-[#003634] text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-md transition-all">
          <CalendarPlus size={20} /> Create Program
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Events Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Megaphone className="text-blue-500" />
            <h2 className="text-xl font-bold text-gray-800">Active Programs</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 border border-blue-100 bg-blue-50/50 rounded-xl">
              <div className="flex justify-between">
                <h3 className="font-bold text-gray-800">
                  Urdu Essay Competition
                </h3>
                <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-1 rounded">
                  Sub-Wing
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                45 Participants Registered
              </p>
              <button className="mt-3 text-sm font-bold text-blue-600 hover:text-blue-800">
                Manage Event →
              </button>
            </div>
          </div>
        </div>

        {/* Declare Winners Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6 border-b pb-4">
            <Trophy className="text-yellow-500" />
            <h2 className="text-xl font-bold text-gray-800">
              Awaiting Results
            </h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 border border-gray-100 rounded-xl flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-800">Friday Quiz</h3>
                <p className="text-sm text-gray-500">Event ended 2 days ago</p>
              </div>
              <button className="px-4 py-2 bg-yellow-100 text-yellow-800 font-bold text-sm rounded-lg hover:bg-yellow-200 transition-colors">
                Publish Winners
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
