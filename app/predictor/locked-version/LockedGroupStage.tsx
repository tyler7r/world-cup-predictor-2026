"use client";

import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import {
  Box,
  Button,
  Collapse,
  Fab,
  Paper,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useState } from "react";
import GroupMatch from "../components/GroupStageComponents/GroupMatch";
import {
  ActualStandingsType,
  calculateGroupStandings,
  Match,
  StandingPredictions,
} from "../types";
import LockedStandings from "./LockedStandings";

interface LockedGroupStageStepProps {
  matches: Match[];
  standings: StandingPredictions[];
  actualStandings: ActualStandingsType[];
}

export default function LockedGroupStageStep({
  matches,
  standings,
  actualStandings,
}: LockedGroupStageStepProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [showScoreInfo, setShowScoreInfo] = useState(false); // <-- Add this
  const [showPicksInfo, setShowPicksInfo] = useState(false); // <-- Add this

  const groups = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];
  const currentGroupName = `${groups[activeTab]}`;
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("sm"));

  const filteredMatches = matches.filter(
    (m) => m.group_name === currentGroupName && m.stage.includes("Group Stage"),
  );

  const filteredStandings = standings.find(
    (s) => s.group_name === currentGroupName,
  );

  const filteredActualStandings = actualStandings.find(
    (s) => s.group_name === currentGroupName,
  );
  const currentGroupStandings = calculateGroupStandings(filteredMatches);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isDesktop ? "row" : "column",
        gap: { xs: 1, md: 4 },
        bgcolor: "background.default",
        px: 2,
        py: 1,
        borderRadius: 3,
        overflowY: "scroll",
      }}
    >
      <Tabs
        orientation={isDesktop ? "vertical" : "horizontal"}
        variant={isDesktop ? "standard" : "scrollable"}
        scrollButtons={"auto"}
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        // TabIndicatorProps={{ sx: { width: 3, borderRadius: "4px 0 0 4px" } }}
        sx={{
          borderRight: isDesktop ? 1 : 0,
          borderColor: "divider",
          minWidth: { xs: "80px", md: "120px" },
        }}
      >
        {groups.map((g) => {
          return (
            <Tab
              key={g}
              label={`Group ${g}`}
              iconPosition="end"
              sx={{ justifyContent: "space-between", minHeight: 48, px: 1 }}
            />
          );
        })}
      </Tabs>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          overflowY: "auto",
          pr: isDesktop ? 4 : 1,
        }}
      >
        {/* Match Cards */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 1,
          }}
        >
          <Typography variant="subtitle1" color="text.secondary">
            SCORE PREDICTIONS
          </Typography>
          <Button
            size="small"
            onClick={() => setShowScoreInfo(!showScoreInfo)}
            sx={{ fontSize: "0.75rem", textTransform: "none", fontWeight: 600 }}
          >
            {showScoreInfo ? "Hide scoring" : "How scoring works"}
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
              borderColor: (theme) => alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ display: "block" }}
            >
              • 3 points are available for each match. 1 point for correct
              result and 1 point for each correct number of goals scored by a
              team.
              <br />• <strong>Example:</strong> If you pick Mexico to beat South
              Africa 1-0.
              <br />• <strong>3pt Outcome:</strong> Mexico actually beats South
              Africa 1-0
              <br />• <strong>2pt Outcome:</strong> Mexico wins 2-0. 1 point for
              the correct result and 1 point for the correct score for South
              Africa.
              <br />• <strong>1pt Outcome:</strong> Actual result is 0-0. 1
              point for the correct score for South Africa.
            </Typography>
          </Box>
        </Collapse>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", lg: "repeat(2, 1fr)" },
            gap: 2,
            mt: 1,
          }}
        >
          {filteredMatches.map((m) => (
            <GroupMatch key={m.api_fixture_id} m={m} />
          ))}
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
            mt: 2,
            pb: 2,
          }}
        >
          <Box
            sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle1" color="text.secondary">
                OFFICIAL PICKS
              </Typography>
              <Button
                size="small"
                onClick={() => setShowPicksInfo(!showPicksInfo)}
                sx={{
                  fontSize: "0.75rem",
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {showPicksInfo ? "Hide scoring" : "How scoring works"}
              </Button>
            </Box>

            <Collapse in={showPicksInfo}>
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
                  <strong>Predict the final standings for each group.</strong>{" "}
                  Your official picks do not need to match your projected
                  standings. For example, if you have Mexico winning Group A
                  based on your Score Predictions you can still pick Mexico to
                  be the Runner-up. However, you can not pick the same team
                  multiple times.
                  <br />• <strong>Correct Group Winner:</strong> 3 points
                  <br />• <strong>Correct Runner Up:</strong> 2 points
                  <br />• <strong>Correct 3rd Place:</strong> 1 point
                </Typography>
              </Box>
            </Collapse>
            <Paper
              sx={{
                bgcolor: theme.palette.divider,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                p: 0.25,
                my: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  textAlign: "center",
                  fontWeight: 600,
                  letterSpacing: 0.5,
                  width: "100%",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                Points Earned: {filteredStandings?.points_earned}
              </Typography>
            </Paper>
          </Box>
          <LockedStandings
            label="Group Winner"
            value={filteredStandings?.w_id}
            options={currentGroupStandings}
            standings={{
              id: filteredActualStandings!.w_id,
              name: filteredActualStandings!.w_name,
              flag: filteredActualStandings!.w_flag,
              name_code: filteredActualStandings!.w_name_code,
            }}
          />
          <LockedStandings
            label="Runner Up"
            value={filteredStandings?.r_id}
            options={currentGroupStandings}
            standings={{
              id: filteredActualStandings!.r_id,
              name: filteredActualStandings!.r_name,
              flag: filteredActualStandings!.r_flag,
              name_code: filteredActualStandings!.r_name_code,
            }}
          />
          <LockedStandings
            label="Third Place"
            value={filteredStandings?.t_id}
            options={currentGroupStandings}
            standings={{
              id: filteredActualStandings!.t_id,
              name: filteredActualStandings!.t_name,
              flag: filteredActualStandings!.t_flag,
              name_code: filteredActualStandings!.t_name_code,
            }}
          />
        </Box>
      </Box>
      <Fab
        color="primary"
        onClick={scrollToTop}
        size="small"
        sx={{
          position: "fixed",
          bottom: "12px",
          right: "12px",
          zIndex: 1000,
        }}
        aria-label="Scroll to top"
      >
        <ArrowUpwardIcon />
      </Fab>
    </Box>
  );
}
