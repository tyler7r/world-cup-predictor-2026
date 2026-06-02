"use client";

import { Box, Divider, Paper, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { PointsBreakdownType } from "./types";

type PointsBreakdownProps = {
  breakdown: PointsBreakdownType;
};

const CategoryRow = ({ label, value }: { label: string; value: number }) => (
  <Box sx={{ display: "flex", justifyContent: "space-between", py: 1 }}>
    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
      {label}
    </Typography>
    <Typography variant="body2" sx={{ fontWeight: 700 }}>
      {value} pts
    </Typography>
  </Box>
);

export default function PointsBreakdown({ breakdown }: PointsBreakdownProps) {
  // Ensure we handle nulls from the database
  const pts = {
    group: Number(breakdown.groupStage?.points_earned ?? 0),
    standings: Number(breakdown.standings?.points_earned ?? 0),
    third: Number(breakdown.thirdPlace?.points_earned ?? 0),
    knockout: Number(breakdown.knockout?.points_earned ?? 0),
  };

  const totalPoints = pts.group + pts.standings + pts.third + pts.knockout;

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
          bgcolor: (theme) => alpha(theme.palette.primary.main, 0.04),
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
          <CategoryRow label="Match Predictions" value={pts.group} />
          <Divider sx={{ opacity: 0.6 }} />
          <CategoryRow label="Group Standings" value={pts.standings} />
          <Divider sx={{ opacity: 0.6 }} />
          <CategoryRow label="Third Place Qualifiers" value={pts.third} />
          <Divider sx={{ opacity: 0.6 }} />
          <CategoryRow label="Knockout Stage" value={pts.knockout} />
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
        }}
      >
        <Typography
          variant="caption"
          color="text.disabled"
          sx={{ textAlign: "center", display: "block", fontWeight: 600 }}
        >
          POINTS LAST UPDATED: {}
        </Typography>
      </Box>
    </Paper>
  );
}
