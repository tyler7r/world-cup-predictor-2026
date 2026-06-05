import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { KnockoutPointsSummary, KnockoutStageName } from "../dashboard/types";
import PredictorPage from "./components/PredictorContainer";
import LockedPredictorPage from "./locked-version/LockedContainer";
import {
  ActualKnockoutTeams,
  ActualStandingsType,
  ActualTiebreakers,
  KnockoutData,
  Match,
  StandingPredictions,
  Team,
  Tiebreakers,
} from "./types";

export default async function GroupStageStepContainer() {
  const authObject = await auth();
  const { userId } = authObject;
  const sql = neon(process.env.DATABASE_URL!);

  const [
    matches,
    actualKnockoutTeams,
    eliminatedTeamsQuery,
    standingPredictions,
    actualStandings,
    teams,
    initialThirdPlaceChoices,
    knockoutRows,
    [tiebreakers],
    pointsEarned,
    actualTiebreakers,
  ] = await Promise.all([
    // Explicitly cast the query to Match[]
    sql`
    SELECT 
      m.api_fixture_id, 
      m.home_team_id, 
      m.away_team_id, 
      m.stage,
      t.group_name,
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
    JOIN teams t ON m.home_team_id = t.id
    LEFT JOIN prediction_group_matches p 
      ON m.api_fixture_id = p.match_id AND p.user_id = ${userId}
    ORDER BY t.group_name, m.kickoff_time ASC
  ` as unknown as Promise<Match[]>,

    sql`
    SELECT 
  stage, 
  status, 
  home_team_id, 
  away_team_id, 
  winner_team_id, 
  loser_team_id 
FROM matches 
WHERE stage NOT IN ('Group Stage - 1', 'Group Stage - 2', 'Group Stage - 3');
  ` as unknown as Promise<ActualKnockoutTeams[]>,

    sql`
  -- A. Teams that lost a knockout match BEFORE the semi-finals 
  SELECT loser_team_id as team_id 
  FROM matches 
  WHERE stage IN ('Round of 32', 'Round of 16', 'Quarter-finals') 
  AND status = 'Match Finished' 
  AND loser_team_id IS NOT NULL

  UNION

  -- B. Teams eliminated in the group stage
  SELECT t.id as team_id
  FROM teams t
  WHERE 
    -- GATEKEEPER: Only proceed if 0 matches in this team's group are unfinished
    (
      SELECT COUNT(*) 
      FROM matches m
      JOIN teams t2 ON (m.home_team_id = t2.id OR m.away_team_id = t2.id)
      WHERE t2.group_name = t.group_name
      AND m.status != 'Match Finished'
    ) = 0
    
    -- ELIMINATION CHECK: The group is done, but they aren't in the R32 bracket
    AND t.id NOT IN (
      SELECT home_team_id FROM matches WHERE stage = 'Round of 32' AND home_team_id IS NOT NULL
      UNION
      SELECT away_team_id FROM matches WHERE stage = 'Round of 32' AND away_team_id IS NOT NULL
    )
` as unknown as Promise<{ team_id: number }[]>,

    sql`
    SELECT  
      t.group_name,
      w.id as w_id,
      w.name as w_name,
      w.flag_url as w_flag,
      w.name_code as w_name_code,
      w.rank as w_rank,
      r.id as r_id,
      r.name as r_name,
      r.flag_url as r_flag,
      r.name_code as r_name_code,
      r.rank as r_rank,
      t.id as t_id,
      t.name as t_name,
      t.flag_url as t_flag,
      t.name_code as t_name_code,
      t.rank as t_rank,
      s.points_earned
    FROM prediction_group_standings s
    JOIN teams w ON s.winner_team_id = w.id
    JOIN teams r ON s.runner_up_team_id = r.id
    JOIN teams t ON s.third_place_team_id = t.id
    WHERE s.user_id = ${userId}
    ORDER BY t.group_name ASC
  ` as unknown as Promise<StandingPredictions[]>,

    sql`
    SELECT  
      s.group_name,
      w.id as w_id,
      w.name as w_name,
      w.flag_url as w_flag,
      w.name_code as w_name_code,
      r.id as r_id,
      r.name as r_name,
      r.flag_url as r_flag,
      r.name_code as r_name_code,
      t.id as t_id,
      t.name as t_name,
      t.flag_url as t_flag,
      t.name_code as t_name_code
    FROM standings s
    JOIN teams w ON s.winner_team_id = w.id
    JOIN teams r ON s.runner_up_team_id = r.id
    JOIN teams t ON s.third_place_team_id = t.id
    ORDER BY s.group_name ASC
  ` as unknown as Promise<ActualStandingsType[]>,

    sql`
    SELECT *
    FROM teams
    ` as unknown as Promise<Team[]>,

    sql`
  SELECT team_id as team_id
  FROM prediction_third_place_advancement 
  WHERE user_id = ${userId}`,

    sql`
  SELECT k.team_id, k.stage, t.rank, t.name, t.flag_url, t.name_code, t.group_name FROM prediction_knockouts k JOIN teams t ON k.team_id = t.id WHERE user_id = ${userId}
  `,

    sql`
  SELECT predicted_total_goals, predicted_yellow_cards, predicted_red_cards FROM users WHERE id = ${userId} LIMIT 1` as unknown as Promise<
      Tiebreakers[]
    >,
    sql`
      SELECT SUM(points_earned) as points_earned, stage 
      FROM prediction_knockouts 
      WHERE user_id = ${userId} 
      GROUP BY user_id, stage
    ` as unknown as KnockoutPointsSummary,

    sql`
  SELECT SUM(home_goals_actual) as home_goals, SUM(away_goals_actual) as away_goals, SUM(yellow_cards) as yellow_cards, SUM(red_cards) as red_cards FROM matches WHERE status = 'Match Finished'` as unknown as Promise<
      ActualTiebreakers[]
    >,
  ]);

  const initialThirds: number[] = initialThirdPlaceChoices.map(
    (r) => r.team_id,
  );

  const initialKnockouts: KnockoutData = {
    r32: knockoutRows
      .filter((r) => r.stage === "Round of 32")
      .map((r) => ({
        id: r.team_id,
        rank: r.rank,
        name: r.name,
        flag_url: r.flag_url,
        name_code: r.name_code,
        group_name: r.group_name,
      })),
    r16: knockoutRows
      .filter((r) => r.stage === "Round of 16")
      .map((r) => ({
        id: r.team_id,
        rank: r.rank,
        name: r.name,
        flag_url: r.flag_url,
        name_code: r.name_code,
        group_name: r.group_name,
      })),
    qf: knockoutRows
      .filter((r) => r.stage === "Quarter-finals")
      .map((r) => ({
        id: r.team_id,
        rank: r.rank,
        name: r.name,
        flag_url: r.flag_url,
        name_code: r.name_code,
        group_name: r.group_name,
      })),
    sf: knockoutRows
      .filter((r) => r.stage === "Semi-finals")
      .map((r) => ({
        id: r.team_id,
        rank: r.rank,
        name: r.name,
        flag_url: r.flag_url,
        name_code: r.name_code,
        group_name: r.group_name,
      })),
    final: knockoutRows
      .filter((r) => r.stage === "Final")
      .map((r) => ({
        id: r.team_id,
        rank: r.rank,
        name: r.name,
        flag_url: r.flag_url,
        name_code: r.name_code,
        group_name: r.group_name,
      })),
    champion:
      knockoutRows
        .filter((r) => r.stage === "Winner")
        ?.map((r) => ({
          id: r.team_id,
          rank: r.rank,
          name: r.name,
          flag_url: r.flag_url,
          name_code: r.name_code,
          group_name: r.group_name,
        }))[0] || null,
    runnerUp:
      knockoutRows
        .filter((r) => r.stage === "Runner-up")
        ?.map((r) => ({
          id: r.team_id,
          rank: r.rank,
          name: r.name,
          flag_url: r.flag_url,
          name_code: r.name_code,
          group_name: r.group_name,
        }))[0] || undefined,
    thirdPlaceMatch: knockoutRows
      .filter((r) => r.stage === "3rd Place Final")
      .map((r) => ({
        id: r.team_id,
        rank: r.rank,
        name: r.name,
        flag_url: r.flag_url,
        name_code: r.name_code,
        group_name: r.group_name,
      })),
  };

  const actualEliminatedTeamIds = eliminatedTeamsQuery.map(
    (row) => row.team_id,
  ) as number[];

  const pointsByStage: Record<KnockoutStageName, number> = pointsEarned.reduce(
    (acc, row) => {
      acc[row.stage] = Number(row.points_earned) || 0; // Ensures strings become numbers safely
      return acc;
    },
    {} as Record<KnockoutStageName, number>,
  );

  const isLocked = new Date() > new Date(matches[0]?.kickoff_time);

  return isLocked ? (
    <LockedPredictorPage
      initialKnockouts={initialKnockouts}
      initialMatches={matches}
      initialStandings={standingPredictions}
      allTeams={teams}
      initialThirdPlaces={initialThirds}
      initialTiebreakers={tiebreakers}
      actualStandings={actualStandings}
      actualKnockoutTeams={actualKnockoutTeams}
      actualEliminatedTeamIds={actualEliminatedTeamIds}
      pointsEarned={pointsByStage}
      actualTiebreakers={actualTiebreakers[0]}
    />
  ) : (
    <PredictorPage
      initialMatches={matches}
      initialStandings={standingPredictions}
      allTeams={teams}
      userId={userId}
      initialKnockouts={initialKnockouts}
      initialThirdPlaces={initialThirds}
      actualStandings={actualStandings}
      initialTiebreakers={tiebreakers}
      isLocked={isLocked}
    />
  );
}
