import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import PredictorPage from "./PredictorContainer";
import { KnockoutData, Match, StandingPredictions, Team } from "./types";

export default async function GroupStageStepContainer() {
  const authObject = await auth();
  const { userId } = authObject;
  const sql = neon(process.env.DATABASE_URL!);

  // Explicitly cast the query to Match[]
  const matches = (await sql`
    SELECT 
      m.api_fixture_id, 
      m.home_team_id, 
      m.away_team_id, 
      m.stage,
      t.group_name,
      m.status,
      h.name as home_name, 
      a.name as away_name,
      p.home_goals_predicted, 
      p.away_goals_predicted,
      h.flag_url as home_flag,
      a.flag_url as away_flag,
      m.kickoff_time as kickoff_time,
      m.away_goals_actual,
      m.home_goals_actual,
      p.points_earned
    FROM matches m
    JOIN teams h ON m.home_team_id = h.id
    JOIN teams a ON m.away_team_id = a.id
    JOIN teams t ON m.home_team_id = t.id
    LEFT JOIN prediction_group_matches p 
      ON m.api_fixture_id = p.match_id AND p.user_id = ${userId}
    ORDER BY t.group_name, m.kickoff_time ASC
  `) as Match[];

  const data = (await sql`
    SELECT  
      t.group_name,
      w.id as w_id,
      w.name as w_name,
      w.flag_url as w_flag,
      r.id as r_id,
      r.name as r_name,
      r.flag_url as r_flag,
      t.id as t_id,
      t.name as t_name,
      t.flag_url as t_flag
    FROM prediction_group_standings s
    JOIN teams w ON s.winner_team_id = w.id
    JOIN teams r ON s.runner_up_team_id = r.id
    JOIN teams t ON s.third_place_team_id = t.id
    WHERE s.user_id = ${userId}
    ORDER BY t.group_name ASC
  `) as StandingPredictions[];

  const teams = (await sql`
    SELECT *
    FROM teams
    `) as Team[];

  const initialThirdPlaceChoices = await sql`
  SELECT team_id as team_id
  FROM prediction_third_place_advancement 
  WHERE user_id = ${userId}`;

  const initialThirds: number[] = initialThirdPlaceChoices.map(
    (r) => r.team_id,
  );

  const knockoutRows = await sql`
  SELECT team_id, stage FROM prediction_knockouts WHERE user_id = ${userId}
  `;

  const initialKnockouts: KnockoutData = {
    r16: knockoutRows
      .filter((r) => r.stage === "Round of 16")
      .map((r) => r.team_id),
    qf: knockoutRows
      .filter((r) => r.stage === "Quarter-finals")
      .map((r) => r.team_id),
    sf: knockoutRows
      .filter((r) => r.stage === "Semi-finals")
      .map((r) => r.team_id),
    final: knockoutRows
      .filter((r) => r.stage === "Final")
      .map((r) => r.team_id),
    champion: knockoutRows.find((r) => r.stage === "Winner")?.team_id || null,
    runnerUp:
      knockoutRows.find((r) => r.stage === "Runner-up")?.team_id || undefined,
    thirdPlaceMatch: knockoutRows
      .filter((r) => r.stage === "3rd Place Final")
      .map((r) => r.team_id),
  };

  return (
    <PredictorPage
      initialMatches={matches}
      initialStandings={data}
      allTeams={teams}
      userId={userId}
      initialKnockouts={initialKnockouts}
      initialThirdPlaces={initialThirds}
    />
  );
}
