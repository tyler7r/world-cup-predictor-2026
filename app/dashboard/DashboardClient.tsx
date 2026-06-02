"use client";

import { createLeague, joinLeague } from "@/app/actions/league-actions";
import {
  Add as AddIcon,
  GroupAdd as GroupAddIcon,
  EmojiEventsRounded as TrophyIcon,
  VpnKeyRounded as VpnKeyIcon,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { nanoid } from "nanoid";
import { useState } from "react";
import GroupMatch from "../predictor/components/GroupStageComponents/GroupMatch";
import { Match } from "../predictor/types";
import Leaderboard from "./Leaderboard";
import { LeagueDetails } from "./page";
import PointsBreakdown from "./PointsBreakdown";
import { LeaderboardEntry, PointsBreakdownType } from "./types";

interface DashboardClientProps {
  leagues: LeagueDetails[];
  upcomingMatches: Match[];
  leaderboard: LeaderboardEntry[];
  pointsBreakdown: PointsBreakdownType;
}

export default function DashboardClient({
  leagues,
  upcomingMatches,
  leaderboard,
  pointsBreakdown,
}: DashboardClientProps) {
  const theme = useTheme();

  // Modal Visibility States
  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);

  // Form Data & Error States
  const [pwd, setPwd] = useState(nanoid(6).toUpperCase());
  const [joinError, setJoinError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      setPwd(nanoid(6).toUpperCase()); // Reset password generator for next time
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
      }}
    >
      <PointsBreakdown breakdown={pointsBreakdown} />
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
        <Typography color="text.secondary">
          You have not joined any leagues yet.
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

      <Typography variant="h5" sx={{ fontWeight: "bold", mt: 2 }}>
        Upcoming Matches
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
          gap: { xs: 2, md: 3 },
          mt: 1,
          width: "100%",
        }}
      >
        {upcomingMatches.map((m) => (
          <GroupMatch key={m.api_fixture_id} m={m} />
        ))}
      </Box>

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
                // slotProps={{ input: { sx: { borderRadius: 2 } } }}
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
