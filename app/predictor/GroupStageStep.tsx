"use client";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { useState } from "react";

export default function GroupStageStep() {
  const [value, setValue] = useState(0); // Current Group (0-11)

  //   const handleSaveScore = async (matchId, scores) => {
  //     // Use axios to POST to /api/predictions/match
  //     // This ensures progress is saved immediately
  //   };

  return (
    <Box sx={{ display: "flex", height: "70vh" }}>
      <Tabs
        orientation="vertical"
        value={value}
        onChange={(e, v) => setValue(v)}
        sx={{ borderRight: 1, borderColor: "divider", minWidth: "150px" }}
      >
        {["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"].map(
          (l) => (
            <Tab key={l} label={`Group ${l}`} />
          ),
        )}
      </Tabs>

      <Box sx={{ flexGrow: 1, p: 3, overflowY: "auto" }}>
        <Typography variant="h5">Group Matches</Typography>
        {/* Map through matches for the selected group letter */}
        {/* [Match Row: Team A [input] vs [input] Team B] */}

        <Typography variant="h5" sx={{ mt: 4 }}>
          Group Standings
        </Typography>
        <Typography variant="body2">Who advances from this group?</Typography>
        {/* Winner and Runner-up Autocomplete Dropdowns */}
      </Box>
    </Box>
  );
}
