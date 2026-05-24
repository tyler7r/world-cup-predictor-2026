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
    { id: 76, home: "Winner C", away: "Runner-up F" },
    { id: 74, home: "Winner E", away: "3rd Place A/B/C/D/F" },
    { id: 75, home: "Winner F", away: "Runner-up C" },
    { id: 78, home: "Runner-up E", away: "Runner-up I" },
    { id: 77, home: "Winner A", away: "3rd Place C/D/F/G/H" },
    { id: 80, home: "Winner L", away: "3rd Place E/H/I/J/K" },
    { id: 82, home: "Winner G", away: "3rd Place A/E/H/I/J" },
    { id: 81, home: "Winner D", away: "3rd Place B/E/F/I/J" },
    { id: 84, home: "Winner H", away: "Runner-up J" },
    { id: 83, home: "Runner-up K", away: "Runner-up L" },
    { id: 85, home: "Winner B", away: "3rd Place E/F/G/I/J" },
    { id: 88, home: "Runner-up D", away: "Runner-up G" },
    { id: 86, home: "Winner J", away: "Runner-up H" },
    { id: 87, home: "Winner K", away: "3rd Place D/E/I/J/L" },
  ];

  const r16Matches = [
    { id: 90, home: "Winner Match 73", away: "Winner Match 75" },
    { id: 89, home: "Winner Match 74", away: "Winner Match 77" },
    { id: 91, home: "Winner Match 76", away: "Winner Match 78" },
    { id: 92, home: "Winner Match 79", away: "Winner Match 80" },
    { id: 93, home: "Winner Match 83", away: "Winner Match 84" },
    { id: 94, home: "Winner Match 81", away: "Winner Match 82" },
    { id: 95, home: "Winner Match 86", away: "Winner Match 88" },
    { id: 96, home: "Winner Match 85", away: "Winner Match 87" },
  ];

  const r8Matches = [
    { id: 97, home: "Winner Match 89", away: "Winner Match 90" },
    { id: 98, home: "Winner Match 93", away: "Winner Match 94" },
    { id: 99, home: "Winner Match 91", away: "Winner Match 92" },
    { id: 100, home: "Winner Match 95", away: "Winner Match 96" },
  ];

  const r4Matches = [
    { id: 101, home: "Winner Match 97", away: "Winner Match 98" },
    { id: 102, home: "Winner Match 99", away: "Winner Match 100" },
  ];

  // const r2Matches = [
  //   { id: 103, home: "Winner Match 101", away: "Winner Match 102" },
  // ];

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
          {currentStage === "Round of 16"
            ? r32Matches.map((m) => (
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
            : currentStage === "Quarter-finals"
              ? r16Matches.map((m) => (
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
              : currentStage === "Semi-finals"
                ? r8Matches.map((m) => (
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
                : r4Matches.map((m) => (
                    <Box key={m.id} sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        Match {m.id}
                      </Typography>
                      <Typography variant="caption">
                        {m.home} vs. {m.away}
                      </Typography>
                      <Divider sx={{ my: 0.5 }} />
                    </Box>
                  ))}
        </AccordionDetails>
      </Accordion>
    </Box>
  );
}
