import { SignInButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Box, Button, Container, Typography } from "@mui/material";
import { neon } from "@neondatabase/serverless";
import { Match } from "../predictor/types";
import DashboardClient from "./DashboardClient";
import {
  LeaderboardEntry,
  PointsBreakdownType,
  PointsEarnedType,
} from "./types";

export type LeagueDetails = {
  id: string;
  name: string;
  invite_code: string;
  member_count: number;
};

export default async function DashboardPage() {
  const authObject = await auth();
  const { userId } = authObject;
  const user = await currentUser();

  // --- LOGGED OUT STATE ---
  if (!userId || !user) {
    return (
      <Container maxWidth="sm" sx={{ mt: 10, textAlign: "center" }}>
        <Typography variant="h3" gutterBottom>
          2026 World Cup Predictor
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Sign in to create your bracket, join family leagues, and compete for
          the top spot.
        </Typography>
        <SignInButton mode="modal">
          <Button variant="contained" size="large" sx={{ mt: 2 }}>
            Log In or Sign Up
          </Button>
        </SignInButton>
      </Container>
    );
  }

  // --- LOGGED IN STATE ---
  const sql = neon(process.env.DATABASE_URL!);

  // 1. Lazy Sync: Ensure user exists in Neon
  await sql`
    INSERT INTO users (id, email, display_name)
    VALUES (${userId}, ${user.emailAddresses[0].emailAddress}, ${user.fullName || "Predictor"})
    ON CONFLICT (id) DO UPDATE SET 
      email = EXCLUDED.email, 
      display_name = EXCLUDED.display_name
  `;

  // 2. Fetch the user's leagues (including a count of total members)
  const userLeagues = (await sql`
    SELECT l.id as id, l.name as name, l.invite_code as invite_code,
           (SELECT COUNT(*)::int FROM league_members WHERE league_id = l.id) as member_count
    FROM leagues l
    JOIN league_members lm ON l.id = lm.league_id
    WHERE lm.user_id = ${userId}
    ORDER BY l.created_at DESC
  `) as LeagueDetails[];

  const d = new Date();

  const upcomingMatches = (await sql`
      SELECT 
        m.api_fixture_id, 
        m.home_team_id, 
        m.away_team_id, 
        m.stage,
        h.group_name,
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
        m.venue
      FROM matches m
      JOIN teams h ON m.home_team_id = h.id
      JOIN teams a ON m.away_team_id = a.id
      LEFT JOIN prediction_group_matches p 
        ON m.api_fixture_id = p.match_id AND p.user_id = ${userId}
      WHERE m.kickoff_time > ${d.toISOString()}
      ORDER BY m.kickoff_time ASC
      LIMIT 4
    `) as Match[];

  const leaderboard = (await sql`
        SELECT l.user_id, l.display_name, l.total_points, l.entered_pool, k.team_id, t.flag_url
        FROM leaderboard l
        JOIN prediction_knockouts k ON l.user_id = k.user_id
        JOIN teams t ON k.team_id = t.id
        WHERE k.stage = 'Winner'
        ORDER BY total_points DESC, display_name ASC
      `) as LeaderboardEntry[];

  const groupStagePoints = (await sql`
      SELECT SUM(points_earned) as points_earned FROM prediction_group_matches WHERE user_id = ${userId}
    `) as PointsEarnedType[];

  const standingsPoints =
    (await sql` SELECT SUM(points_earned) as points_earned FROM prediction_group_standings WHERE user_id = ${userId}
    `) as PointsEarnedType[];

  const thirdPlacePoints =
    (await sql`SELECT SUM(points_earned) as points_earned FROM prediction_third_place_advancement WHERE user_id = ${userId}
    `) as PointsEarnedType[];

  const knockoutPoints =
    (await sql` SELECT SUM(points_earned) as points_earned FROM prediction_knockouts WHERE user_id = ${userId}
    `) as PointsEarnedType[];

  const pointsBreakdown: PointsBreakdownType = {
    groupStage: groupStagePoints[0],
    standings: standingsPoints[0],
    thirdPlace: thirdPlacePoints[0],
    knockout: knockoutPoints[0],
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4" sx={{ fontWeight: "bold" }}>
          Welcome, {user.firstName}!
        </Typography>
      </Box>

      {/* Pass the fetched data to the interactive client component */}
      <DashboardClient
        leagues={userLeagues}
        upcomingMatches={upcomingMatches}
        leaderboard={leaderboard}
        pointsBreakdown={pointsBreakdown}
      />
    </Container>
  );
}
