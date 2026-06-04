"use client";

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import GroupsIcon from "@mui/icons-material/Groups";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { theme } from "./styles/theme";

export default function LandingPage() {
  const theme = useTheme();
  const chainGold = "#FFD700";

  return (
    <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: "background.default",
          color: "text.primary",
          py: { xs: 4, md: 8 },
          borderBottom: 1,
          borderColor: "divider",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="md" sx={{ position: "relative", zIndex: 1 }}>
          <Stack
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              gap: 2,
            }}
          >
            {/* Top Tagline */}
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                bgcolor: alpha(chainGold, 0.08),
                color: chainGold,
                px: 2,
                py: 0.75,
                borderRadius: 8,
                border: `1px solid ${alpha(chainGold, 0.2)}`,
              }}
            >
              <ElectricBoltIcon sx={{ fontSize: 16, mr: 0.5 }} />
              <Typography
                variant="caption"
                sx={{ fontWeight: 700, letterSpacing: 1.2 }}
              >
                PROUDLY SUPPORTING ATL CHAIN LIGHTNING ULTIMATE
              </Typography>
              <ElectricBoltIcon sx={{ fontSize: 16, ml: 0.5 }} />
            </Box>

            {/* Main Title */}
            <Typography
              variant="h1"
              sx={{
                fontWeight: 800,
                letterSpacing: "-0.02em",
                fontSize: { xs: "3rem", md: "4.5rem" },
                lineHeight: 1,
                mt: 1,
              }}
            >
              2026 World Cup Predictor
            </Typography>

            {/* 50/50 Fundraiser Integration */}
            <Box sx={{ mb: 2 }}>
              <Typography
                variant="h6"
                sx={{
                  color: "text.secondary",
                  fontWeight: 400,
                  mb: 3,
                  lineHeight: 1.4,
                }}
              >
                This predictor platform doubles as a voluntary 50/50 global
                fundraiser. Compete with friends and climb the leaderboard while
                supporting elite club ultimate frisbee.
              </Typography>

              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  bgcolor: alpha(theme.palette.background.paper, 0.6),
                  border: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                  textAlign: "left",
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: "text.primary",
                    mb: 2,
                    lineHeight: 1.5,
                    textAlign: "center",
                  }}
                >
                  Half of all entry fees directly fund{" "}
                  <strong>Atlanta Chain Lightning&apos;s</strong> upcoming
                  season, helping cover tournament travel and bid fees. The
                  remaining 50% constitutes the cash prize pool for the most
                  accurate bracket predictions.
                </Typography>
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ fontWeight: 600, textAlign: "center" }}
                >
                  Help us grow the pot! Share this site with your teammates,
                  friends, and the local frisbee community.
                </Typography>
              </Paper>
            </Box>

            {/* Authentication Actions */}
            <Stack
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row" },
                gap: 2,
                justifyContent: "center",
                width: "100%",
                maxWidth: 400,
              }}
            >
              <SignUpButton mode="modal">
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    flex: 1,
                    py: 1,
                    fontWeight: 700,
                    borderRadius: 2,
                    // color: "black",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.primary.main, 0.8),
                    },
                  }}
                >
                  Join the Pool
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    flex: 1,
                    py: 1,
                    borderRadius: 2,
                    fontWeight: 600,
                    borderColor: "divider",
                    color: "text.primary",
                    "&:hover": {
                      bgcolor: alpha(theme.palette.text.primary, 0.05),
                    },
                  }}
                >
                  Sign In
                </Button>
              </SignInButton>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Grid container spacing={4}>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<SportsSoccerIcon color="primary" sx={{ fontSize: 36 }} />}
              title="Match Predictions"
              description="Predict exact scores, total goals, and knockout teams across the entire tournament."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<LeaderboardIcon color="primary" sx={{ fontSize: 36 }} />}
              title="Live Leaderboards"
              description="Points update dynamically as group stages conclude. See exactly where your predictions stand against the global pool."
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <FeatureCard
              icon={<GroupsIcon color="primary" sx={{ fontSize: 36 }} />}
              title="Private Pools"
              description="Set up your own mini-pools with unique invite codes to compete directly with your friends."
            />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRadius: 4,
        bgcolor: "background.paper",
        border: "1px solid",
        borderColor: "divider",
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: `0 12px 24px ${alpha("#000", 0.2)}`,
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 60,
          height: 60,
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.08), // Subtle gold background for icon
          mb: 3,
        }}
      >
        {icon}
      </Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
        {title}
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ lineHeight: 1.6 }}
      >
        {description}
      </Typography>
    </Paper>
  );
}
