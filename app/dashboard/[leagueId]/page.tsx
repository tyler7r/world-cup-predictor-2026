// app/dashboard/[leagueId]/page.tsx
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import { LeaderboardEntry } from "../types";
import LeagueClient from "./LeagueClient";

// Define the types for our specific SQL returns
export type LeagueInfo = {
  name: string;
  invite_code: string;
};

export default async function LeaguePage(props: {
  params: Promise<{ leagueId: string }>;
}) {
  const params = await props.params;
  const leagueId = params.leagueId;
  const authObject = await auth();
  const { userId } = authObject;
  if (!userId) redirect("/"); // Kick to home if not logged in

  const sql = neon(process.env.DATABASE_URL!);

  // 1. Verify League and Membership in one query
  const membershipCheck = (await sql`
    SELECT l.name, l.invite_code 
    FROM leagues l
    JOIN league_members lm ON l.id = lm.league_id
    WHERE l.id = ${leagueId} AND lm.user_id = ${userId}
  `) as LeagueInfo[];

  // If the array is empty, the user isn't in this league (or it doesn't exist)
  if (membershipCheck.length === 0) {
    redirect("/dashboard");
  }

  const leagueInfo = membershipCheck[0];

  const leagueMembers = (await sql`
    SELECT COUNT(user_id) as members
    FROM league_members lm
    WHERE league_id = ${leagueId}
  `) as { members: number }[];

  // 2. Fetch the Leaderboard
  const leaderboard = (await sql`
  SELECT 
    lb.user_id, 
    lb.display_name, 
    lb.total_points, 
    lb.entered_pool,
    t.id,
    t.flag_url
  FROM leaderboard lb
  JOIN league_members lm ON lb.user_id = lm.user_id
  JOIN prediction_knockouts k ON lb.user_id = k.user_id
  JOIN teams t ON k.team_id = t.id
  WHERE lm.league_id = ${leagueId} AND k.stage = 'Winner'
  ORDER BY lb.total_points DESC, lb.display_name ASC
`) as LeaderboardEntry[];

  // JOIN league_members lm ON u.id = lm.user_id
  // WHERE lm.league_id = ${leagueId}

  return (
    <LeagueClient
      leagueId={leagueId}
      leagueInfo={leagueInfo}
      leaderboard={leaderboard}
      memberCount={leagueMembers[0]}
    />
  );
}
