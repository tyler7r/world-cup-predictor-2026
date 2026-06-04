"use client";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Alert,
  alpha,
  Box,
  Button,
  Collapse,
  Container,
  Paper,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { pruneGhostPicks } from "../helpers";
import {
  ActualStandingsType,
  KnockoutData,
  Match,
  StandingPredictions,
  Team,
  Tiebreakers,
} from "../types"; // <-- ADD 'Team'
import GroupStageStep from "./GroupStageComponents/GroupStageStep";
import KnockoutStep from "./KnockoutStep";
import ThirdPlaceStep from "./ThirdPlaceStep";
import TieBreakerStep, { TieBreakerData } from "./Tiebreaker";

const steps = ["Group Stage", "Third Place", "Knockouts", "Tie-Breakers"];

// Added allTeams to props since the Knockout bracket needs the team logos and names
type PredictorPageProps = {
  initialMatches: Match[];
  initialStandings: StandingPredictions[];
  initialThirdPlaces: number[];
  allTeams: Team[]; // <-- NEW PROP
  userId: string | null;
  initialKnockouts: KnockoutData;
  actualStandings: ActualStandingsType[];
  initialTiebreakers: Tiebreakers;
  isLocked: boolean;
};

export default function PredictorPage({
  initialMatches,
  initialStandings,
  allTeams, // <-- NEW PROP
  userId,
  initialKnockouts,
  initialThirdPlaces,
  actualStandings,
  initialTiebreakers,
  isLocked,
}: PredictorPageProps) {
  const router = useRouter();

  const [activeStep, setActiveStep] = useState(0);
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  const [matches, setMatches] = useState<Match[]>(initialMatches);

  const [standings, setStandings] =
    useState<StandingPredictions[]>(initialStandings);
  const [advancingThirdPlaceIds, setAdvancingThirdPlaceIds] =
    useState<number[]>(initialThirdPlaces);
  const [tieBreakers, setTieBreakers] = useState<TieBreakerData>({
    totalGoals: initialTiebreakers.predicted_total_goals ?? "",
    totalYellowCards: initialTiebreakers.predicted_yellow_cards ?? "",
    totalRedCards: initialTiebreakers.predicted_red_cards ?? "",
  });

  // --- NEW: Knockout State ---
  const [knockoutPicks, setKnockoutPicks] = useState<KnockoutData>({
    r16: initialKnockouts?.r16 || [],
    qf: initialKnockouts?.qf || [],
    sf: initialKnockouts?.sf || [],
    final: initialKnockouts?.final || [],
    champion: initialKnockouts?.champion || null,
    runnerUp: initialKnockouts?.runnerUp || undefined,
    thirdPlaceMatch: initialKnockouts?.thirdPlaceMatch || [],
  });

  const poolWinners = standings.map((m) => m.w_id);
  const poolRunnersup = standings.map((m) => m.r_id);
  const allR32Teams = [
    ...poolWinners,
    ...poolRunnersup,
    ...advancingThirdPlaceIds,
  ];

  const handleToggleThirdPlace = async (teamId: number) => {
    setAdvancingThirdPlaceIds((prev) =>
      prev.includes(teamId)
        ? prev.filter((id) => id !== teamId)
        : [...prev, teamId],
    );
  };

  const handleScoreUpdate = (
    matchId: number,
    team: "home" | "away",
    score: number,
  ) => {
    setMatches((prev) =>
      prev.map((m) =>
        m.api_fixture_id === matchId
          ? {
              ...m,
              [team === "home"
                ? "home_goals_predicted"
                : "away_goals_predicted"]: score,
            }
          : m,
      ),
    );
  };

  const handleStandingSave = (
    groupName: string,
    rank: "winner" | "runnerUp" | "third",
    teamId: number,
    teamName: string,
    teamFlag: string,
  ) => {
    // 1. Calculate the next standings array immediately
    const existingIndex = standings.findIndex(
      (s) => s.group_name === groupName,
    );
    const newStandings = [...standings];

    const current =
      existingIndex >= 0
        ? newStandings[existingIndex]
        : ({ group_name: groupName } as StandingPredictions);
    const updated = { ...current };

    if (rank === "winner") {
      updated.w_id = teamId;
      updated.w_name = teamName;
      updated.w_flag = teamFlag;
    } else if (rank === "runnerUp") {
      updated.r_id = teamId;
      updated.r_name = teamName;
      updated.r_flag = teamFlag;
    } else if (rank === "third") {
      updated.t_id = teamId;
      updated.t_name = teamName;
      updated.t_flag = teamFlag;
    }

    if (existingIndex >= 0) {
      newStandings[existingIndex] = updated;
    } else {
      newStandings.push(updated);
    }

    // 2. Prune advancing third-place choices
    // Collect all currently valid 3rd-place IDs across all groups
    const allowedThirdPlaceIds = newStandings
      .map((s) => s.t_id)
      .filter((id): id is number => id !== undefined && id !== null);

    // If a team was in your wild-card pool but is no longer ranked 3rd in their group, drop them
    const newAdvancingThirdPlaceIds = advancingThirdPlaceIds.filter((id) =>
      allowedThirdPlaceIds.includes(id),
    );

    // 3. Prune subsequent knockout brackets using the updated helper function
    const newKnockoutPicks = pruneGhostPicks(
      knockoutPicks,
      newStandings,
      newAdvancingThirdPlaceIds,
    );

    // 4. Batch updates cleanly to prevent state desyncs
    setStandings(newStandings);
    setAdvancingThirdPlaceIds(newAdvancingThirdPlaceIds);
    setKnockoutPicks(newKnockoutPicks);
  };

  const isGroupStageComplete = () => {
    const groupLetters = [
      "A",
      "B",
      "C",
      "D",
      "E",
      "F",
      "G",
      "H",
      "I",
      "J",
      "K",
      "L",
    ];

    return groupLetters.every((letter) => {
      const groupName = `${letter}`;
      const groupMatches = matches.filter(
        (m) => m.group_name === groupName && m.stage.includes("Group Stage"),
      );
      const groupStanding = standings.find((s) => s.group_name === groupName);

      const matchesDone =
        groupMatches.length > 0 &&
        groupMatches.every(
          (m) =>
            typeof m.home_goals_predicted === "number" &&
            typeof m.away_goals_predicted === "number",
        );
      const picksDone = !!(
        groupStanding?.w_id &&
        groupStanding?.r_id &&
        groupStanding?.t_id
      );
      const noDupes =
        groupStanding &&
        groupStanding.w_id !== groupStanding.r_id &&
        groupStanding.w_id !== groupStanding.t_id &&
        groupStanding.r_id !== groupStanding.t_id;

      return matchesDone && picksDone && noDupes;
    });
  };

  // Add this inside your PredictorPage component
  const saveThirdPlacePicks = async (userId: string | null) => {
    if (userId === null) return false;
    try {
      const response = await fetch("/api/predictions/save-third-place", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId, // Pass your currentUser.id here
          thirdPlaceIds: advancingThirdPlaceIds, // Your state array of 8 IDs
          r32Picks: allR32Teams,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save third place picks");
      }

      await response.json();
      return true;
    } catch (error) {
      console.error(error);
      alert("There was an issue saving your third place picks.");
      return false;
    }
  };

  const handleKnockoutComplete = async (moveToTiebreakers: boolean) => {
    const knockoutpickIds = {
      r16: knockoutPicks.r16.map((p) => p.id) || [],
      qf: knockoutPicks.qf.map((p) => p.id) || [],
      sf: knockoutPicks.sf.map((p) => p.id) || [],
      final: knockoutPicks.final.map((p) => p.id) || [],
      champion: knockoutPicks.champion?.id || null,
      runnerUp: knockoutPicks.runnerUp?.id || undefined,
      thirdPlaceMatch: knockoutPicks.thirdPlaceMatch.map((p) => p.id) || [],
    };

    const success = await fetch("/api/predictions/save-knockouts", {
      method: "POST",
      body: JSON.stringify({
        userId: userId,
        picks: knockoutpickIds,
      }),
    });

    if (success.ok && !moveToTiebreakers) {
      return "Advance";
    }

    if (success.ok && moveToTiebreakers) {
      setActiveStep((prev) => prev + 1); // Move to Tie-breakers
    }
  };

  const handleTieBreakerChange = (
    field: keyof TieBreakerData,
    value: number | "",
  ) => {
    setTieBreakers((prev) => ({ ...prev, [field]: value }));
  };

  const isGroupStageCompleted = isGroupStageComplete();

  const handleNext = async () => {
    // Step 0: Group Stage Validation
    if (activeStep === 0 && !isGroupStageCompleted) {
      alert(
        `Please complete all groups and resolve any duplicate picks before moving on.`,
      );
      return;
    }

    // Step 1: Third Place Validation
    if (activeStep === 1 && advancingThirdPlaceIds.length !== 8) {
      alert("Please select 8 third place teams to move on.");
      return;
    }

    if (activeStep === 1) {
      if (advancingThirdPlaceIds.length !== 8) {
        alert("Please select 8 third place teams to move on.");
        return;
      }
      const isSaved = await saveThirdPlacePicks(userId);
      if (!isSaved) {
        return;
      }

      setKnockoutPicks((prev) =>
        pruneGhostPicks(prev, standings, advancingThirdPlaceIds),
      );
    }

    // --- NEW: Step 2 Knockout Validation ---
    if (activeStep === 2) {
      if (
        knockoutPicks.r16.map((p) => p.id).length !== 16 ||
        knockoutPicks.qf.map((p) => p.id).length !== 8 ||
        knockoutPicks.sf.map((p) => p.id).length !== 4 ||
        knockoutPicks.final.map((p) => p.id).length !== 2 ||
        knockoutPicks.thirdPlaceMatch.map((p) => p.id).length !== 2 ||
        knockoutPicks.champion?.id === null ||
        knockoutPicks.runnerUp?.id === undefined
      ) {
        alert("Please fill out all knockout picks before advancing!");
        return;
      }
    }
    if (activeStep === 3) {
      if (
        tieBreakers.totalGoals === "" ||
        tieBreakers.totalYellowCards === "" ||
        tieBreakers.totalRedCards === ""
      ) {
        alert("Please enter a prediction for all tiebreaker fields.");
        return;
      }

      // Call your final API route here to save everything!
      const success = await fetch("/api/predictions/tiebreakers", {
        method: "POST",
        body: JSON.stringify({
          goals: tieBreakers.totalGoals,
          yellowCards: tieBreakers.totalYellowCards,
          redCards: tieBreakers.totalRedCards,
        }),
      });
      if (success.ok) {
        void router.push("/pool-entry");
      }
    }
    setActiveStep((prev) => prev + 1);
  };

  return (
    <Container sx={{ mt: 2, mb: 8 }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box>
        {activeStep === 0 && (
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
            Group Stage Predictions
          </Typography>
        )}
        {activeStep === 1 && (
          <Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                my: 2,
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: "bold" }}>
                Third Place Predictions
              </Typography>
              <Button
                size="small"
                onClick={() => setShowScoreInfo(!showScoreInfo)}
                sx={{
                  // fontSize: "0.75rem",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                <InfoOutlinedIcon />
              </Button>
            </Box>
            <Collapse in={showScoreInfo}>
              <Box
                sx={{
                  p: 1.5,
                  mb: 1,
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.05),
                  borderRadius: 2,
                  border: 1,
                  borderColor: (theme) =>
                    alpha(theme.palette.primary.main, 0.1),
                }}
              >
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ display: "block" }}
                >
                  • The new format for this World Cup introduces a Round of 32.
                  The 8 best third-place teams from the Group Stage will move
                  on.
                  <br />•{" "}
                  <strong>
                    1 pt for each correctly picked Round of 32 team.
                  </strong>{" "}
                  All of your Group Winners and Runners-up are automatically
                  considered part of your Round of 32 picks. Your last 8 spots
                  will go to whichever third-place teams you decide.
                </Typography>
              </Box>
            </Collapse>
            <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>
              Select the <b>8 third-place teams</b> you believe will advance to
              the Round of 32. Current selection:{" "}
              <strong>{advancingThirdPlaceIds.length} / 8</strong>
            </Alert>
          </Box>
        )}
        {activeStep === 2 && (
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
            Knockout Stage Predictions
          </Typography>
        )}
        {activeStep === 3 && (
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
            Tiebreaker Predictions
          </Typography>
        )}
      </Box>
      <Paper elevation={0} sx={{ minHeight: "400px" }}>
        {activeStep === 0 && (
          <GroupStageStep
            matches={matches}
            standings={standings}
            onScoreChange={handleScoreUpdate}
            onStandingChange={handleStandingSave}
            actualStandings={actualStandings}
            isLocked={isLocked}
          />
        )}
        {activeStep === 1 && (
          <ThirdPlaceStep
            matches={matches}
            standings={standings}
            selectedThirdPlaceIds={advancingThirdPlaceIds}
            onToggleThirdPlace={handleToggleThirdPlace}
          />
        )}
        {/* --- NEW: Knockout Step --- */}
        {activeStep === 2 && (
          <KnockoutStep
            allTeams={allTeams}
            standings={standings}
            selectedThirdPlaceIds={advancingThirdPlaceIds}
            initialKnockouts={initialKnockouts}
            picks={knockoutPicks}
            onChange={setKnockoutPicks}
            onComplete={handleKnockoutComplete}
          />
        )}
        {activeStep === 3 && (
          <TieBreakerStep
            data={tieBreakers}
            onChange={handleTieBreakerChange}
          />
        )}
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={() => setActiveStep((s) => s - 1)}
        >
          Back
        </Button>
        <Button variant="contained" onClick={handleNext}>
          {activeStep === steps.length - 1 ? "Save All" : "Next"}
        </Button>
      </Box>
    </Container>
  );
}
