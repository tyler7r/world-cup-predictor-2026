// types/predictor.ts
export interface Match {
  api_fixture_id: number;
  home_name: string;
  away_name: string;
  home_goals_predicted: number | null;
  away_goals_predicted: number | null;
  group_name: string; // e.g., "Group A"
  home_flag: string;
  away_flag: string;
  home_rank: number;
  away_rank: number;
  home_team_id: number;
  away_team_id: number;
  kickoff_time: string;
  home_goals_actual: number;
  away_goals_actual: number;
  points_earned: number | null;
  status: string;
  stage: string;
  venue: string;
  home_code: string;
  away_code: string;
}

export interface UserType {
  id: string;
  predicted_total_goals: number;
  predicted_yellow_cards: number;
  predicted_red_cards: number;
  points_earned: number;
  display_name: string;
  email: string;
  entered_pool: string;
}

export interface ActualKnockoutTeams {
  stage: string;
  status: string;
  home_team_id: number | null;
  away_team_id: number | null;
  winner_team_id: number | null;
  loser_team_id: number | null;
}

// types.ts
export type KnockoutStage =
  | "Round of 32"
  | "Round of 16"
  | "Quarter-finals"
  | "Semi-finals"
  | "Final"
  | "3rd Place Final";

export interface TiebreakerData {
  topScorerId: number;
  totalTournamentGoals: number;
}

export interface Team {
  id: number;
  name: string;
  name_code: string;
  flag_url: string;
  group_name: string;
  rank: number;
}

export interface Tiebreakers {
  predicted_total_goals: number;
  predicted_yellow_cards: number;
  predicted_red_cards: number;
}

export interface GroupStanding {
  teamId: number;
  teamName: string;
  flagUrl: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number; // Goals For
  ga: number; // Goals Against
  gd: number; // Goal Difference
  points: number;
}

export interface StandingPredictions {
  group_name: string;
  w_id: number;
  w_name: string;
  w_flag: string;
  w_name_code: string;
  w_rank: number;
  r_id: number;
  r_name: string;
  r_flag: string;
  r_name_code: string;
  r_rank: number;
  t_id: number;
  t_name: string;
  t_flag: string;
  t_name_code: string;
  t_rank: number;
  points_earned: number;
}

export interface ActualStandingsType {
  group_name: string;
  w_id: number;
  w_name: string;
  w_flag: string;
  w_name_code: string;
  r_id: number;
  r_name: string;
  r_flag: string;
  r_name_code: string;
  t_id: number;
  t_name: string;
  t_flag: string;
  t_name_code: string;
}

export type KnockoutData = {
  r32: Team[];
  r16: Team[];
  qf: Team[];
  sf: Team[];
  final: Team[];
  champion: Team | null;
  runnerUp: Team | undefined;
  thirdPlaceMatch: Team[];
};

export type ActualTiebreakers = {
  home_goals: number;
  away_goals: number;
  yellow_cards: number;
  red_cards: number;
};

export const calculateGroupStandings = (
  groupMatches: Match[],
): GroupStanding[] => {
  const standingsMap: Record<number, GroupStanding> = {};

  groupMatches.forEach((m) => {
    // Initialize teams in the map if they don't exist
    [
      { id: m.home_team_id, name: m.home_name, flag: m.home_flag },
      { id: m.away_team_id, name: m.away_name, flag: m.away_flag },
    ].forEach((t) => {
      if (!standingsMap[t.id]) {
        standingsMap[t.id] = {
          teamId: t.id,
          teamName: t.name,
          flagUrl: t.flag || "",
          played: 0,
          wins: 0,
          draws: 0,
          losses: 0,
          gf: 0,
          ga: 0,
          gd: 0,
          points: 0,
        };
      }
    });

    const hGoals = m.home_goals_predicted;
    const aGoals = m.away_goals_predicted;

    // Only calculate if both scores are entered
    if (hGoals !== null && aGoals !== null) {
      const home = standingsMap[m.home_team_id];
      const away = standingsMap[m.away_team_id];

      home.played++;
      away.played++;
      home.gf += hGoals;
      home.ga += aGoals;
      away.gf += aGoals;
      away.ga += hGoals;

      if (hGoals > aGoals) {
        home.wins++;
        home.points += 3;
        away.losses++;
      } else if (hGoals < aGoals) {
        away.wins++;
        away.points += 3;
        home.losses++;
      } else {
        home.draws++;
        away.draws++;
        home.points += 1;
        away.points += 1;
      }
      home.gd = home.gf - home.ga;
      away.gd = away.gf - away.ga;
    }
  });

  return Object.values(standingsMap).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.gd !== a.gd) return b.gd - a.gd;
    return b.gf - a.gf;
  });
};
