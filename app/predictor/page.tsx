"use client";
import {
  Box,
  Button,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import { useState } from "react";
import GroupStageStep from "./GroupStageStep";

const steps = ["Group Stage", "Knockouts", "Tie-Breakers"];

export default function PredictorPage() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <Box sx={{ width: "100%", p: 4 }}>
      <Stepper activeStep={activeStep} alternativeLabel>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ mt: 4 }}>
        {activeStep === 0 && <GroupStageStep />}
        {/* {activeStep === 1 && <KnockoutStep />} */}
        {activeStep === 1 && <Typography>Tie Breaker logic here...</Typography>}
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
        <Button
          disabled={activeStep === 0}
          onClick={() => setActiveStep((s) => s - 1)}
        >
          Back
        </Button>
        <Button variant="contained" onClick={() => setActiveStep((s) => s + 1)}>
          {activeStep === steps.length - 1 ? "Finish" : "Next"}
        </Button>
      </Box>
    </Box>
  );
}
