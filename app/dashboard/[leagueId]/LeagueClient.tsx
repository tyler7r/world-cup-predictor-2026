"use client";

import {
  ArrowBackRounded,
  ContentCopyRounded,
  PeopleRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Container,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import Link from "next/link";
import { useState } from "react";
import Leaderboard from "../Leaderboard";
import { LeaderboardEntry } from "../types";
import type { LeagueInfo } from "./page";

interface LeagueClientProps {
  leagueId: string;
  leagueInfo: LeagueInfo;
  leaderboard: LeaderboardEntry[];
  memberCount: { members: number };
}

export default function LeagueClient({
  leagueInfo,
  leaderboard,
  memberCount,
}: LeagueClientProps) {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    const code = leagueInfo.invite_code;

    if (navigator.clipboard && window.isSecureContext) {
      // Modern, secure context approach
      navigator.clipboard
        .writeText(code)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => console.error("Failed to copy text: ", err));
    } else {
      // Fallback approach for HTTP / local network IP testing
      try {
        const textArea = document.createElement("textarea");
        textArea.value = code;

        // Avoid scrolling to bottom of page when appending
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);

        if (successful) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          console.error("Fallback copy failed");
        }
      } catch (err) {
        console.error("Fallback copy execution failed: ", err);
      }
    }
  };

  return (
    <Container maxWidth="lg" sx={{ pb: 4, mt: 2 }}>
      {/* Navigation Header */}
      <Box sx={{ mb: 2 }}>
        <Button
          component={Link}
          href="/dashboard"
          startIcon={<ArrowBackRounded />}
          sx={{
            fontWeight: 700,
            borderRadius: 2,
            color: "text.secondary",
            "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.05) },
          }}
        >
          Back to Dashboard
        </Button>
      </Box>

      {/* League Identity Card */}
      <Paper
        elevation={0}
        variant="outlined"
        sx={{
          borderRadius: 3,
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          mb: 4,
          overflow: "hidden",
        }}
      >
        <Stack
          sx={{
            p: { xs: 2, md: 2.5 }, // Reduced padding
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 2,
          }}
        >
          <Stack sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography
              variant="h4"
              sx={{ fontWeight: 800, letterSpacing: "-0.02em" }}
            >
              {leagueInfo.name}
            </Typography>

            <Stack
              sx={{
                display: "flex",
                flexDirection: "column",
                // alignItems: "center",
                gap: 2,
              }}
            >
              {/* Member Count */}
              <Stack
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 0.75,
                  color: "text.secondary",
                }}
              >
                <PeopleRounded sx={{ fontSize: "1.1rem" }} />
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {memberCount.members}{" "}
                  {memberCount.members === 1 ? "Member" : "Members"}
                </Typography>
              </Stack>

              {/* Invite Code Section */}
              <Stack
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ fontWeight: 700, color: "text.secondary" }}
                >
                  Invite Code:
                </Typography>
                <Stack
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      color: "primary.main",
                      py: 0.5,
                      px: 1.5,
                      borderRadius: 1.5,
                      fontWeight: 800,
                      fontFamily: "monospace",
                      fontSize: "0.85rem",
                      letterSpacing: 1,
                    }}
                  >
                    {leagueInfo.invite_code}
                  </Typography>
                  <Tooltip title={copied ? "Copied!" : "Copy Invite Code"}>
                    <IconButton
                      size="small"
                      onClick={handleCopyCode}
                      sx={{
                        color: "primary.main",
                        bgcolor: "white",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        "&:hover": {
                          bgcolor: "white",
                          transform: "scale(1.1)",
                        },
                      }}
                    >
                      <ContentCopyRounded sx={{ fontSize: "1rem" }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Paper>

      {/* Competitive Section */}
      <Box sx={{ mt: 2 }}>
        <Leaderboard
          leaderboard={leaderboard}
          global={false}
          name={leagueInfo.name}
        />
      </Box>
    </Container>
  );
}
