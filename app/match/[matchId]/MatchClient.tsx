"use client";

import { Match } from "@/app/predictor/types";
import { ArrowBackRounded } from "@mui/icons-material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Divider,
  Fab,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import Link from "next/link";

interface MatchClientProps {
  predictions: Match[];
  userId: string | null;
}

export default function MatchClient({ predictions, userId }: MatchClientProps) {
  const theme = useTheme();
  if (!predictions || predictions.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="text.secondary">
          Match data not found.
        </Typography>
      </Box>
    );
  }

  // Extract the base match data from the first row
  const matchData = predictions[0];
  const isFinished = matchData.status === "Match Finished";
  const isInProgress = matchData.status === "In Progress";
  const hasStarted = isFinished || isInProgress;

  // Separate the current user from everyone else
  const currentUserPrediction = predictions.find((p) => p.user_id === userId);
  const otherPredictions = predictions.filter((p) => p.user_id !== userId);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const time = date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    const d = date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
    });
    return `${d} - ${time}`;
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box sx={{ maxWidth: "1000px", mx: "auto", px: { xs: 2, sm: 2 }, py: 2 }}>
      {/* 1. ACTUAL MATCH HEADER */}
      <Box sx={{ mb: 2 }}>
        <Button
          component={Link}
          href="/dashboard"
          startIcon={<ArrowBackRounded />}
          sx={{
            fontWeight: 700,
            borderRadius: 2,
            color: "text.secondary",
            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.05) },
          }}
        >
          Back to Dashboard
        </Button>
      </Box>
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          borderRadius: 3,
          bgcolor: "background.paper",
          border: 1,
          borderColor: "divider",
          textAlign: "center",
        }}
      >
        <Paper
          sx={{
            bgcolor: theme.palette.primary.main,
            width: "100%",
            borderBottomLeftRadius: 2,
            borderBottomRightRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 0.25,
            pt: 0.5,
            mb: 1,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              letterSpacing: 0.5,
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {`${formatTime(matchData.kickoff_time)} / ${matchData.status}`}
          </Typography>
        </Paper>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: { xs: 2, sm: 6 },
            mt: 0.5,
            px: 2,
            pt: 2,
            pb: 1,
          }}
        >
          {/* Home Team */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Avatar
              src={matchData.home_flag}
              variant="rounded"
              sx={{
                width: { xs: 48, sm: 80 },
                height: { xs: 32, sm: 56 },
                mb: 1,
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              {matchData.home_name}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Rank: {matchData.home_rank}
            </Typography>
          </Box>

          {/* Score or Time */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            {hasStarted ? (
              <Typography
                variant="h3"
                sx={{ fontWeight: 900, whiteSpace: "nowrap" }}
              >
                {matchData.home_goals_actual ?? 0} -{" "}
                {matchData.away_goals_actual ?? 0}
              </Typography>
            ) : (
              <Box
                sx={{
                  textAlign: "center",
                  px: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  VS
                </Typography>
              </Box>
            )}
          </Box>

          {/* Away Team */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              flex: 1,
            }}
          >
            <Avatar
              src={matchData.away_flag}
              variant="rounded"
              sx={{
                width: { xs: 48, sm: 80 },
                height: { xs: 32, sm: 56 },
                mb: 1,
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.1 }}>
              {matchData.away_name}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              Rank: {matchData.away_rank}
            </Typography>
          </Box>
        </Box>
        <Typography
          variant="overline"
          sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: 1 }}
        >
          {matchData.venue} •{" "}
          {matchData.city.includes("San Fran")
            ? "San Francisco"
            : matchData.city.includes("New York")
              ? "New York"
              : matchData.city}
        </Typography>
      </Paper>

      {/* 2. CURRENT USER'S PREDICTION */}
      {currentUserPrediction && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, px: 1 }}>
            Your Prediction
          </Typography>
          <Card
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: 2,
              borderColor: "primary.main",
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.03),
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
                <Avatar
                  src={matchData.home_flag}
                  variant="rounded"
                  sx={{ width: 40, height: 28 }}
                />
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 900, color: "primary.main" }}
                >
                  {currentUserPrediction.home_goals_predicted ?? "-"}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{ fontWeight: 600, color: "text.secondary" }}
                >
                  vs
                </Typography>
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 900, color: "primary.main" }}
                >
                  {currentUserPrediction.away_goals_predicted ?? "-"}
                </Typography>
                <Avatar
                  src={matchData.away_flag}
                  variant="rounded"
                  sx={{ width: 40, height: 28 }}
                />
              </Box>

              {isFinished && (
                <Chip
                  label={`+${currentUserPrediction.points_earned ?? 0} Pts`}
                  color={
                    (currentUserPrediction.points_earned ?? 0) > 1
                      ? "success"
                      : (currentUserPrediction.points_earned ?? 0) < 1
                        ? "error"
                        : "default"
                  }
                  sx={{ fontWeight: 800, px: 0 }}
                />
              )}
            </Box>
          </Card>
        </Box>
      )}

      <Divider sx={{ my: 4 }} />

      {/* 3. EVERYONE ELSE'S PREDICTIONS */}
      <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, px: 1 }}>
        Global Selections
      </Typography>
      <Grid container spacing={2}>
        {otherPredictions.map((pred) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={pred.user_id}>
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
                "&:hover": {
                  borderColor: "text.disabled",
                  bgcolor: "action.hover",
                },
              }}
            >
              {/* Card Header: User Info */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 2,
                  alignItems: "flex-start",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{ fontWeight: 700, lineHeight: 1.2 }}
                >
                  {pred.display_name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "text.secondary", fontWeight: 600 }}
                >
                  {pred.total_points} total pts
                </Typography>
              </Box>

              {/* Card Body: The Predicted Score */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    src={matchData.home_flag}
                    variant="rounded"
                    sx={{ width: 28, height: 20 }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {pred.home_goals_predicted ?? "-"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ fontWeight: 600, color: "text.secondary", mx: 0.5 }}
                  >
                    vs
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {pred.away_goals_predicted ?? "-"}
                  </Typography>
                  <Avatar
                    src={matchData.away_flag}
                    variant="rounded"
                    sx={{ width: 28, height: 20 }}
                  />
                </Box>

                {isFinished && (
                  <Chip
                    size="small"
                    label={`+${pred.points_earned ?? 0}`}
                    color={
                      (pred.points_earned ?? 0) > 1
                        ? "success"
                        : (pred.points_earned ?? 0) < 1
                          ? "error"
                          : "default"
                    }
                    sx={{ fontWeight: 800, height: 24 }}
                  />
                )}
              </Box>
            </Paper>
          </Grid>
        ))}

        {otherPredictions.length === 0 && (
          <Grid size={{ xs: 12 }}>
            <Paper
              variant="outlined"
              sx={{
                p: 4,
                textAlign: "center",
                borderRadius: 3,
                borderStyle: "dashed",
              }}
            >
              <Typography variant="body1" color="text.secondary">
                No other predictions have been made for this match yet.
              </Typography>
            </Paper>
          </Grid>
        )}
      </Grid>
      <Fab
        color="primary"
        onClick={scrollToTop}
        size="small"
        sx={{
          position: "fixed",
          bottom: "12px",
          right: "12px",
          zIndex: 1000,
        }}
        aria-label="Scroll to top"
      >
        <ArrowUpwardIcon />
      </Fab>
    </Box>
  );
}
