"use client";

import {
  Alert,
  alpha,
  Box,
  Divider,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useTheme,
} from "@mui/material";
import { ActualTiebreakers, Tiebreakers } from "../types";

type LockedTieBreakerProps = {
  data: Tiebreakers;
  actualTiebreakers: ActualTiebreakers;
};

export default function LockedTieBreakerStep({
  data,
  actualTiebreakers,
}: LockedTieBreakerProps) {
  // Historical data for the table
  const theme = useTheme();

  const historicalData = [
    { year: 2022, host: "Qatar", games: 64, goals: 172, yellow: 227, red: 4 },
    { year: 2018, host: "Russia", games: 64, goals: 169, yellow: 219, red: 4 },
    { year: 2014, host: "Brazil", games: 64, goals: 171, yellow: 187, red: 8 },
  ];

  const goalsCount =
    Number(actualTiebreakers.away_goals) + Number(actualTiebreakers.home_goals);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        If multiple users finish with the exact same number of points, we will
        use these tournament-wide totals to break the tie. Closest prediction
        wins!
      </Typography>
      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: "block" }}
        >
          • <strong>Goals:</strong> exactly correct earns you 5 points, within 3
          goals earns you 3 points
          <br />• <strong>Yellow Cards:</strong> exactly correct earns you 5
          points, within 3 yellow cards earns you 3 points
          <br />• <strong>Red Cards:</strong> exactly correct earns you 3 points
          <br />• If these still aren&apos;t enough to determine a winner I will
          manually see who is closest on goals then yellow cards then red cards
        </Typography>
      </Alert>

      <Grid container spacing={2}>
        {/* Left Column: Historical Reference Table */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontSize: "1rem", fontWeight: "bold" }}
          >
            Historical Reference (64-Game Format)
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 1 }}>
            <Table size="small" aria-label="historical stats table">
              <TableHead sx={{ backgroundColor: "action.hover" }}>
                <TableRow>
                  <TableCell>
                    <strong>Year</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Goals</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Yellows</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>Reds</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {historicalData.map((row) => (
                  <TableRow key={row.year}>
                    <TableCell component="th" scope="row">
                      {row.year} ({row.host})
                    </TableCell>
                    <TableCell align="right">{row.goals}</TableCell>
                    <TableCell align="right">{row.yellow}</TableCell>
                    <TableCell align="right">{row.red}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Typography variant="caption" color="text.secondary">
            *Goals exclude penalty shootouts.
          </Typography>
        </Grid>

        {/* Right Column: User Inputs */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ fontSize: "1rem", fontWeight: "bold", mb: 1 }}
          >
            Your 2026 Predictions (104 Games)
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column" }}>
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
              Total Goals (Prediction | Actual)
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
                border: 1,
                borderColor: theme.palette.divider,
                mb: 2,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {data.predicted_total_goals}
              </Typography>
              <Divider flexItem orientation="vertical" />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {goalsCount}
              </Typography>
            </Box>
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
              Total Yellow Cards (Prediction | Actual)
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
                border: 1,
                borderColor: theme.palette.divider,
                mb: 2,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {data.predicted_yellow_cards}
              </Typography>
              <Divider flexItem orientation="vertical" />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {actualTiebreakers.yellow_cards}
              </Typography>
            </Box>
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
              Total Red Cards (Prediction | Actual)
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
                border: 1,
                borderColor: theme.palette.divider,
                mb: 1,
              }}
            >
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {data.predicted_red_cards}
              </Typography>
              <Divider flexItem orientation="vertical" />
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {actualTiebreakers.red_cards}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
