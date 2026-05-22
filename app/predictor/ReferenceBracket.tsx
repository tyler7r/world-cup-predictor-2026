import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Divider,
  Typography,
} from "@mui/material";

interface ReferenceBracketProps {
  currentStage: string;
}

export default function ReferenceBracket({
  currentStage,
}: ReferenceBracketProps) {
  const r32Matches = [
    { id: 73, home: "Runner-up A", away: "Runner-up B" },
    { id: 74, home: "Winner E", away: "3rd Place A/B/C/D/F" },
    { id: 75, home: "Winner F", away: "Runner-up C" },
    { id: 76, home: "Winner C", away: "Runner-up F" },
    // ... add all 16 R32 match strings from the matrix here
  ];

  //   const r16Matches = [];

  //   const r8Matches = [];

  //   const r4Matches = [];

  //   const r2Matches = [];

  return (
    <Box sx={{ mt: 2 }}>
      <Accordion variant="outlined">
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle2" color="primary">
            View Reference Bracket Structure
          </Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ maxHeight: 300, overflowY: "auto" }}>
          <Typography
            variant="caption"
            sx={{ mb: 2, fontStyle: "italic", display: "block" }}
          >
            Note: To maximize points, avoid picking both teams from the same
            match to advance.
          </Typography>
          {currentStage === "Round of 16" ? (
            r32Matches.map((m) => (
              <Box key={m.id} sx={{ mb: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                  Match {m.id}
                </Typography>
                <Typography variant="caption">
                  {m.home} vs. {m.away}
                </Typography>
                <Divider sx={{ my: 0.5 }} />
              </Box>
            ))
          ) : (
            <></>
          )}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
