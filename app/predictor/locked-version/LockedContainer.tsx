"use client";

import {
  Box,
  Button,
  Container,
  Paper,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ActualKnockoutTeams,
  ActualStandingsType,
  KnockoutData,
  Match,
  StandingPredictions,
  Team,
  Tiebreakers,
  UserType,
} from "../types"; // <-- ADD 'Team'
import LockedGroupStageStep from "./LockedGroupStage";
import LockedKnockoutStep from "./LockedKnockoutStep";
import LockedTieBreakerStep from "./LockedTiebreaker";

// Added allTeams to props since the Knockout bracket needs the team logos and names
type LockedPredictorPageProps = {
  initialMatches: Match[];
  initialStandings: StandingPredictions[];
  initialThirdPlaces: number[];
  allTeams: Team[]; // <-- NEW PROP
  initialKnockouts: KnockoutData;
  initialTiebreakers: Tiebreakers;
  actualStandings: ActualStandingsType[];
  actualKnockoutTeams: ActualKnockoutTeams[];
  actualEliminatedTeamIds: number[];
  userData?: UserType;
};

export default function LockedPredictorPage({
  initialMatches,
  initialStandings,
  allTeams, // <-- NEW PROP
  initialKnockouts,
  initialThirdPlaces,
  initialTiebreakers,
  actualStandings,
  actualKnockoutTeams,
  actualEliminatedTeamIds,
  userData,
}: LockedPredictorPageProps) {
  const router = useRouter();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  const [activeStep, setActiveStep] = useState(0);
  const tabs = ["Groups", "Knockouts", "Tiebreakers"];

  const handleNext = async () => {
    if (activeStep === 3) {
      void router.push("/pool-entry");
    } else setActiveStep((prev) => prev + 1);
  };

  return (
    <Container sx={{ mb: 8, width: "100%" }}>
      {userData && (
        <Typography variant="h4" sx={{ fontWeight: "bold", mt: 1 }}>
          {userData.display_name}&apos;s Predictor
        </Typography>
      )}
      <Tabs
        orientation={"horizontal"}
        variant={"scrollable"}
        value={activeStep}
        onChange={(_, v) => setActiveStep(v)}
        // TabIndicatorProps={{ sx: { width: 3, borderRadius: "4px 0 0 4px" } }}
        sx={{
          borderRight: isDesktop ? 1 : 0,
          borderColor: "divider",
          minWidth: { xs: "80px", md: "120px" },
          mb: 2,
        }}
      >
        {tabs.map((t) => {
          return (
            <Tab
              key={t}
              label={t}
              iconPosition="end"
              sx={{
                justifyContent: "space-between",
                minHeight: 48,
              }}
            />
          );
        })}
      </Tabs>

      <Box>
        {activeStep === 0 && (
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
            Group Stage Predictions
          </Typography>
        )}
        {activeStep === 1 && (
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
            Knockout Stage Predictions
          </Typography>
        )}
        {activeStep === 2 && (
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2 }}>
            Tiebreaker Predictions
          </Typography>
        )}
      </Box>
      <Paper elevation={0} sx={{}}>
        {activeStep === 0 && (
          <LockedGroupStageStep
            matches={initialMatches}
            standings={initialStandings}
            actualStandings={actualStandings}
          />
        )}
        {/* --- NEW: Knockout Step --- */}
        {activeStep === 1 && (
          <LockedKnockoutStep
            allTeams={allTeams}
            standings={initialStandings}
            selectedThirdPlaceIds={initialThirdPlaces}
            initialKnockouts={initialKnockouts}
            picks={initialKnockouts}
            actualKnockoutTeams={actualKnockoutTeams}
            actualEliminatedTeamIds={actualEliminatedTeamIds}
          />
        )}
        {activeStep === 2 && <LockedTieBreakerStep data={initialTiebreakers} />}
      </Paper>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Button
          disabled={activeStep === 0}
          onClick={() => setActiveStep((s) => s - 1)}
        >
          Back
        </Button>
        <Button variant="contained" onClick={handleNext}>
          Next
        </Button>
      </Box>
    </Container>
  );
}
