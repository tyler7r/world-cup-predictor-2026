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

export type UserType = {
  id: string;
  display_name: string;
  email: string;
  predicted_total_goals: number | null;
  predicted_yellow_cards: number | null;
  predicted_red_cards: number | null;
  points_earned: number;
  entered_pool: boolean;
};

export type PredictorStatusType = {
  groupGames: number;
  standings: number;
  thirdPlace: number;
  knockouts: {
    stage:
      | "Round of 32"
      | "Round of 16"
      | "Quarter-finals"
      | "Semi-finals"
      | "3rd Place Final"
      | "Final"
      | "Winner"
      | "Runner-up";
    count: number;
  }[];
  tiebreakers: UserType;
};
