export type LeaderboardEntry = {
  user_id: string; // The user's ID, useful for linking to their specific bracket later
  display_name: string;
  total_points: number;
  entered_pool: boolean;
  team_id: number;
  flag_url: string;
};

export type PointsEarnedType = {
  points_earned: number;
};

export type PointsBreakdownType = {
  groupStage: PointsEarnedType;
  standings: PointsEarnedType;
  knockout: PointsEarnedType;
  tiebreakers: PointsEarnedType;
};

export type KnockoutStageName =
  | "Round of 32"
  | "Round of 16"
  | "Quarter-finals"
  | "Semi-finals"
  | "Final"
  | "3rd Place Final"
  | "Champion"
  | "Runner-up";

export interface StagePointsRow {
  // Coerced to number in application code, but typed defensively
  // in case your DB driver returns numeric sums as strings.
  points_earned: number;
  stage: KnockoutStageName;
}

// The complete array type returned by the query
export type KnockoutPointsSummary = StagePointsRow[];
