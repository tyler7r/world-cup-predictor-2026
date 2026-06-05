"use client";

import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PaidIcon from "@mui/icons-material/Paid";
import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";

type PoolEntryProps = {
  poolEntries: { count: number };
};

export default function PoolEntryPage({ poolEntries }: PoolEntryProps) {
  const theme = useTheme();

  // Chain Colors - Used exclusively for accents
  const chainGold = "#FFD700";

  const totalPot = Number(poolEntries.count) * 10;

  // 50/50 Math
  const teamFund = (totalPot * 0.5).toFixed(2);
  const playerPool = (totalPot * 0.5).toFixed(2);

  // Prize Split (75% / 25% of the player pool)
  const firstPlacePrize = (totalPot * 0.5 * 0.75).toFixed(2);
  const secondPlacePrize = (totalPot * 0.5 * 0.25).toFixed(2);

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", pb: 4, pt: 4, px: 2 }}>
      {/* Header Section */}
      <Paper
        sx={{
          p: 2,
          textAlign: "center",
          bgcolor: alpha(theme.palette.background.paper, 0.4),
          mb: 4,
          borderRadius: 4,
          borderColor: alpha(chainGold, 0.3),
        }}
      >
        <Stack
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            gap: 1,
            mb: 1,
            position: "relative",
          }}
        >
          <ElectricBoltIcon
            sx={{
              color: chainGold,
              fontSize: 32,
              position: "absolute",
              top: "55%",
              right: 0,
            }}
          />
          <ElectricBoltIcon
            sx={{
              color: chainGold,
              fontSize: 32,
              position: "absolute",
              top: "55%",
              left: 0,
            }}
          />
          <Typography
            variant="h4"
            sx={{
              fontWeight: 900,
              letterSpacing: -1,
              color: "text.primary",
            }}
          >
            CHAIN LIGHTNING PRO POOL
          </Typography>
        </Stack>
        <Typography
          variant="caption"
          sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: 1 }}
        >
          50/50 WORLD CUP FUNDRAISER • $10 USD ENTRY
        </Typography>
      </Paper>

      {/* Main Total Pot Display */}
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          textAlign: "center",
          borderRadius: 4,
          bgcolor: "background.paper",
          mb: 3,
          boxShadow: `0 8px 32px ${alpha(chainGold, 0.08)}`,
        }}
      >
        <Typography
          variant="body2"
          sx={{ letterSpacing: 1.5, fontWeight: 800, color: "text.secondary" }}
        >
          TOTAL RAISED SO FAR
        </Typography>
        <Typography
          variant="h1"
          sx={{ fontWeight: 900, my: 1, color: chainGold }}
        >
          ${totalPot}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "text.secondary", fontWeight: 500 }}
        >
          Across {poolEntries.count} verified entries
        </Typography>
      </Paper>

      {/* The 50/50 Breakdown */}
      <Stack
        sx={{
          display: "flex",
          flexDirection: "row",
          gap: 2,
          mb: 3,
        }}
      >
        {/* Team Fund Side */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            p: 2,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: alpha(chainGold, 0.03),
            borderColor: alpha(chainGold, 0.4),
          }}
        >
          <ElectricBoltIcon sx={{ color: chainGold, fontSize: 32, mb: 0.5 }} />
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "text.primary" }}
          >
            ${teamFund}
          </Typography>
          <Typography
            variant="caption"
            sx={{ fontWeight: 800, color: chainGold, letterSpacing: 0.5 }}
          >
            TEAM FUND (50%)
          </Typography>
        </Paper>

        {/* Player Pool Side */}
        <Paper
          variant="outlined"
          sx={{
            flex: 1,
            p: 2,
            textAlign: "center",
            borderRadius: 3,
            bgcolor: "background.paper",
            borderColor: "divider",
          }}
        >
          <EmojiEventsIcon
            sx={{ color: "text.secondary", fontSize: 32, mb: 0.5 }}
          />
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "text.primary" }}
          >
            ${playerPool}
          </Typography>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 700,
              color: "text.secondary",
              letterSpacing: 0.5,
            }}
          >
            PRIZE POOL (50%)
          </Typography>
        </Paper>
      </Stack>

      {/* Prize Breakdown Detail with Progress Bar */}
      <Box
        sx={{
          mb: 4,
          p: 3,
          bgcolor: alpha(theme.palette.background.default, 0.5),
          borderRadius: 3,
        }}
      >
        <Stack
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1.5,
          }}
        >
          {/* Text Labels */}
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <Box>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: "text.secondary", mb: 0.5 }}
              >
                🥇 1ST PLACE (75%)
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: chainGold }}
              >
                ${firstPlacePrize}
              </Typography>
            </Box>
            <Box sx={{ textAlign: "right" }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 700, color: "text.secondary", mb: 0.5 }}
              >
                🥈 2ND PLACE (25%)
              </Typography>
              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "text.primary" }}
              >
                ${secondPlacePrize}
              </Typography>
            </Box>
          </Stack>

          {/* 75/25 Visual Bar */}
          <Box
            sx={{
              width: "100%",
              height: 12,
              display: "flex",
              borderRadius: 6,
              overflow: "hidden",
              mt: 1,
            }}
          >
            <Box
              sx={{
                width: "75%",
                bgcolor: chainGold,
                height: "100%",
              }}
            />
            <Box
              sx={{
                width: "25%",
                bgcolor: alpha(theme.palette.text.secondary, 0.3),
                height: "100%",
              }}
            />
          </Box>
        </Stack>
      </Box>

      {/* Action Section */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 800, mb: 1, color: "text.primary" }}
        >
          Support Chain Lightning. Win some cash.
        </Typography>

        <Typography
          variant="body1"
          sx={{ fontWeight: 800, mb: 1, color: "text.secondary" }}
        >
          Please use the following format on your Venmo, so I know who to add:
          WCP-(your_email@blank.com)
        </Typography>

        <Stack
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            mb: 2,
            mt: 3,
          }}
        >
          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<PaidIcon />}
            href="https://account.venmo.com/u/Tyler-Randall-11"
            target="_blank"
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontSize: "1.1rem",
              fontWeight: 800,
              bgcolor: "#008CFF", // Kept Venmo Blue for trust/UX recognition
              "&:hover": { bgcolor: "#0074D9" },
              boxShadow: "0 4px 14px 0 rgba(0,140,255,0.39)",
            }}
          >
            Buy In With Venmo
          </Button>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 1, px: 2 }}
        >
          Email me (tyler7r@gmail.com) if you need to use an alternative payment
          method. Half of your entry goes directly to funding our team&apos;s
          travel and bid fees for the upcoming season!
        </Typography>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Verification Notice */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", textAlign: "center", fontStyle: "italic" }}
      >
        Note: I manually verify payments. Your Pro Pool status will be updated
        once the transfer is confirmed.
      </Typography>
    </Box>
  );
}
