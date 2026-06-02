"use client";

import {
  alpha,
  Box,
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
import { useEffect } from "react";
import { Tiebreakers } from "../types";

type LockedTieBreakerProps = {
  data: Tiebreakers;
};

export default function LockedTieBreakerStep({ data }: LockedTieBreakerProps) {
  // Historical data for the table
  const theme = useTheme();

  useEffect(() => {
    console.log(data);
  }, [data]);

  const historicalData = [
    { year: 2022, host: "Qatar", games: 64, goals: 172, yellow: 227, red: 4 },
    { year: 2018, host: "Russia", games: 64, goals: 169, yellow: 219, red: 4 },
    { year: 2014, host: "Brazil", games: 64, goals: 171, yellow: 187, red: 8 },
  ];

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        If multiple users finish with the exact same number of points, we will
        use these tournament-wide totals to break the tie. Closest prediction
        wins!
      </Typography>

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
              Total Goals
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
              Total Yellow Cards
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
              Total Red Cards
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
                {data.predicted_yellow_cards}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
