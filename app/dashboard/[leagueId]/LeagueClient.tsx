// app/dashboard/[leagueId]/LeagueClient.tsx
"use client";

import { ArrowBack, ContentCopy, EditNote } from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import type { LeaderboardEntry, LeagueInfo } from "./page";

interface LeagueClientProps {
  leagueId: string;
  leagueInfo: LeagueInfo;
  leaderboard: LeaderboardEntry[];
}

export default function LeagueClient({
  leagueId,
  leagueInfo,
  leaderboard,
}: LeagueClientProps) {
  // Quick helper to copy the invite code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(leagueInfo.invite_code);
    alert("Invite code copied to clipboard!");
  };

  return (
    <Container sx={{ mt: 6 }}>
      {/* Header Section */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Button
          component={Link}
          href="/dashboard"
          startIcon={<ArrowBack />}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 2,
        }}
      >
        <Box>
          <Typography variant="h3" gutterBottom>
            {leagueInfo.name} ({leagueId})
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="subtitle1" color="text.secondary">
              Invite Code: <strong>{leagueInfo.invite_code}</strong>
            </Typography>
            <Tooltip title="Copy Code">
              <IconButton size="small" onClick={handleCopyCode} sx={{ ml: 1 }}>
                <ContentCopy fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* The link to the actual predictor form */}
        <Button
          variant="contained"
          size="large"
          color="primary"
          startIcon={<EditNote />}
          component={Link}
          href="/predictor"
        >
          My Bracket
        </Button>
      </Box>

      {/* Leaderboard Table */}
      <TableContainer component={Paper} variant="outlined">
        <Table>
          <TableHead sx={{ bgcolor: "grey.100" }}>
            <TableRow>
              <TableCell width="10%">
                <strong>Rank</strong>
              </TableCell>
              <TableCell>
                <strong>Player</strong>
              </TableCell>
              <TableCell align="right">
                <strong>Total Points</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {leaderboard.map((entry, index) => (
              <TableRow key={entry.id} hover>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{entry.display_name}</TableCell>
                <TableCell align="right">
                  <Typography variant="h6" color="primary">
                    {entry.total_score}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
}
