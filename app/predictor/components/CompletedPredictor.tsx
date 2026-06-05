"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";
import LockClockIcon from "@mui/icons-material/LockClock";
import PaidIcon from "@mui/icons-material/Paid";
import { Box, Button, Paper, Stack, Typography, useTheme } from "@mui/material";
import { alpha } from "@mui/material/styles";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PredictorComplete() {
  const theme = useTheme();

  // World Cup 2026 Approximate Kickoff: June 11, 2026
  const targetDate = new Date("2026-06-11T12:00:00Z").getTime();

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(interval);
        return;
      }

      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor(
          (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
        ),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", py: 4, px: 2, textAlign: "center" }}>
      {/* 1. Success Hero Section */}
      <Stack
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
          mb: 4,
        }}
      >
        <CheckCircleIcon sx={{ fontSize: 64, color: "success.main", mb: 1 }} />
        <Typography
          variant="h4"
          sx={{ fontWeight: 900, letterSpacing: "-0.02em" }}
        >
          Predictor Complete!
        </Typography>
        <Typography
          variant="body1"
          sx={{ color: "text.secondary", maxWidth: 450 }}
        >
          Your predictions have been successfully saved. You are officially
          ready for the 2026 World Cup.
        </Typography>
      </Stack>

      {/* 2. The Countdown Timer */}
      <Paper
        variant="outlined"
        sx={{
          p: 4,
          borderRadius: 4,
          bgcolor: "background.paper",
          borderColor: "divider",
          mb: 5,
        }}
      >
        <Stack
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 3,
          }}
        >
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 1,
              color: "text.primary",
            }}
          >
            <LockClockIcon color="action" />
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 700, letterSpacing: 0.2 }}
            >
              Edits lock when the first match kicks off in:
            </Typography>
          </Stack>

          {/* Time Blocks */}
          <Stack
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "center",
              gap: { xs: 1.5, sm: 3 },
            }}
          >
            {Object.entries(timeLeft).map(([unit, value]) => (
              <Stack
                key={unit}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.5,
                }}
              >
                <Paper
                  elevation={0}
                  sx={{
                    width: { xs: 54, sm: 60 },
                    height: { xs: 54, sm: 60 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(theme.palette.text.primary, 0.04),
                    border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="h4"
                    sx={{ fontWeight: 800, fontFamily: "monospace" }}
                  >
                    {value.toString().padStart(2, "0")}
                  </Typography>
                </Paper>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 700,
                    color: "text.secondary",
                    textTransform: "uppercase",
                  }}
                >
                  {unit}
                </Typography>
              </Stack>
            ))}
          </Stack>

          <Typography
            variant="body2"
            sx={{ color: "text.secondary", fontStyle: "italic" }}
          >
            You can return to this dashboard to tweak your scores and standings
            at any time before the timer hits zero.
          </Typography>
        </Stack>
      </Paper>

      {/* 3. Upsell to the Pool */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          borderRadius: 4,
          bgcolor: alpha(theme.palette.warning.main, 0.05),
          border: `2px solid ${alpha(theme.palette.warning.main, 0.3)}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Stack
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
            position: "relative",
            zIndex: 1,
          }}
        >
          <ElectricBoltIcon
            sx={{ fontSize: 40, color: theme.palette.warning.main }}
          />
          <Typography
            variant="h5"
            sx={{ fontWeight: 800, color: "text.primary" }}
          >
            Put Your Predictor to the Test
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", mb: 2 }}>
            Now that your picks are in, join the official{" "}
            <strong>Chain Lightning 50/50 Pool</strong>. Win cash prizes while
            supporting the team&apos;s upcoming season!
          </Typography>

          <Button
            component={Link}
            href="/pool-entry"
            variant="contained"
            size="large"
            startIcon={<PaidIcon />}
            sx={{
              py: 1.5,
              px: 4,
              borderRadius: 2,
              fontWeight: 800,
              fontSize: "1.1rem",
              bgcolor: theme.palette.warning.main,
              color: "black",
              "&:hover": { bgcolor: alpha(theme.palette.warning.main, 0.8) },
              boxShadow: `0 8px 24px ${alpha(theme.palette.warning.main, 0.2)}`,
            }}
          >
            Enter the Global Pool
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
