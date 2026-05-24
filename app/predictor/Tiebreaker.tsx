"use client";

import {
  Alert,
  AlertTitle,
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";

export type TieBreakerData = {
  totalGoals: number | "";
  totalYellowCards: number | "";
  totalRedCards: number | "";
};

type TieBreakerStepProps = {
  data: TieBreakerData;
  onChange: (field: keyof TieBreakerData, value: number | "") => void;
};

export default function TieBreakerStep({
  data,
  onChange,
}: TieBreakerStepProps) {
  // Historical data for the table
  const historicalData = [
    { year: 2022, host: "Qatar", games: 64, goals: 172, yellow: 227, red: 4 },
    { year: 2018, host: "Russia", games: 64, goals: 169, yellow: 219, red: 4 },
    { year: 2014, host: "Brazil", games: 64, goals: 171, yellow: 187, red: 8 },
  ];

  const handleInputChange =
    (field: keyof TieBreakerData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      // Allow empty string to clear the input, otherwise parse as integer
      onChange(field, val === "" ? "" : parseInt(val, 10) || 0);
    };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Tournament Tiebreakers
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        If multiple users finish with the exact same number of points, we will
        use these tournament-wide totals to break the tie. Closest prediction
        wins!
      </Typography>

      <Alert severity="warning" sx={{ mb: 4 }}>
        <AlertTitle>
          <strong>Format Change Warning</strong>
        </AlertTitle>
        The 2026 tournament features an expanded format. There will be{" "}
        <strong>104 total matches</strong> played, compared to the standard 64
        matches played in previous tournaments. Adjust your estimates
        accordingly!
      </Alert>

      <Grid container spacing={4}>
        {/* Left Column: Historical Reference Table */}
        <Grid size={{ xs: 12, sm: 6 }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: "1rem" }}>
            Historical Reference (64-Game Format)
          </Typography>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
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
          <Typography variant="h6" gutterBottom sx={{ fontSize: "1rem" }}>
            Your 2026 Predictions (104 Games)
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <TextField
              label="Total Goals Scored"
              type="number"
              variant="outlined"
              fullWidth
              value={data.totalGoals}
              onChange={handleInputChange("totalGoals")}
              slotProps={{ htmlInput: { min: 0 } }}
              //   inputProps={{ min: 0 }}
              helperText="Excluding penalty shootouts"
            />
            <TextField
              label="Total Yellow Cards"
              type="number"
              variant="outlined"
              fullWidth
              value={data.totalYellowCards}
              onChange={handleInputChange("totalYellowCards")}
              slotProps={{ htmlInput: { min: 0 } }}
            />
            <TextField
              label="Total Red Cards"
              type="number"
              variant="outlined"
              fullWidth
              value={data.totalRedCards}
              onChange={handleInputChange("totalRedCards")}
              slotProps={{ htmlInput: { min: 0 } }}
              //   inputProps={{ min: 0 }}
            />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
