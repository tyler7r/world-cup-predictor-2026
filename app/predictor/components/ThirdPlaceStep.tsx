"use client";

import {
  Avatar,
  Box,
  Checkbox,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { calculateGroupStandings, Match, StandingPredictions } from "../types";

interface ThirdPlaceStepProps {
  matches: Match[];
  standings: StandingPredictions[];
  selectedThirdPlaceIds: number[];
  onToggleThirdPlace: (teamId: number) => void;
}

export default function ThirdPlaceStep({
  matches,
  standings,
  selectedThirdPlaceIds,
  onToggleThirdPlace,
}: ThirdPlaceStepProps) {
  const allThirdPlaceTeams = standings
    .map((s) => {
      const groupMatches = matches.filter((m) => m.group_name === s.group_name);
      const calculated = calculateGroupStandings(groupMatches);
      const userPickedThird = calculated.find((t) => t.teamId === s.t_id);
      return { ...userPickedThird, groupName: s.group_name };
    })
    .sort(
      (a, b) => (b.points || 0) - (a.points || 0) || (b.gd || 0) - (a.gd || 0),
    );

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{ borderRadius: 2 }}
    >
      <Table size={"medium"}>
        <TableHead sx={{ bgcolor: "action.hover" }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 700 }} padding="checkbox">
              R32?
            </TableCell>
            <TableCell sx={{ fontWeight: 700 }}>Team (Group)</TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>
              Pts
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>
              GD
            </TableCell>
            <TableCell align="center" sx={{ fontWeight: 700 }}>
              GF
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allThirdPlaceTeams.map((team) => {
            const isSelected = selectedThirdPlaceIds.includes(team.teamId!);
            const isDisabled = !isSelected && selectedThirdPlaceIds.length >= 8;

            return (
              <TableRow
                key={team.teamId}
                selected={isSelected}
                sx={{
                  opacity: isDisabled ? 0.5 : 1,
                  // Highlight selected rows slightly more when locked
                  ...(isSelected && {
                    bgcolor: (theme) => alpha(theme.palette.success.main, 0.04),
                  }),
                  height: 50,
                }}
              >
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onChange={() => onToggleThirdPlace(team.teamId!)}
                    color="primary"
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Avatar
                      src={team.flagUrl}
                      variant="rounded"
                      sx={{
                        width: 24,
                        height: 16,
                        border: "1px solid",
                        borderColor: "divider",
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: isSelected ? 600 : 400 }}
                    >
                      {team.teamName}{" "}
                      <span style={{ opacity: 0.6 }}>({team.groupName})</span>
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell
                  align="center"
                  sx={{ fontWeight: isSelected ? 600 : 400 }}
                >
                  {team.points}
                </TableCell>
                <TableCell align="center">{team.gd}</TableCell>
                <TableCell align="center">{team.gf}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
