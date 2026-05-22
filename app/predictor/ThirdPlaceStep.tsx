"use client";

import {
  Alert,
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
import { calculateGroupStandings, Match, StandingPredictions } from "./types";

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
  // 1. Extract the 3rd place team from every group based on user scores
  const allThirdPlaceTeams = standings
    .map((s) => {
      const groupMatches = matches.filter((m) => m.group_name === s.group_name);
      const calculated = calculateGroupStandings(groupMatches);
      // Find the team the user actually SELECTED as 3rd in this group
      const userPickedThird = calculated.find((t) => t.teamId === s.t_id);
      return { ...userPickedThird, groupName: s.group_name };
    })
    .sort(
      (a, b) => (b.points || 0) - (a.points || 0) || (b.gd || 0) - (a.gd || 0),
    );

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Best Third-Place Teams
      </Typography>
      <Alert severity="info" sx={{ mb: 3 }}>
        Select the <b>8 teams</b> you believe will advance to the Round of 32.
        Current selection: {selectedThirdPlaceIds.length} / 8
      </Alert>

      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Team (Group)</TableCell>
              <TableCell align="center">Pts</TableCell>
              <TableCell align="center">GD</TableCell>
              <TableCell align="center">GF</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {allThirdPlaceTeams.map((team) => {
              const isSelected = selectedThirdPlaceIds.includes(team.teamId!);
              const isDisabled =
                !isSelected && selectedThirdPlaceIds.length >= 8;

              return (
                <TableRow
                  key={team.teamId}
                  selected={isSelected}
                  sx={{ opacity: isDisabled ? 0.5 : 1 }}
                >
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={() => onToggleThirdPlace(team.teamId!)}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        src={team.flagUrl}
                        variant="rounded"
                        sx={{ width: 24, height: 16 }}
                      />
                      <Typography variant="body2">
                        {team.teamName} ({team.groupName})
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="center">{team.points}</TableCell>
                  <TableCell align="center">{team.gd}</TableCell>
                  <TableCell align="center">{team.gf}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
