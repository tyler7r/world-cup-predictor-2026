import { Match } from "@/app/predictor/types";
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import MatchClient from "./MatchClient";

interface PredictorProps {
  params: Promise<{ matchId: string }>;
}

export type MatchPredictions = {
  api_fixture_id: number;
  home_team_id: number;
  away_team_id: number;
  stage: string;
  status: string;
  home_name: string;
  away_name: string;
  home_rank: number;
  away_rank: number;
  home_goals_predicted: number;
  away_goals_predicted: number;
  home_flag: string;
  away_flag: string;
  home_code: string;
  away_code: string;
  kickoff_time: string;
  away_goals_actual: number;
  home_goals_actual: number;
  points_earned: number;
  venue: string;
  city: string;
  display_name: string;
  total_points: string;
};

export default async function MatchPredictionsPage({ params }: PredictorProps) {
  const authObject = await auth();
  const { userId } = authObject;
  const resolvedParams = await params;
  const matchId = resolvedParams.matchId;
  const sql = neon(process.env.DATABASE_URL!);

  // FIRE ALL QUERIES AT THE SAME TIME
  const [predictions] = await Promise.all([
    sql`
      SELECT
        m.api_fixture_id, 
      m.home_team_id, 
      m.away_team_id, 
      m.stage,
      m.status,
      h.name as home_name, 
      a.name as away_name,
      h.rank as home_rank,
      a.rank as away_rank,
      p.home_goals_predicted, 
      p.away_goals_predicted,
      h.flag_url as home_flag,
      a.flag_url as away_flag,
      h.name_code as home_code,
      a.name_code as away_code,
      m.kickoff_time as kickoff_time,
      m.away_goals_actual,
      m.home_goals_actual,
      p.points_earned,
      m.venue,
      m.city,
      l.display_name,
      l.total_points,
      l.user_id
      FROM matches m
      JOIN teams h ON m.home_team_id = h.id
      JOIN teams a ON m.away_team_id = a.id
      LEFT JOIN prediction_group_matches p 
        ON m.api_fixture_id = p.match_id AND m.api_fixture_id = ${matchId}
      JOIN leaderboard l ON p.user_id = l.user_id
      JOIN users u ON p.user_id = u.id
      WHERE m.api_fixture_id = ${matchId} AND u.predicted_total_goals is not null
      ORDER BY l.total_points DESC
    ` as unknown as Promise<Match[]>,
  ]);

  return <MatchClient predictions={predictions} userId={userId} />;
}
