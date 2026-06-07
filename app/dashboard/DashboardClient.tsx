"use client";

import { createLeague, joinLeague } from "@/app/actions/league-actions";
import {
  Add as AddIcon,
  GroupAdd as GroupAddIcon,
  EmojiEventsRounded as TrophyIcon,
  VpnKeyRounded as VpnKeyIcon,
} from "@mui/icons-material";
import AccessTimeFilledIcon from "@mui/icons-material/AccessTimeFilled";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import WarningRoundedIcon from "@mui/icons-material/WarningRounded";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  List,
  ListItem,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { nanoid } from "nanoid";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import GroupMatch from "../predictor/components/GroupStageComponents/GroupMatch";
import { Match } from "../predictor/types";
import Leaderboard from "./Leaderboard";
import { LeagueDetails } from "./page";
import PointsBreakdown from "./PointsBreakdown";
import {
  LeaderboardEntry,
  PointsBreakdownType,
  PredictorStatusType,
} from "./types";

interface DashboardClientProps {
  leagues: LeagueDetails[];
  upcomingMatches: Match[];
  leaderboard: LeaderboardEntry[];
  pointsBreakdown: PointsBreakdownType;
  recentMatches: Match[];
  lastUpdated: { matches: string };
  maxAvailableGroupPoints: string;
  predictorStatus: PredictorStatusType;
}

export default function DashboardClient({
  leagues,
  upcomingMatches,
  leaderboard,
  pointsBreakdown,
  recentMatches,
  lastUpdated,
  maxAvailableGroupPoints,
  predictorStatus,
}: DashboardClientProps) {
  const theme = useTheme();
  const router = useRouter();

  // Modal Visibility States
  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);

  // Form Data & Error States
  const [pwd, setPwd] = useState(nanoid(6).toUpperCase());
  const [joinError, setJoinError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Status Bar Dropdown State
  const [showMissing, setShowMissing] = useState(false);

  // Predictor Status Evaluation
  const { isComplete, missing } = useMemo(() => {
    const missingItems: string[] = [];

    if (predictorStatus.groupGames < 72) {
      missingItems.push(
        `Group Stage Matches (${predictorStatus.groupGames}/72)`,
      );
    }
    if (predictorStatus.standings < 12) {
      missingItems.push(`Group Standings (${predictorStatus.standings}/12)`);
    }
    if (predictorStatus.thirdPlace < 8) {
      missingItems.push(
        `3rd Place Advancers (${predictorStatus.thirdPlace}/8)`,
      );
    }

    const expectedKnockouts: Record<string, number> = {
      "Round of 32": 32,
      "Round of 16": 16,
      "Quarter-finals": 8,
      "Semi-finals": 4,
      Final: 2,
      "3rd Place Final": 2,
      "Runner-up": 1,
      Winner: 1,
    };

    for (const [stage, expected] of Object.entries(expectedKnockouts)) {
      const stageData = predictorStatus.knockouts.find(
        (k) => k.stage === stage,
      );
      const count = stageData ? stageData.count : 0;
      if (count < expected) {
        missingItems.push(`Knockouts: ${stage} (${count}/${expected})`);
      }
    }

    const tiebreakersComplete =
      predictorStatus.tiebreakers.predicted_red_cards !== null &&
      predictorStatus.tiebreakers.predicted_yellow_cards !== null &&
      predictorStatus.tiebreakers.predicted_total_goals !== null;

    if (!tiebreakersComplete) {
      missingItems.push("Tiebreakers (Goals, Yellow Cards, Red Cards)");
    }

    return {
      isComplete: missingItems.length === 0,
      missing: missingItems,
    };
  }, [predictorStatus]);

  // World Cup 2026 Kickoff Timer (June 11, 2026 @ 3:00 PM EDT)
  const targetDate = useMemo(
    () => new Date("2026-06-11T15:00:00-04:00").getTime(),
    [],
  );
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

  const handlePwdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPwd(e.target.value.toUpperCase());
  };

  const handleCreateSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setCreateError(null);
    const result = await createLeague(formData);
    setIsSubmitting(false);

    if (!result.success && result.error) {
      setCreateError(result.error);
    } else {
      setOpenCreate(false);
      setPwd(nanoid(6).toUpperCase());
    }
  };

  const handleJoinSubmit = async (formData: FormData) => {
    setIsSubmitting(true);
    setJoinError(null);
    const result = await joinLeague(formData);
    setIsSubmitting(false);

    if (!result.success && result.error) {
      setJoinError(result.error);
    } else {
      setOpenJoin(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        flexDirection: "column",
        width: "100%",
        py: 2,
        pb: 8,
      }}
    >
      <Button
        onClick={() => void router.push("/predictor")}
        endIcon={<ArrowForwardIcon />}
        variant="contained"
        size="large"
        sx={{
          flex: 1,
          py: 1.5,
          fontWeight: 800,
          borderRadius: 2,
          "&:hover": {
            bgcolor: alpha(theme.palette.primary.main, 0.8),
          },
        }}
      >
        Fill out your predictor!
      </Button>

      {/* Predictor Status Bar */}
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 3,
          bgcolor: isComplete
            ? alpha(theme.palette.success.main, 0.05)
            : alpha(theme.palette.warning.main, 0.05),
          borderColor: isComplete ? "success.main" : "warning.main",
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Stack direction="row" spacing={1} sx={{ alignItems: "center" }}>
            {isComplete ? (
              <CheckCircleRoundedIcon color="success" />
            ) : (
              <WarningRoundedIcon color="warning" />
            )}
            <Typography
              variant="body1"
              sx={{
                fontWeight: 800,
                color: isComplete ? "success.main" : "warning.dark",
              }}
            >
              Predictor Status: {isComplete ? "Complete" : "Incomplete"}
            </Typography>
          </Stack>

          <Stack
            direction="row"
            spacing={0.5}
            sx={{
              bgcolor: "background.paper",
              px: 1.5,
              py: 0.5,
              borderRadius: 2,
              border: 1,
              borderColor: "divider",
              alignItems: "center",
            }}
          >
            <AccessTimeFilledIcon
              color="action"
              sx={{ fontSize: 18, color: "text.secondary" }}
            />
            <Typography
              variant="caption"
              sx={{ fontWeight: 800, color: "text.secondary" }}
            >
              LOCKS IN: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m{" "}
              {timeLeft.seconds}s
            </Typography>
          </Stack>
        </Box>

        {!isComplete && (
          <Box>
            <Button
              size="small"
              onClick={() => setShowMissing(!showMissing)}
              endIcon={showMissing ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              sx={{
                color: "warning.dark",
                fontWeight: 700,
                mt: 0.5,
                p: 0,
                minWidth: "auto",
              }}
            >
              View Missing Sections
            </Button>
            <Collapse in={showMissing}>
              <List dense disablePadding sx={{ mt: 1 }}>
                {missing.map((item, idx) => (
                  <ListItem key={idx} disablePadding sx={{ py: 0.25 }}>
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", fontWeight: 600 }}
                    >
                      • {item}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </Box>
        )}
      </Paper>

      <PointsBreakdown
        breakdown={pointsBreakdown}
        lastUpdated={lastUpdated}
        maxAvailableGroupPoints={maxAvailableGroupPoints}
      />
      <Typography variant="h5" sx={{ fontWeight: "bold", mt: 2 }}>
        My Pools
      </Typography>
      <Box component="div" sx={{ display: "flex", gap: 2, mb: 1 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            setCreateError(null);
            setOpenCreate(true);
          }}
          sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
        >
          Create Pool
        </Button>
        <Button
          variant="outlined"
          startIcon={<GroupAddIcon />}
          onClick={() => {
            setJoinError(null);
            setOpenJoin(true);
          }}
          sx={{ fontWeight: 700, px: 3, borderRadius: 2 }}
        >
          Join Pool
        </Button>
      </Box>

      {/* Leagues Grid */}
      {leagues.length === 0 ? (
        <Typography sx={{ color: "text.secondary", px: 1 }}>
          You have not joined any private pools yet.
        </Typography>
      ) : (
        <Grid container size={{ xs: 4, sm: 4, md: 3 }} spacing={2}>
          {leagues.map((league) => (
            <Grid key={league.id}>
              <Card variant="outlined" sx={{ height: "100%", borderRadius: 3 }}>
                <CardActionArea
                  href={`/dashboard/${league.id}`}
                  sx={{ height: "100%" }}
                >
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {league.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ fontWeight: 500, mb: 1 }}
                    >
                      {league.member_count}{" "}
                      {league.member_count === 1 ? "Member" : "Members"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: "primary.main",
                        p: 0.75,
                        px: 1.5,
                        borderRadius: 1.5,
                        fontWeight: 700,
                        display: "inline-block",
                      }}
                    >
                      CODE: {league.invite_code}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <Leaderboard leaderboard={leaderboard} global={true} name={"Global"} />
      {recentMatches.length > 0 && (
        <Box sx={{ display: "flex", width: "100%", flexDirection: "column" }}>
          <Typography variant="h5" sx={{ fontWeight: "bold", mt: 2 }}>
            Recent Matches
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: { xs: 2, md: 3 },
              mt: 1,
              width: "100%",
            }}
          >
            {recentMatches.map((m) => (
              <GroupMatch key={m.api_fixture_id} m={m} />
            ))}
          </Box>
        </Box>
      )}
      {upcomingMatches.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            width: "100%",
          }}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold", mt: 2 }}>
            Upcoming Matches
          </Typography>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: { xs: 2, md: 3 },
              mt: 1,
              width: "100%",
            }}
          >
            {upcomingMatches.map((m) => (
              <GroupMatch key={m.api_fixture_id} m={m} />
            ))}
          </Box>
        </Box>
      ) : (
        <Typography sx={{ color: "text.secondary", px: 1 }}>
          The tournament must be over! Did it come home?
        </Typography>
      )}

      {/* CREATE LEAGUE MODAL */}
      <Dialog
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        slotProps={{
          paper: { sx: { borderRadius: 3, maxWidth: 400, width: "100%" } },
        }}
      >
        <form action={handleCreateSubmit}>
          <DialogTitle
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              borderBottom: 1,
              borderColor: "divider",
              p: 1,
              mb: 2,
            }}
          >
            <Stack spacing={0.5} sx={{ display: "flex", alignItems: "center" }}>
              <TrophyIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Create a League
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ p: 3, pt: 4 }}>
            {createError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {createError}
              </Alert>
            )}
            <Stack
              spacing={3}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
              }}
            >
              <TextField
                autoFocus
                name="leagueName"
                label="League Name"
                placeholder="e.g. Office Pool 2026"
                fullWidth
                required
                variant="outlined"
              />
              <TextField
                name="leaguePwd"
                label="Invite Code (Password)"
                fullWidth
                required
                variant="outlined"
                onChange={handlePwdChange}
                value={pwd}
                helperText="Share this code with friends so they can join."
                slotProps={{
                  input: {
                    sx: {
                      borderRadius: 2,
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      letterSpacing: 2,
                    },
                  },
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button
              onClick={() => {
                setOpenCreate(false);
                setPwd(nanoid(6).toUpperCase());
              }}
              sx={{ fontWeight: 600 }}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ fontWeight: 700, borderRadius: 2, px: 3 }}
            >
              {isSubmitting ? "Creating..." : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* JOIN LEAGUE MODAL */}
      <Dialog
        open={openJoin}
        onClose={() => setOpenJoin(false)}
        slotProps={{
          paper: { sx: { borderRadius: 3, maxWidth: 400, width: "100%" } },
        }}
      >
        <form action={handleJoinSubmit}>
          <DialogTitle
            sx={{
              bgcolor: alpha(theme.palette.primary.main, 0.04),
              borderBottom: 1,
              borderColor: "divider",
              p: 1,
              mb: 2,
            }}
          >
            <Stack sx={{ display: "flex", alignItems: "center" }} spacing={0.5}>
              <VpnKeyIcon color="primary" />
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                Join a Predictor Pool
              </Typography>
            </Stack>
          </DialogTitle>
          <DialogContent sx={{ p: 3, pt: 2 }}>
            {joinError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {joinError}
              </Alert>
            )}
            <TextField
              autoFocus
              name="inviteCode"
              label="Invite Code"
              placeholder="Enter invite code"
              fullWidth
              required
              variant="outlined"
              slotProps={{
                input: {
                  sx: {
                    borderRadius: 2,
                    fontFamily: "monospace",
                    fontWeight: "bold",
                    letterSpacing: 2,
                    textTransform: "uppercase",
                  },
                },
              }}
            />
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 0 }}>
            <Button onClick={() => setOpenJoin(false)} sx={{ fontWeight: 600 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{ fontWeight: 700, borderRadius: 2, px: 3 }}
            >
              {isSubmitting ? "Joining..." : "Join League"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
