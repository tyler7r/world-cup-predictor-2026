"use client";

import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { PointsBreakdownType } from "./types";

type PointsBreakdownProps = {
  breakdown: PointsBreakdownType;
  lastUpdated: { matches: string };
  maxAvailableGroupPoints: string;
};

const CategoryRow = ({
  label,
  value,
  maxPoints,
}: {
  label: string;
  value: number;
  maxPoints?: number;
}) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
      {label}
    </Typography>
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.25 }}>
      {maxPoints ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            flexDirection: "column",
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {value} pts
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", lineHeight: 1 }}
          >
            ({maxPoints} pts max)
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {value} pts
        </Typography>
      )}
    </Box>
  </Box>
);

export default function PointsBreakdown({
  breakdown,
  lastUpdated,
  maxAvailableGroupPoints,
}: PointsBreakdownProps) {
  // Ensure we handle nulls from the database
  const theme = useTheme();

  const pts = {
    group: Number(breakdown.groupStage?.points_earned ?? 0),
    standings: Number(breakdown.standings?.points_earned ?? 0),
    knockout: Number(breakdown.knockout?.points_earned ?? 0),
    tiebreakers: Number(breakdown.tiebreakers?.points_earned ?? 0),
  };

  const maxGroupPoints = parseInt(maxAvailableGroupPoints) * 3;

  const totalPoints = pts.group + pts.standings + pts.knockout;

  const formatLastUpdatedTime = (lastUpdatedTimestamp: string) => {
    const lastUpdatedTime = new Date(lastUpdatedTimestamp);
    const now = new Date();

    // 1. Format the Match Kickoff (Existing logic)
    const kickoffTimeStr = lastUpdatedTime.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    const kickoffDateStr = lastUpdatedTime.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
    });
    const formattedLastUpdated = `${kickoffDateStr} - ${kickoffTimeStr}`;

    // 3. Calculate "Time Ago" (Difference in seconds)
    const secondsAgo = Math.floor(
      (now.getTime() - lastUpdatedTime.getTime()) / 1000,
    );

    let timeAgo = "";
    const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

    if (secondsAgo < 3600) {
      timeAgo = rtf.format(-Math.floor(secondsAgo / 60), "minute");
    } else if (secondsAgo < 86400) {
      timeAgo = rtf.format(-Math.floor(secondsAgo / 3600), "hour");
    } else {
      timeAgo = rtf.format(-Math.floor(secondsAgo / 86400), "day");
    }

    return `${formattedLastUpdated} (${timeAgo})`;
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 4,
        overflow: "hidden",
        bgcolor: "background.paper",
      }}
    >
      {/* Total Header */}
      <Box
        sx={{
          p: 1,
          textAlign: "center",
          bgcolor: alpha(theme.palette.primary.main, 0.04),
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: 1 }}
        >
          YOUR CURRENT SCORE
        </Typography>
        <Stack
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          direction="row"
          spacing={1}
        >
          {/* <SportsScoreRoundedIcon color="primary" sx={{ fontSize: 32 }} /> */}
          <Typography variant="h3" sx={{ fontWeight: 900 }} color="primary">
            {totalPoints}
          </Typography>
        </Stack>
      </Box>

      {/* Breakdown List */}
      <Box sx={{ p: 2 }}>
        <Stack spacing={0.5}>
          <CategoryRow
            label="Group Stage Score Predictions"
            value={pts.group}
            maxPoints={maxGroupPoints}
          />
          <Divider sx={{ opacity: 0.6 }} />
          <CategoryRow label="Group Standings" value={pts.standings} />
          <Divider sx={{ opacity: 0.6 }} />
          <CategoryRow label="Knockout Stage" value={pts.knockout} />
          <Divider sx={{ opacity: 0.6 }} />
          <CategoryRow label="Tiebreakers" value={pts.tiebreakers} />
        </Stack>
      </Box>

      {/* Subtle Footer */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          bgcolor: "action.hover",
          borderTop: 1,
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: 1 }}
        >
          POINTS LAST UPDATED
        </Typography>
        <Typography variant="body2" color="primary" sx={{ fontWeight: "bold" }}>
          {formatLastUpdatedTime(lastUpdated.matches)}
        </Typography>
      </Box>
    </Paper>
  );
}
