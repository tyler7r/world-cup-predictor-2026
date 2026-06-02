"use client";
import {
  alpha,
  Avatar,
  Box,
  Divider,
  Typography,
  useTheme,
} from "@mui/material";
import { GroupStanding } from "../types";

type LockedStandingsProps = {
  label: string;
  standings: { id: number; flag: string; name: string; name_code: string };
  options: GroupStanding[];
  value: number | null | undefined;
};

export default function LockedStandings({
  label,
  standings,
  options,
  value,
}: LockedStandingsProps) {
  const selectedTeam = options.find((t) => t.teamId === value);
  const theme = useTheme();
  return (
    <Box sx={{ mb: 0.5 }}>
      <Typography
        variant="caption"
        sx={{
          color: "text.secondary",
          fontWeight: 600,
          ml: 0.5,
          mb: 0.5,
          display: "block",
        }}
      >
        {label.toUpperCase()} (Prediction | Actual)
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: "8.5px 14px", // Matches default MUI small input padding
          bgcolor: (theme) =>
            alpha(theme.palette.action.disabledBackground, 0.05),
          borderRadius: 1,
          border: 2,
          borderColor:
            selectedTeam?.teamId === standings.id
              ? theme.palette.success.light
              : theme.palette.error.light,
        }}
      >
        {selectedTeam ? (
          <Box
            sx={{
              display: "flex",
              width: "100%",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Avatar
              src={selectedTeam.flagUrl}
              variant="rounded"
              sx={{ width: 24, height: 18 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {selectedTeam.teamName}
            </Typography>
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            <Avatar
              src={standings.flag}
              variant="rounded"
              sx={{ width: 24, height: 18 }}
            />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              {standings.name}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="text.disabled">
            No selection
          </Typography>
        )}
      </Box>
    </Box>
  );
}
