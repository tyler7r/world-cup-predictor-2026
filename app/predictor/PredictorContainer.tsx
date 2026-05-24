"use client";

import {
  Box,
  Button,
  Container,
  Paper,
  Step,
  StepLabel,
  Stepper,
} from "@mui/material";
import { useState } from "react";
import GroupStageStep from "./GroupStageStep";
import KnockoutStep2 from "./KnockoutStep2";
import ThirdPlaceStep from "./ThirdPlaceStep";
import TieBreakerStep, { TieBreakerData } from "./Tiebreaker";
import { KnockoutData, Match, StandingPredictions, Team } from "./types"; // <-- ADD 'Team'

const steps = ["Group Stage", "Third Place", "Knockouts", "Tie-Breakers"];

// Added allTeams to props since the Knockout bracket needs the team logos and names
type PredictorPageProps = {
  initialMatches: Match[];
  initialStandings: StandingPredictions[];
  initialThirdPlaces: number[];
  allTeams: Team[]; // <-- NEW PROP
  userId: string | null;
  initialKnockouts: KnockoutData;
};

// Helper function to prune teams that no longer exist in the knockout pool
export const pruneGhostPicks = (
  currentPicks: KnockoutData,
  currentStandings: StandingPredictions[],
  validThirdPlaceIds: number[],
): KnockoutData => {
  // 1. Build a Set of all valid team IDs (The pool of 32)
  const validPool = new Set<number>();

  currentStandings.forEach((s) => {
    if (s.w_id) validPool.add(s.w_id);
    if (s.r_id) validPool.add(s.r_id);
    if (s.t_id && validThirdPlaceIds.includes(s.t_id)) {
      validPool.add(s.t_id);
    }
  });

  // 2. Helper to filter out any IDs not in the valid pool
  const filterValid = (arr: number[]) => arr.filter((id) => validPool.has(id));

  // 3. Return the sanitized picks
  return {
    r16: filterValid(currentPicks.r16),
    qf: filterValid(currentPicks.qf),
    sf: filterValid(currentPicks.sf),
    final: filterValid(currentPicks.final),
    thirdPlaceMatch: filterValid(currentPicks.thirdPlaceMatch),
    champion:
      currentPicks.champion && validPool.has(currentPicks.champion)
        ? currentPicks.champion
        : null,
    runnerUp:
      currentPicks.runnerUp && validPool.has(currentPicks.runnerUp)
        ? currentPicks.runnerUp
        : undefined,
  };
};

export default function PredictorPage({
  initialMatches,
  initialStandings,
  allTeams, // <-- NEW PROP
  userId,
  initialKnockouts,
  initialThirdPlaces,
}: PredictorPageProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [matches, setMatches] = useState<Match[]>(initialMatches);
  const [standings, setStandings] =
    useState<StandingPredictions[]>(initialStandings);
  const [advancingThirdPlaceIds, setAdvancingThirdPlaceIds] =
    useState<number[]>(initialThirdPlaces);
  const [tieBreakers, setTieBreakers] = useState<TieBreakerData>({
    totalGoals: "",
    totalYellowCards: "",
    totalRedCards: "",
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
    setStandings((prev) => {
      const existingIndex = prev.findIndex((s) => s.group_name === groupName);
      const newStandings = [...prev];

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

      const newThirdPlaces = newStandings.map((r) => r.t_id);
      setAdvancingThirdPlaceIds(newThirdPlaces);

      return newStandings;
    });
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
      // "I",
      // "J",
      // "K",
      // "L",
    ];
    return groupLetters.every((letter) => {
      const groupName = `${letter}`;
      const groupMatches = matches.filter(
        (m) => m.group_name === groupName && m.stage.includes("Group Stage"),
      );
      const groupStanding = standings.find((s) => s.group_name === groupName);

      const matchesDone =
        groupMatches.length > 0 &&
        groupMatches.every((m) => m.home_goals_predicted !== null);
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

  const handleKnockoutComplete = async () => {
    const success = await fetch("/api/predictions/save-knockouts", {
      method: "POST",
      body: JSON.stringify({
        userId: userId,
        picks: knockoutPicks,
      }),
    });

    if (success.ok) {
      setActiveStep((prev) => prev + 1); // Move to Tie-breakers
    }
  };

  const handleTieBreakerChange = (
    field: keyof TieBreakerData,
    value: number | "",
  ) => {
    setTieBreakers((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = async () => {
    // Step 0: Group Stage Validation
    if (activeStep === 0 && !isGroupStageComplete()) {
      alert(
        "Please complete all groups and resolve any duplicate picks before moving on.",
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
        knockoutPicks.r16.length !== 16 ||
        knockoutPicks.qf.length !== 8 ||
        knockoutPicks.sf.length !== 4 ||
        knockoutPicks.final.length !== 2 ||
        knockoutPicks.thirdPlaceMatch.length !== 2 ||
        knockoutPicks.champion === null ||
        knockoutPicks.runnerUp === undefined
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
      await fetch("/api/predictions/tiebreakers", {
        method: "POST",
        body: JSON.stringify({
          goals: tieBreakers.totalGoals,
          yellowCards: tieBreakers.totalYellowCards,
          redCards: tieBreakers.totalRedCards,
        }),
      });
    }

    setActiveStep((prev) => prev + 1);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Paper elevation={0} variant="outlined" sx={{ p: 3, minHeight: "400px" }}>
        {activeStep === 0 && (
          <GroupStageStep
            matches={matches}
            standings={standings}
            onScoreChange={handleScoreUpdate}
            onStandingChange={handleStandingSave}
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
          <KnockoutStep2
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
        {/* Step 3 (Tiebreakers) would go here */}
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
