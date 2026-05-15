export type AchievementTier = {
  id: string;
  label: string;
  description: string;
  points: string | number;
};

export const ACHIEVEMENT_CRITERIA: AchievementTier[] = [
  {
    id: "tier_1_minor",
    label: "Tier 1: Minor Activity",
    description: "Daily participation, Q&A, good behavior",
    points: 5,
  },
  {
    id: "tier_2_medium",
    label: "Tier 2: Subwing/Class Level",
    description: "Subwing program winners, weekly assignments",
    points: 10,
  },
  {
    id: "tier_3_major",
    label: "Tier 3: Campus Level",
    description: "Inaugural week winner, major event organizing",
    points: 20,
  },
  {
    id: "tier_4_exceptional",
    label: "Tier 4: Exceptional",
    description: "Inter-college winner, Hisan Star Student",
    points: "Special Recognition",
  },
];
