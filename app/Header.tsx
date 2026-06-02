"use client";

import AddIcon from "@mui/icons-material/Add";
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import LeaderboardRoundedIcon from "@mui/icons-material/LeaderboardRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import PaidRoundedIcon from "@mui/icons-material/PaidRounded";
import PublicIcon from "@mui/icons-material/Public";
import SportsSoccerIcon from "@mui/icons-material/SportsSoccer";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { usePathname, useRouter } from "next/navigation";

// Clerk imports
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  // Helper to style active navigation links
  const isNavActive = (path: string) => pathname === path;

  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: 1,
        borderRadius: 0,
        borderBottomLeftRadius: 8,
        borderBottomRightRadius: 8,
        borderColor: "divider",
        backdropFilter: "blur(8px)",
        background: (theme) => alpha(theme.palette.background.paper, 0.8),
      }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          px: { xs: 1.5, sm: 3 },
          // py: { xs: 0.5, md: 2 },
        }}
      >
        {/* Left Side: Brand Text Title */}
        {isDesktop ? (
          <Box
            onClick={() => router.push("/dashboard")}
            sx={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                letterSpacing: -0.5,
                lineHeight: 0.9,
                background: (theme) =>
                  `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                height: 40,
              }}
            >
              <PublicIcon
                sx={{
                  fontSize: 12,
                }}
              />
              <SportsSoccerIcon sx={{ fontSize: 12 }} />
              2026 World
              <br />
              Cup Predictor
            </Typography>
          </Box>
        ) : (
          <Box
            onClick={() => router.push("/dashboard")}
            sx={{
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 900,
                letterSpacing: -0.5,
                background: (theme) =>
                  `linear-gradient(45deg, ${theme.palette.primary.main}, ${theme.palette.primary.dark})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 0.9,
                width: 55,
              }}
            >
              2026 <br /> WCP
            </Typography>
          </Box>
        )}

        {/* Center: Core Icon Navigation */}
        <Show when="signed-in">
          <Stack direction="row" spacing={{ xs: 0.5, sm: 1.5 }}>
            <Tooltip title="Home">
              <IconButton
                color={isNavActive("/") ? "primary" : "default"}
                onClick={() => router.push("/dashboard")}
                sx={{
                  bgcolor: isNavActive("/dashboard")
                    ? "action.hover"
                    : "transparent",
                }}
              >
                <HomeRoundedIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="My Predictor">
              <IconButton
                color={isNavActive("/predictor") ? "primary" : "default"}
                onClick={() => router.push("/predictor")}
                sx={{
                  bgcolor: isNavActive("/predictor")
                    ? "action.hover"
                    : "transparent",
                }}
              >
                <LeaderboardRoundedIcon />
              </IconButton>
            </Tooltip>

            <Tooltip title="Prize Pool">
              <IconButton
                color={isNavActive("/pool-entry") ? "primary" : "default"}
                onClick={() => router.push("/pool-entry")}
                sx={{
                  bgcolor: isNavActive("/pool-entry")
                    ? "action.hover"
                    : "transparent",
                  // Subtle green highlight on the money icon if it's the active route
                  ...(isNavActive("/pool-entry") && { color: "success.main" }),
                }}
              >
                <PaidRoundedIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Show>

        {/* Right Side: Clerk Authentication Engine */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Rendered when the user is logged OUT */}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button
                variant="contained"
                size="small"
                startIcon={<LoginRoundedIcon />}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": { boxShadow: "none" },
                }}
              >
                Log In
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button
                variant="outlined"
                size="small"
                startIcon={<AddIcon />}
                sx={{
                  borderRadius: 2,
                  fontWeight: 700,
                  textTransform: "none",
                  boxShadow: "none",
                  "&:hover": { boxShadow: "none" },
                }}
              >
                Sign Up
              </Button>
            </SignUpButton>
          </Show>

          {/* Rendered when the user is logged IN */}
          <Show when={"signed-in"}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: "50%",
                p: "3px",
                transition: "0.2s",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: { width: 32, height: 32 },
                  },
                }}
              />
            </Box>
          </Show>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
