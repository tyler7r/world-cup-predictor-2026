"use client";

import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import {
  Avatar,
  Box,
  Chip,
  FormControlLabel,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import { LeaderboardEntry } from "./types";

interface LeaderboardProps {
  leaderboard: LeaderboardEntry[];
  global: boolean;
  name: string;
}

export default function Leaderboard({
  leaderboard,
  global,
  name,
}: LeaderboardProps) {
  const [showOnlyPaid, setShowOnlyPaid] = useState(false);
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  // 1. Filter the entire dataset first
  const filteredEntries = showOnlyPaid
    ? leaderboard.filter((entry) => entry.entered_pool)
    : leaderboard;

  // 2. Slice the dataset to get only the rows for the current page
  const displayedEntries = filteredEntries.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  // Handle toggle change and reset pagination safely
  const handleToggleChange = (checked: boolean) => {
    setShowOnlyPaid(checked);
    setPage(0); // Always return to the first page when changing filters
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        mt: global ? 2 : 0,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexWrap: "wrap",
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          {name} Leaderboard
        </Typography>

        {/* The "Pro Pool" Toggle */}
        {global && (
          <Stack
            sx={{ alignItems: "center", display: "flex" }}
            direction="row"
            spacing={1}
          >
            <ElectricBoltIcon
              color={showOnlyPaid ? "warning" : "disabled"}
              sx={{ fontSize: 20 }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={showOnlyPaid}
                  onChange={(e) => handleToggleChange(e.target.checked)}
                  color="warning"
                />
              }
              label={
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: showOnlyPaid ? "warning.main" : "text.secondary",
                  }}
                >
                  PRO POOL ONLY
                </Typography>
              }
              labelPlacement="start"
            />
          </Stack>
        )}
      </Box>

      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead sx={{ bgcolor: "action.hover" }}>
              <TableRow>
                <TableCell width="10%">
                  <strong>#</strong>
                </TableCell>
                <TableCell>
                  <strong>Player</strong>
                </TableCell>
                <TableCell>
                  <strong>Winner</strong>
                </TableCell>
                <TableCell align="left">
                  <strong>Pro Pool?</strong>
                </TableCell>
                <TableCell align="right">
                  <strong>Points</strong>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayedEntries.length > 0 ? (
                displayedEntries.map((entry, index) => {
                  // Calculate their actual rank across all pages
                  const absoluteRank = page * rowsPerPage + index;

                  return (
                    <TableRow
                      key={entry.user_id}
                      sx={{
                        // Highlight rows only for actual 1st and 2nd place
                        ...(showOnlyPaid &&
                          absoluteRank === 0 && {
                            bgcolor: "rgba(255, 215, 0, 0.05)",
                          }),
                        ...(showOnlyPaid &&
                          absoluteRank === 1 && {
                            bgcolor: "rgba(192, 192, 192, 0.05)",
                          }),
                        textTransform: "none",
                      }}
                    >
                      <TableCell>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontWeight: 800 }}
                        >
                          {absoluteRank + 1}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          component={Link}
                          href={`/predictor/${entry.user_id}`}
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            textDecoration: "none",
                            color: "primary.main",
                            "&:hover": {
                              textDecoration: "underline",
                            },
                          }}
                        >
                          {entry.display_name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Avatar
                          variant="rounded"
                          src={entry.flag_url}
                          sx={{ height: 28, width: 42 }}
                        />
                      </TableCell>
                      <TableCell>
                        {entry.entered_pool ? (
                          <Chip
                            label="YES"
                            color="success"
                            size="small"
                            sx={{
                              fontSize: "0.65rem",
                              fontWeight: 900,
                              height: 20,
                              px: 1,
                            }}
                          />
                        ) : (
                          <Chip
                            label="NO"
                            color="error"
                            variant="outlined"
                            size="small"
                            sx={{
                              fontSize: "0.65rem",
                              fontWeight: 900,
                              height: 20,
                              px: 1,
                              opacity: 0.5,
                            }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="h6"
                          sx={{ fontWeight: 900, color: "primary.main" }}
                        >
                          {entry.total_points}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No participants found.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination Control */}
        <TablePagination
          component="div"
          count={filteredEntries.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[10]} // Locks it to 10 rows maximum
          sx={{ borderTop: 1, borderColor: "divider" }}
        />
      </Paper>

      {showOnlyPaid && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontStyle: "italic", textAlign: "right" }}
        >
          * Displaying only players eligible for the cash prizes.
        </Typography>
      )}
    </Box>
  );
}
