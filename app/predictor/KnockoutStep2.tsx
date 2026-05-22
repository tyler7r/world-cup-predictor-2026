import { Avatar, Box, Button, Grid, Paper, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import ReferenceBracket from "./ReferenceBracket";
import { KnockoutData, StandingPredictions, Team } from "./types";

interface KnockoutStepProps {
  allTeams: Team[];
  standings: StandingPredictions[];
  selectedThirdPlaceIds: number[];
  onComplete: () => void;
  initialKnockouts: KnockoutData;
  picks: KnockoutData;
  onChange: (picks: KnockoutData) => void;
}

export default function KnockoutStep2({
  allTeams,
  standings,
  selectedThirdPlaceIds,
  onComplete,
  picks,
  onChange,
}: KnockoutStepProps) {
  const [subStep, setSubStep] = useState(0); // 0: R16, 1: QF, 2: SF, 3: Final, 4: Winner/Runner-up

  // 2. Build the Starting Pool of 32 (Round of 32)
  const roundOf32Pool = useMemo(() => {
    const pool: { team: Team; label: string }[] = [];

    standings.forEach((s) => {
      const winner = allTeams.find((t) => t.id === s.w_id);
      const runner = allTeams.find((t) => t.id === s.r_id);
      const third = allTeams.find((t) => t.id === s.t_id);

      if (winner)
        pool.push({ team: winner, label: `Winner Group ${s.group_name}` });
      if (runner)
        pool.push({ team: runner, label: `Runner-up Group ${s.group_name}` });
      if (third && selectedThirdPlaceIds.includes(third.id)) {
        pool.push({ team: third, label: `3rd Place Group ${s.group_name}` });
      }
    });
    return pool;
  }, [standings, allTeams, selectedThirdPlaceIds]);

  // 3. Determine which pool to show based on sub-step
  const currentPool = useMemo(() => {
    if (subStep === 0) return roundOf32Pool;
    if (subStep === 1)
      return roundOf32Pool.filter((p) => picks.r16.includes(p.team.id));
    if (subStep === 2)
      return roundOf32Pool.filter((p) => picks.qf.includes(p.team.id));
    if (subStep === 3)
      return roundOf32Pool.filter((p) => picks.sf.includes(p.team.id));
    if (subStep === 4)
      return roundOf32Pool.filter((p) => picks.final.includes(p.team.id));
    return [];
  }, [subStep, roundOf32Pool, picks]);

  const capacities = [16, 8, 4, 2, 1];

  const currentSelections: number[] = useMemo(() => {
    if (subStep === 0) return picks.r16;
    if (subStep === 1) return picks.qf;
    if (subStep === 2) return picks.sf;
    if (subStep === 3) return picks.final;
    if (subStep === 4) return picks.champion !== null ? [picks.champion] : [];
    return [];
  }, [subStep, picks]);

  const handleToggle = (id: number) => {
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
          copy = {
            ...copy,
            r16: copy.r16.filter((i) => i !== teamId),
          };
        } else if (i == 1) {
          copy = {
            ...copy,
            qf: copy.qf.filter((i) => i !== teamId),
          };
        } else if (i == 2) {
          copy = {
            ...copy,
            sf: copy.sf.filter((i) => i !== teamId),
          };
        } else if (i == 3) {
          copy = {
            ...copy,
            final: copy.final.filter((i) => i !== teamId),
          };
        } else if (i == 4) {
          copy = {
            ...copy,
            thirdPlaceMatch: copy.thirdPlaceMatch.filter((i) => i !== teamId),
          };
        } else if (i == 5) {
          copy = {
            ...copy,
            champion: picksObj.champion === teamId ? null : picksObj.champion,
          };
        } else if (i == 6) {
          copy = {
            ...copy,
            runnerUp:
              picksObj.runnerUp === teamId ? undefined : picksObj.runnerUp,
          };
        }
      }

      return copy;
    };

    if (subStep === 0) {
      if (picks.r16.includes(id)) {
        newPicks = removeTeamFromAllTiers(newPicks, id, 0); // Cascade removal
      } else if (picks.r16.length < capacities[0]) {
        newPicks.r16 = [...picks.r16, id];
      }
    } else if (subStep === 1) {
      if (picks.qf.includes(id)) {
        newPicks = removeTeamFromAllTiers(newPicks, id, 1); // Cascade removal
      } else if (picks.qf.length < capacities[1]) {
        newPicks.qf = [...picks.qf, id];
      }
    } else if (subStep === 2) {
      if (picks.sf.includes(id)) {
        newPicks = removeTeamFromAllTiers(newPicks, id, 2); // Cascade removal
      } else if (picks.sf.length < capacities[2]) {
        newPicks.sf = [...picks.sf, id];
      }
    } else if (subStep === 3) {
      if (picks.final.includes(id)) {
        newPicks = removeTeamFromAllTiers(newPicks, id, 3); // Cascade removal
      } else if (picks.final.length < capacities[3]) {
        newPicks.final = [...picks.final, id];
      }
      // Recalculate 3rd place match based on the NEW sf and final arrays
      newPicks.thirdPlaceMatch = newPicks.sf.filter(
        (sfId) => !newPicks.final.includes(sfId),
      );
    } else if (subStep === 4) {
      if (picks.champion === id) {
        newPicks.champion = null;
        newPicks.runnerUp = undefined;
      } else {
        newPicks.champion = id;
        newPicks.runnerUp = newPicks.final.find((fId) => fId !== id);
      }
    }

    // Push the clean object up to the parent
    onChange(newPicks);
  };

  const handleNext = () => {
    if (subStep < 4) {
      setSubStep(subStep + 1);
    } else {
      onComplete();
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Knockout Stage:{" "}
        {
          [
            "Round of 16",
            "Quarter-finals",
            "Semi-finals",
            "The Final",
            "Champion",
          ][subStep]
        }
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Select <b>{capacities[subStep]}</b> teams to advance. (
        {currentSelections.length} / {capacities[subStep]})
      </Typography>

      <Grid container spacing={2}>
        {currentPool.map(({ team, label }) => {
          const isSelected = currentSelections.includes(team.id);
          return (
            <Grid size={{ xs: 4, sm: 3 }} key={team.id}>
              <Paper
                component={Button}
                onClick={() => handleToggle(team.id)}
                variant="outlined"
                sx={{
                  p: 2,
                  width: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderColor: isSelected ? "primary.main" : "divider",
                  bgcolor: isSelected ? "action.selected" : "background.paper",
                  textTransform: "none",
                }}
              >
                <Avatar
                  src={team.flag_url}
                  variant="rounded"
                  sx={{
                    width: 48,
                    height: 32,
                    mb: 1,
                    border: "1px solid #eee",
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{ fontWeight: "bold", textAlign: "center" }}
                  noWrap
                >
                  {team.name}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ fontSize: "0.65rem" }}
                >
                  {label}
                </Typography>
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      <ReferenceBracket
        currentStage={
          ["Round of 16", "Quarter-finals", "Semi-finals", "Final", "Champion"][
            subStep
          ]
        }
      />

      <Box sx={{ mt: 4, display: "flex", justifyContent: "space-between" }}>
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
          {subStep === 4 ? "Review & Save" : "Confirm Picks"}
        </Button>
      </Box>
    </Box>
  );
}
