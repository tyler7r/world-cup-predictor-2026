import { SignInButton } from "@clerk/nextjs";
import { auth, currentUser } from "@clerk/nextjs/server";
import { Box, Button, Container, Typography } from "@mui/material";
import { neon } from "@neondatabase/serverless";
import DashboardClient from "./DashboardClient";

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

  return (
    <Container maxWidth="lg" sx={{ mt: 6 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
        }}
      >
        <Typography variant="h4">Welcome, {user.firstName}!</Typography>
      </Box>

      {/* Pass the fetched data to the interactive client component */}
      <DashboardClient leagues={userLeagues} />
    </Container>
  );
}
