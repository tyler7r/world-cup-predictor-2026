// app/dashboard/[leagueId]/page.tsx
import { auth } from "@clerk/nextjs/server";
import { neon } from "@neondatabase/serverless";
import { redirect } from "next/navigation";
import LeagueClient from "./LeagueClient";

// Define the types for our specific SQL returns
export type LeagueInfo = {
  name: string;
  invite_code: string;
};

export type LeaderboardEntry = {
  id: string; // The user's ID, useful for linking to their specific bracket later
  display_name: string;
  total_score: number;
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

  // 2. Fetch the Leaderboard
  const leaderboard = (await sql`
    SELECT u.id, u.display_name, u.points_earned
    FROM users u
    JOIN league_members lm ON u.id = lm.user_id
    WHERE lm.league_id = ${leagueId}
    ORDER BY u.points_earned DESC, u.display_name ASC
  `) as LeaderboardEntry[];

  return (
    <LeagueClient
      leagueId={leagueId}
      leagueInfo={leagueInfo}
      leaderboard={leaderboard}
    />
  );
}
