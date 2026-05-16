"use client";

import { useState } from "react";
import { ACHIEVEMENT_CRITERIA, AchievementTier } from "@/lib/points-criteria";

export default function AchievementSelect({
  onSelect,
}: {
  onSelect: (points: number, reason: string) => void;
}) {
  const [selected, setSelected] = useState<AchievementTier | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const found = ACHIEVEMENT_CRITERIA.find((c) => c.id === e.target.value);
    if (found) {
      setSelected(found);
      // Pass the locked points and reason back up to your form state
      onSelect(
        typeof found.points === "number"
          ? found.points
          : parseInt(found.points as string),
        found.label,
      );
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700">
        Select Achievement Criteria
      </label>

      <select
        onChange={handleChange}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
        defaultValue=""
      >
        <option value="" disabled>
          -- Choose a category --
        </option>
        {ACHIEVEMENT_CRITERIA.map((criteria) => (
          <option key={criteria.id} value={criteria.id}>
            {criteria.label} ({criteria.points} pts)
          </option>
        ))}
      </select>

      {/* Helper text so the Usthad or Staff knows exactly what this tier means */}
      {selected && (
        <p className="text-xs text-gray-500 mt-1 animate-in fade-in slide-in-from-top-1">
          <span className="font-medium text-blue-600">Guideline:</span>{" "}
          {selected.description}
        </p>
      )}
    </div>
  );
}
