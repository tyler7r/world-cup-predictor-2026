"use client";

import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import {
  Alert,
  alpha,
  Avatar,
  Box,
  Button,
  Grid,
  Paper,
  Typography,
  useTheme,
} from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { KnockoutData, StandingPredictions, Team } from "../types";
import ReferenceBracket from "./ReferenceBracket";

interface KnockoutStepProps {
  allTeams: Team[];
  standings: StandingPredictions[];
  selectedThirdPlaceIds: number[];
  onComplete: (moveToTiebreakers: boolean) => Promise<string | undefined>;
  initialKnockouts: KnockoutData;
  picks: KnockoutData;
  onChange: (picks: KnockoutData) => void;
}

export default function KnockoutStep({
  allTeams,
  standings,
  selectedThirdPlaceIds,
  onComplete,
  picks,
  onChange,
}: KnockoutStepProps) {
  const theme = useTheme();
  const [subStep, setSubStep] = useState(0); // 0: R16, 1: QF, 2: SF, 3: Final, 4: Winner/Runner-up

  // 2. Created a reference anchor for the top of the component
  const topAnchorRef = useRef<HTMLDivElement>(null);

  // 3. Automatically execute smooth scroll whenever subStep changes
  useEffect(() => {
    if (topAnchorRef.current) {
      topAnchorRef.current.scrollTo({
        behavior: "smooth",
      });
    }
  }, [subStep]);

  // 1. Build the Starting Pool of 32 (Round of 32)
  const roundOf32Pool = useMemo(() => {
    const pool: { team: Team; label: string }[] = [];

    standings.forEach((s) => {
      const winner = allTeams.find((t) => t.id === s.w_id);
      const runner = allTeams.find((t) => t.id === s.r_id);
      const third = allTeams.find((t) => t.id === s.t_id);

      if (winner) pool.push({ team: winner, label: `Winner ${s.group_name}` });
      if (runner)
        pool.push({ team: runner, label: `Runner-up ${s.group_name}` });
      if (third && selectedThirdPlaceIds.includes(third.id)) {
        pool.push({ team: third, label: `3rd Place ${s.group_name}` });
      }
    });
    return pool;
  }, [standings, allTeams, selectedThirdPlaceIds]);

  // 2. Determine which pool to show based on sub-step (Using object-matching via .some)
  const currentPool = useMemo(() => {
    if (subStep === 0) return roundOf32Pool;
    if (subStep === 1)
      return roundOf32Pool.filter((p) =>
        picks.r16.some((t) => t.id === p.team.id),
      );
    if (subStep === 2)
      return roundOf32Pool.filter((p) =>
        picks.qf.some((t) => t.id === p.team.id),
      );
    if (subStep === 3)
      return roundOf32Pool.filter((p) =>
        picks.sf.some((t) => t.id === p.team.id),
      );
    if (subStep === 4)
      return roundOf32Pool.filter((p) =>
        picks.final.some((t) => t.id === p.team.id),
      );
    return [];
  }, [subStep, roundOf32Pool, picks]);

  const capacities = [16, 8, 4, 2, 1];

  // 3. Map selected team IDs for checking visual active/selected state in UI
  const currentSelections: number[] = useMemo(() => {
    if (subStep === 0) return picks.r16.map((p) => p.id);
    if (subStep === 1) return picks.qf.map((p) => p.id);
    if (subStep === 2) return picks.sf.map((p) => p.id);
    if (subStep === 3) return picks.final.map((p) => p.id);
    if (subStep === 4) return picks.champion?.id ? [picks.champion.id] : [];
    return [];
  }, [subStep, picks]);

  const handleToggle = (team: Team) => {
    const id = team.id;
    let newPicks = { ...picks };

    // Helper: If a team loses in an early round, they cannot exist in later rounds.
    const removeTeamFromAllTiers = (
      picksObj: typeof picks,
      teamId: number,
      cascade: number,
    ) => {
      let copy = { ...picksObj };

      for (let i = cascade; i < 7; i++) {
        if (i == 0) {
          copy = { ...copy, r16: copy.r16.filter((t) => t.id !== teamId) };
        } else if (i == 1) {
          copy = { ...copy, qf: copy.qf.filter((t) => t.id !== teamId) };
        } else if (i == 2) {
          copy = { ...copy, sf: copy.sf.filter((t) => t.id !== teamId) };
        } else if (i == 3) {
          copy = { ...copy, final: copy.final.filter((t) => t.id !== teamId) };
        } else if (i == 4) {
          copy = {
            ...copy,
            thirdPlaceMatch: copy.thirdPlaceMatch.filter(
              (t) => t.id !== teamId,
            ),
          };
        } else if (i == 5) {
          copy = {
            ...copy,
            champion:
              picksObj.champion?.id === teamId ? null : picksObj.champion,
          };
        } else if (i == 6) {
          copy = {
            ...copy,
            runnerUp:
              picksObj.runnerUp?.id === teamId ? undefined : picksObj.runnerUp,
          };
        }
      }

      return copy;
    };

    if (subStep === 0) {
      if (picks.r16.some((t) => t.id === id)) {
        newPicks = removeTeamFromAllTiers(newPicks, id, 0); // Cascade removal
      } else if (picks.r16.length < capacities[0]) {
        newPicks.r16 = [...picks.r16, team];
      }
    } else if (subStep === 1) {
      if (picks.qf.some((t) => t.id === id)) {
        newPicks = removeTeamFromAllTiers(newPicks, id, 1);
      } else if (picks.qf.length < capacities[1]) {
        newPicks.qf = [...picks.qf, team];
      }
    } else if (subStep === 2) {
      if (picks.sf.some((t) => t.id === id)) {
        newPicks = removeTeamFromAllTiers(newPicks, id, 2);
      } else if (picks.sf.length < capacities[2]) {
        newPicks.sf = [...picks.sf, team];
      }
    } else if (subStep === 3) {
      if (picks.final.some((t) => t.id === id)) {
        newPicks = removeTeamFromAllTiers(newPicks, id, 3);
      } else if (picks.final.length < capacities[3]) {
        newPicks.final = [...picks.final, team];
      }

      // Recalculate 3rd place match by finding SF teams that are NOT in the Final array
      newPicks.thirdPlaceMatch = newPicks.sf.filter(
        (sfTeam) => !newPicks.final.some((fTeam) => fTeam.id === sfTeam.id),
      );
    } else if (subStep === 4) {
      if (picks.champion?.id === id) {
        newPicks.champion = null;
        newPicks.runnerUp = undefined;
      } else {
        newPicks.champion = team;
        newPicks.runnerUp = newPicks.final.find((fTeam) => fTeam.id !== id);
      }
    }

    // Push the clean object up to the parent
    onChange(newPicks);
  };

  const handleNext = async () => {
    if (subStep < 4) {
      const checkDatabase = await onComplete(false);
      if (checkDatabase === "Advance") setSubStep(subStep + 1);
    } else {
      onComplete(true);
    }
  };

  const roundScoreMatrix = [
    {
      round: "Round of 32",
      description: "Each correct pick is worth 2 points.",
      abrv: "R32",
    },
    {
      round: "Round of 16",
      description: "Each correct pick is worth 3 points.",
      abrv: "R16",
    },
    {
      round: "Quarter-finals",
      description: "Each correct pick is worth 4 points.",
      abrv: "QF",
    },
    {
      round: "Semi-finals",
      description:
        "Each correct finalist pick is worth 5 points. Each third-place play-off team correctly picked earns 3 points.",
      abrv: "SF",
    },
    {
      round: "Final",
      description:
        "Correctly picked winner is worth 7 points. Correctly picked runner-up is worth 3 points.",
      abrv: "Final",
    },
    { round: "Champion", description: "", nextRoundAbrv: "" },
  ];

  const picksLeft = capacities[subStep] - currentSelections.length;

  return (
    <Box ref={topAnchorRef} sx={{ p: 2 }}>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ fontWeight: "bold" }}
        color="primary"
      >
        {roundScoreMatrix[subStep].round}
      </Typography>

      <Box sx={{ px: 1 }}>
        {subStep === 4 ? (
          <Typography variant="body2" color="text.secondary">
            Select your 2026 World Cup Winner, the unselected team will be your
            Runner-up.
          </Typography>
        ) : subStep === 3 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Select your two finalists, the two unselected teams will be your
              third-place play-off prediction. <br />
            </Typography>
            <Typography
              variant="caption"
              sx={{
                bgcolor: (theme) =>
                  picksLeft > 0
                    ? alpha(theme.palette.error.main, 0.1)
                    : alpha(theme.palette.success.main, 0.1),
                color: picksLeft > 0 ? "error.main" : "success.main",
                px: 2,
                py: 0.75,
                borderRadius: 2,
                fontWeight: 600,
                letterSpacing: 0.5,
                mt: 2,
              }}
            >
              {picksLeft > 0
                ? `${picksLeft} PICKS LEFT`
                : `${roundScoreMatrix[subStep].abrv} COMPLETE`}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 1,
              alignItems: "flex-start",
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Select <b>{capacities[subStep]}</b> teams to advance to the{" "}
              {roundScoreMatrix[subStep + 1].round}. <br />
            </Typography>
            <Typography
              variant="caption"
              sx={{
                bgcolor: (theme) =>
                  picksLeft > 0
                    ? alpha(theme.palette.error.main, 0.1)
                    : alpha(theme.palette.success.main, 0.1),
                color: picksLeft > 0 ? "error.main" : "success.main",
                px: 2,
                py: 0.75,
                borderRadius: 2,
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              {picksLeft > 0
                ? `${picksLeft} PICKS LEFT`
                : `${roundScoreMatrix[subStep].abrv} COMPLETE`}
            </Typography>
          </Box>
        )}
      </Box>
      <Alert sx={{ mx: 1, my: 2 }} variant="outlined" severity="info">
        {roundScoreMatrix[subStep].description}
      </Alert>

      {subStep < 4 && (
        <ReferenceBracket currentStage={roundScoreMatrix[subStep].round} />
      )}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {currentPool.map(({ team, label }) => {
          const isSelected = currentSelections.includes(team.id);

          const borderColor = isSelected ? "success.main" : "divider";
          const bgColor = isSelected
            ? alpha(theme.palette.success.main, 0.05)
            : "background.paper";

          return (
            <Grid size={{ xs: 6, sm: 4, md: 3 }} key={team.id}>
              <Paper
                onClick={() => handleToggle(team)}
                variant="outlined"
                sx={{
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  borderColor: borderColor,
                  bgcolor: bgColor,
                  position: "relative",
                  overflow: "hidden",
                  transition: "0.2s",
                  borderWidth: isSelected ? 2 : 1,
                  opacity: 1,
                  textTransform: "none",
                  height: "100%",
                  cursor: "pointer",
                }}
              >
                <Box sx={{ position: "absolute", top: 4, right: 8 }}>
                  {isSelected ? (
                    <CheckCircleRoundedIcon
                      color="success"
                      sx={{ fontSize: 18 }}
                    />
                  ) : (
                    <CheckCircleRoundedIcon
                      color="disabled"
                      sx={{ fontSize: 18 }}
                    />
                  )}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    p: 1,
                    gap: 0.5,
                    height: "100%",
                  }}
                >
                  <Avatar
                    src={team.flag_url}
                    variant="rounded"
                    sx={{ width: 48, height: 32, boxShadow: 1 }}
                  />
                  <Typography
                    variant="body1"
                    sx={{
                      fontWeight: 800,
                      textAlign: "center",
                    }}
                  >
                    {team.name}
                  </Typography>
                </Box>

                <Box
                  sx={{
                    bgcolor: isSelected
                      ? alpha(theme.palette.success.main, 0.1)
                      : theme.palette.divider,
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    py: 0.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.7rem",
                      display: "flex",
                      gap: 0.75,
                    }}
                  >
                    <span>{label}</span>
                    <span>•</span>
                    <span>Rank #{team.rank}</span>
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
      <Typography
        variant="caption"
        sx={{
          bgcolor: (theme) =>
            picksLeft > 0
              ? alpha(theme.palette.error.main, 0.1)
              : alpha(theme.palette.success.main, 0.1),
          color: picksLeft > 0 ? "error.main" : "success.main",
          px: 2,
          py: 0.75,
          borderRadius: 2,
          fontWeight: 600,
          letterSpacing: 0.5,
        }}
      >
        {picksLeft > 0
          ? `${picksLeft} PICKS LEFT`
          : `${roundScoreMatrix[subStep].abrv} COMPLETE`}
      </Typography>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}>
        <Button
          disabled={subStep === 0}
          onClick={() => setSubStep(subStep - 1)}
        >
          Back Tier
        </Button>
        <Button
          variant="contained"
          disabled={currentSelections.length !== capacities[subStep]}
          onClick={handleNext}
        >
          {`Confirm ${roundScoreMatrix[subStep].abrv} Picks`}
        </Button>
      </Box>
    </Box>
  );
}
