"use client";

import { KnockoutStageName } from "@/app/dashboard/types";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PendingRoundedIcon from "@mui/icons-material/PendingRounded";
import {
  Avatar,
  Box,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useMemo, useState } from "react";
import {
  ActualKnockoutTeams,
  KnockoutData,
  StandingPredictions,
  Team,
} from "../types";

interface LockedKnockoutStepProps {
  allTeams: Team[];
  standings: StandingPredictions[];
  selectedThirdPlaceIds: number[];
  initialKnockouts: KnockoutData;
  picks: KnockoutData;
  actualKnockoutTeams: ActualKnockoutTeams[];
  actualEliminatedTeamIds: number[];
  pointsEarned: Record<KnockoutStageName, number>;
}

const STAGES = [
  {
    label: "R32",
    abrv: "R32",
    targetStage: "Round of 32",
    score: 1,
    number: 0,
  },
  {
    label: "R16",
    abrv: "R16",
    targetStage: "Round of 16",
    score: 2,
    number: 1,
  },
  {
    label: "Quarter-finals",
    abrv: "QF",
    targetStage: "Quarter-finals",
    score: 3,
    number: 2,
  },
  {
    label: "Semi-finals",
    abrv: "SF",
    targetStage: "Semi-finals",
    score: 4,
    number: 3,
  },
  {
    label: "Finals & 3rd Place",
    abrv: "Finals",
    targetStage: "Mixed",
    score: 3,
    number: 4,
  },
  {
    label: "Champion",
    abrv: "Champ",
    targetStage: "Champion",
    score: 7,
    number: 5,
  },
];

export default function LockedKnockoutStep({
  allTeams,
  standings,
  selectedThirdPlaceIds,
  picks,
  actualKnockoutTeams,
  pointsEarned,
}: LockedKnockoutStepProps) {
  const [activeTab, setActiveTab] = useState(0);
  const theme = useTheme();

  // 1. Build the pool of 32
  const roundOf32Pool = useMemo(() => {
    const pool: { team: Team; label: string }[] = [];
    standings.forEach((s) => {
      const winner = allTeams.find((t) => t.id === s.w_id);
      const runner = allTeams.find((t) => t.id === s.r_id);
      const third = allTeams.find((t) => t.id === s.t_id);

      if (winner) pool.push({ team: winner, label: `1${s.group_name}` });
      if (runner) pool.push({ team: runner, label: `2${s.group_name}` });
      if (third && selectedThirdPlaceIds.includes(third.id)) {
        pool.push({ team: third, label: `3${s.group_name}` });
      }
    });
    return pool;
  }, [standings, allTeams, selectedThirdPlaceIds]);

  // 2. Map actual real-world matches by stage
  const actualTeamsByStage = useMemo(() => {
    const getTeamsForStage = (stageName: string) => {
      return [
        ...actualKnockoutTeams
          .filter((t) => t.stage === stageName)
          .map((t) => t.home_team_id),
        ...actualKnockoutTeams
          .filter((t) => t.stage === stageName)
          .map((t) => t.away_team_id),
      ].filter((id): id is number => id !== null);
    };

    const finalMatch = actualKnockoutTeams.find((t) => t.stage === "Final");
    const championId =
      finalMatch?.status === "Match Finished"
        ? finalMatch.winner_team_id
        : null;

    return {
      "Round of 32": getTeamsForStage("Round of 32"),
      "Round of 16": getTeamsForStage("Round of 16"),
      "Quarter-finals": getTeamsForStage("Quarter-finals"),
      "Semi-finals": getTeamsForStage("Semi-finals"),
      Final: getTeamsForStage("Final"),
      "3rd Place Final": getTeamsForStage("3rd Place Final"),
      Champion: championId ? [championId] : [],
    };
  }, [actualKnockoutTeams]);

  // 3. Status Evaluator
  const getPickStatus = (
    teamId: number,
    targetStage: string,
  ): "correct" | "incorrect" | "pending" => {
    // Explicit sizing map to prevent array lookup errors during multi-stage layouts
    const STAGE_SIZES: Record<string, number> = {
      "Round of 32": 32,
      "Round of 16": 16,
      "Quarter-finals": 8,
      "Semi-finals": 4,
      Final: 2,
      "3rd Place Final": 2,
      Champion: 1,
    };

    const actualTeams =
      actualTeamsByStage[targetStage as keyof typeof actualTeamsByStage] || [];
    const expectedSize = STAGE_SIZES[targetStage] || 0;

    // A. CASE: The stage has been completely filled/concluded in reality
    if (actualTeams.length === expectedSize) {
      return actualTeams.includes(teamId) ? "correct" : "incorrect";
    }

    // Rule 2: If picked for Final or Champ, but lost in the Semi-finals
    if (targetStage === "Final" || targetStage === "Champion") {
      const sfLosers = actualKnockoutTeams
        .filter(
          (m) => m.stage === "Semi-finals" && m.status === "Match Finished",
        )
        .map((m) => m.loser_team_id);
      if (sfLosers.includes(teamId)) return "incorrect";
    }

    // Rule 3: If picked to be Champion, but lost the Final
    if (targetStage === "Champion") {
      const finalLosers = actualKnockoutTeams
        .filter((m) => m.stage === "Final" && m.status === "Match Finished")
        .map((m) => m.loser_team_id);
      if (finalLosers.includes(teamId)) return "incorrect";
    }

    // Rule 4: If picked for 3rd Place Match, but won their Semi-final (advancing to the main Final)
    if (targetStage === "3rd Place Final") {
      const sfWinners = actualKnockoutTeams
        .filter(
          (m) => m.stage === "Semi-finals" && m.status === "Match Finished",
        )
        .map((m) => m.winner_team_id);
      if (sfWinners.includes(teamId)) return "incorrect";
    }

    return "pending";
  };

  // 4. Render Helper for the Grids
  const renderGrid = (
    teamIds: number[],
    targetStage: string,
    score: number,
  ) => {
    const picksToRender = roundOf32Pool.filter((p) =>
      teamIds.includes(p.team.id),
    );
    const pointsE =
      targetStage === "Champion"
        ? pointsEarned["Winner" as keyof typeof pointsEarned]
        : pointsEarned[targetStage as keyof typeof pointsEarned];

    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <Box sx={{ px: 2, display: "flex", justifyContent: "flex-start" }}>
          <Typography
            variant="body1"
            sx={{
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              border: 1,
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.3),
              px: 2,
              py: 0.75,
              borderRadius: 2,
              fontWeight: 700,
              letterSpacing: 0.5,
            }}
          >
            POINTS EARNED: {pointsE}
          </Typography>
        </Box>
        <Grid container spacing={2} sx={{ px: 2, pb: 2 }}>
          {picksToRender.map(({ team, label }) => {
            const status = getPickStatus(team.id, targetStage);
            const isCorrect = status === "correct";
            const isIncorrect = status === "incorrect";
            const borderColor = isCorrect
              ? "success.main"
              : isIncorrect
                ? "error.main"
                : "divider";
            const bgColor = isCorrect
              ? alpha(theme.palette.success.main, 0.05)
              : isIncorrect
                ? alpha(theme.palette.error.main, 0.05)
                : "background.paper";
            return (
              <Grid size={{ xs: 6, sm: 4, md: 3 }} key={team.id}>
                <Paper
                  variant="outlined"
                  sx={{
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderColor: borderColor,
                    bgcolor: bgColor,
                    position: "relative",
                    overflow: "hidden",
                    transition: "0.2s",
                    borderWidth: isCorrect || isIncorrect ? 2 : 1,
                    opacity: isIncorrect ? 0.7 : 1,
                  }}
                >
                  <Box sx={{ position: "absolute", top: 4, right: 8 }}>
                    {isCorrect && (
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        <CheckCircleRoundedIcon
                          color="success"
                          sx={{ fontSize: 18 }}
                        />
                        <Typography
                          variant="caption"
                          sx={{ fontWeight: "bold", color: "text.secondary" }}
                        >
                          +{score}
                        </Typography>
                      </Box>
                    )}
                    {isIncorrect && (
                      <CancelRoundedIcon color="error" sx={{ fontSize: 18 }} />
                    )}
                    {status === "pending" && (
                      <PendingRoundedIcon
                        color="disabled"
                        sx={{ fontSize: 18, opacity: 0.5 }}
                      />
                    )}
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      justifyContent: "center",
                      alignItems: "center",
                      p: 1,
                      gap: 1,
                      mr: 2,
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
                        textDecoration: isIncorrect ? "line-through" : "none",
                      }}
                    >
                      {team.name_code}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      bgcolor: isCorrect
                        ? alpha(theme.palette.success.main, 0.1)
                        : isIncorrect
                          ? alpha(theme.palette.error.main, 0.1)
                          : theme.palette.divider,
                      width: "100%",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      py: 0.75,
                    }}
                  >
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        display: "flex",
                        gap: 1,
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
      </Box>
    );
  };

  // Determine current active team IDs based on standard tabs
  const activeStandardTeamIds = useMemo(() => {
    if (activeTab === 0) return roundOf32Pool.map((p) => p.team.id);
    if (activeTab === 1) return picks.r16.map((p) => p.id);
    if (activeTab === 2) return picks.qf.map((p) => p.id);
    if (activeTab === 3) return picks.sf.map((p) => p.id);
    if (activeTab === 5) return picks.champion?.id ? [picks.champion.id] : [];
    return [];
  }, [activeTab, roundOf32Pool, picks]);

  return (
    <Box
      sx={{
        width: "100%",
        bgcolor: "background.default",
        borderRadius: 3,
      }}
    >
      <Tabs
        value={activeTab}
        onChange={(_, newValue) => setActiveTab(newValue)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 2,
          "& .MuiTab-root": { fontWeight: 700, textTransform: "none" },
        }}
      >
        {STAGES.map((stage) => (
          <Tab key={stage.abrv} label={stage.label} />
        ))}
      </Tabs>

      {/* Render Split-View for Finals & 3rd Place */}
      {activeTab === 4 ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontWeight: 800, mb: 1, display: "block", px: 2 }}
            >
              Predicted Finalists
            </Typography>
            {renderGrid(
              picks.final.map((p) => p.id),
              "Final",
              5,
            )}
          </Box>
          <Box>
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ fontWeight: 800, mb: 1, px: 2, display: "block" }}
            >
              Predicted 3rd Place Match
            </Typography>
            {renderGrid(
              picks.sf
                .filter((sf) => !picks.final.find((f) => f.id === sf.id))
                .map((p) => p.id),
              "3rd Place Final",
              3,
            )}
          </Box>
        </Box>
      ) : (
        /* Render Standard View for other tabs */
        renderGrid(
          activeStandardTeamIds,
          STAGES[activeTab].targetStage,
          STAGES[activeTab].score,
        )
      )}
    </Box>
  );
}
