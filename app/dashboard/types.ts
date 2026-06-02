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
  thirdPlace: PointsEarnedType;
  knockout: PointsEarnedType;
};
