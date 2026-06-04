"use client";

import { ArrowBackIos, ArrowForwardIos } from "@mui/icons-material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleIcon from "@mui/icons-material/Circle";
import {
  Avatar,
  Box,
  Button,
  Collapse,
  Fab,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useState } from "react";
import {
  ActualStandingsType,
  calculateGroupStandings,
  Match,
  StandingPredictions,
} from "../../types";
import { GroupMatchInput } from "./GroupMatchInput";
import StandingSelector from "./StandingSelector";

interface GroupStageStepProps {
  matches: Match[];
  standings: StandingPredictions[];
  onScoreChange: (
    matchId: number,
    team: "home" | "away",
    score: number,
  ) => void;
  onStandingChange: (
    groupName: string,
    rank: "winner" | "runnerUp" | "third",
    teamId: number,
    teamName: string,
    teamFlag: string,
  ) => void;
  isLocked: boolean;
  actualStandings: ActualStandingsType[];
}

export default function GroupStageStep({
  matches,
  onScoreChange,
  standings,
  onStandingChange,
  actualStandings,
  isLocked,
}: GroupStageStepProps) {
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
  const matchesRemaining = filteredMatches.filter(
    (m) => m.home_goals_predicted === null || m.away_goals_predicted === null,
  ).length;
  const selectionsRemaining = [
    filteredStandings?.w_id,
    filteredStandings?.r_id,
    filteredStandings?.t_id,
  ].filter((id) => !id).length;

  const selectedWinnerId = filteredStandings?.w_id;
  const selectedRunnerUpId = filteredStandings?.r_id;
  const selectedThirdId = filteredStandings?.t_id;

  const hasWinnerDuplicate =
    (selectedWinnerId === selectedRunnerUpId ||
      selectedWinnerId === selectedThirdId) &&
    selectedWinnerId !== undefined;
  const hasRunnerUpDuplicate =
    (selectedRunnerUpId === selectedWinnerId ||
      selectedRunnerUpId === selectedThirdId) &&
    selectedRunnerUpId !== undefined;
  const hasThirdDuplicate =
    (selectedThirdId === selectedWinnerId ||
      selectedThirdId === selectedRunnerUpId) &&
    selectedThirdId !== undefined;

  const getGroupStatus = (groupLetter: string) => {
    const groupName = `${groupLetter}`;
    const groupMatches = matches.filter(
      (m) => m.group_name === groupName && m.stage.includes("Group Stage"),
    );
    const groupStanding = standings.find((s) => s.group_name === groupName);

    const matchesComplete =
      groupMatches.length > 0 &&
      groupMatches.every(
        (m) =>
          m.home_goals_predicted !== null && m.away_goals_predicted !== null,
      );
    const selectionsComplete = !!(
      groupStanding?.w_id &&
      groupStanding?.r_id &&
      groupStanding?.t_id
    );
    const hasDuplicates =
      groupStanding &&
      (groupStanding.w_id === groupStanding.r_id ||
        groupStanding.w_id === groupStanding.t_id ||
        groupStanding.r_id === groupStanding.t_id);

    return matchesComplete && selectionsComplete && !hasDuplicates;
  };

  const savePrediction = async (
    match: Match,
    team: "home" | "away",
    value: string,
  ) => {
    const matchId = match.api_fixture_id;
    const parsedValue = value === "" ? null : parseInt(value);

    onScoreChange(matchId, team, parsedValue as number);
    await fetch("/api/predictions/match", {
      method: "POST",
      body: JSON.stringify({
        matchId,
        homeGoals: team === "home" ? parsedValue : match.home_goals_predicted,
        awayGoals: team === "away" ? parsedValue : match.away_goals_predicted,
      }),
    });
  };

  const handleStandingSave = async (
    rank: "winner" | "runnerUp" | "third",
    teamId: number,
  ) => {
    const selectedTeam = currentGroupStandings.find((t) => t.teamId === teamId);
    if (!selectedTeam) return;

    onStandingChange(
      currentGroupName,
      rank,
      teamId,
      selectedTeam.teamName,
      selectedTeam.flagUrl,
    );

    await fetch("/api/predictions/standings", {
      method: "POST",
      body: JSON.stringify({
        groupName: currentGroupName,
        winnerId: rank === "winner" ? teamId : filteredStandings?.w_id,
        runnerUpId: rank === "runnerUp" ? teamId : filteredStandings?.r_id,
        thirdPlaceId: rank === "third" ? teamId : filteredStandings?.t_id,
      }),
    });
  };

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
          const isComplete = getGroupStatus(g);
          return (
            <Tab
              key={g}
              label={`Group ${g}`}
              icon={
                isComplete ? (
                  <CheckCircleIcon
                    sx={{ fontSize: 18, color: "success.main" }}
                  />
                ) : (
                  <CircleIcon sx={{ fontSize: 8, color: "divider" }} />
                )
              }
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
        {/* Status Banners */}
        <Box
          sx={{
            py: 1,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {matchesRemaining > 0 && (
            <Typography
              variant="caption"
              sx={{
                bgcolor: "action.hover",
                color: "text.secondary",
                px: 2,
                py: 0.75,
                borderRadius: 2,
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              {matchesRemaining} MATCHES LEFT
            </Typography>
          )}
          {selectionsRemaining > 0 && (
            <Typography
              variant="caption"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                color: "error.main",
                px: 2,
                py: 0.75,
                borderRadius: 2,
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              {selectionsRemaining} RANKINGS LEFT
            </Typography>
          )}
          {matchesRemaining === 0 &&
            selectionsRemaining === 0 &&
            !hasWinnerDuplicate && (
              <Typography
                variant="caption"
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                  color: "success.main",
                  border: 1,
                  borderColor: (theme) =>
                    alpha(theme.palette.success.main, 0.3),
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}
              >
                GROUP {groups[activeTab]} COMPLETE
              </Typography>
            )}
        </Box>
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
            gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
            gap: 2,
            mt: 1,
          }}
        >
          {filteredMatches.map((m) => (
            <GroupMatchInput
              key={m.api_fixture_id}
              m={m}
              savePrediction={savePrediction}
              onScoreChange={onScoreChange}
            />
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
          {/* Standing Selections */}
          {!isLocked && (
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ mb: 1.5 }}
              >
                PROJECTED STANDINGS
              </Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        "& th": {
                          borderBottom: 1,
                          borderColor: "divider",
                          color: "text.secondary",
                          py: 1.5,
                        },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 600 }}>Team</TableCell>
                      <TableCell align="center">P</TableCell>
                      <TableCell align="center">GD</TableCell>
                      <TableCell align="center" sx={{ fontWeight: 600 }}>
                        Pts
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentGroupStandings.map((team, idx) => (
                      <TableRow
                        key={team.teamId}
                        sx={{
                          "& td": { borderBottom: 1, borderColor: "divider" },
                          "&:last-child td": { borderBottom: 0 },
                          ...(idx < 2 && {
                            bgcolor: (theme) =>
                              alpha(theme.palette.success.main, 0.05),
                          }),
                          ...(idx === 2 && {
                            bgcolor: (theme) =>
                              alpha(theme.palette.primary.main, 0.05),
                          }),
                        }}
                      >
                        <TableCell
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.5,
                            py: 1.5,
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color:
                                idx < 2
                                  ? "success.main"
                                  : idx === 2
                                    ? "primary.main"
                                    : "text.secondary",
                              fontWeight: 700,
                              width: 12,
                            }}
                          >
                            {idx + 1}
                          </Typography>
                          <Avatar
                            src={team.flagUrl}
                            variant="rounded"
                            sx={{ width: 20, height: 14 }}
                          />
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {team.teamName}
                          </Typography>
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ color: "text.secondary" }}
                        >
                          {team.played}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ color: "text.secondary" }}
                        >
                          {team.gd > 0 ? `+${team.gd}` : team.gd}
                        </TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>
                          {team.points}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
          <Box
            sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: -0.5,
              }}
            >
              <Typography variant="subtitle1" color="text.secondary">
                YOUR PICKS
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
            <StandingSelector
              label="Group Winner"
              value={filteredStandings?.w_id}
              options={currentGroupStandings}
              projectedId={currentGroupStandings[0]?.teamId}
              onChange={(id) => handleStandingSave("winner", id)}
              isDuplicate={hasWinnerDuplicate}
              isLocked={isLocked}
              standings={{
                id: filteredActualStandings!.w_id,
                name: filteredActualStandings!.w_name,
                flag: filteredActualStandings!.w_flag,
                name_code: filteredActualStandings!.w_name_code,
              }}
            />
            <StandingSelector
              label="Runner Up"
              value={filteredStandings?.r_id}
              options={currentGroupStandings}
              projectedId={currentGroupStandings[1]?.teamId}
              onChange={(id) => handleStandingSave("runnerUp", id)}
              isDuplicate={hasRunnerUpDuplicate}
              isLocked={isLocked}
              standings={{
                id: filteredActualStandings!.r_id,
                name: filteredActualStandings!.r_name,
                flag: filteredActualStandings!.r_flag,
                name_code: filteredActualStandings!.r_name_code,
              }}
            />
            <StandingSelector
              label="Third Place"
              value={filteredStandings?.t_id}
              options={currentGroupStandings}
              projectedId={currentGroupStandings[2]?.teamId}
              onChange={(id) => handleStandingSave("third", id)}
              isDuplicate={hasThirdDuplicate}
              isLocked={isLocked}
              standings={{
                id: filteredActualStandings!.t_id,
                name: filteredActualStandings!.t_name,
                flag: filteredActualStandings!.t_flag,
                name_code: filteredActualStandings!.t_name_code,
              }}
            />
          </Box>
        </Box>
        <Box
          sx={{
            py: 0.5,
            mb: 1,
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {matchesRemaining > 0 && (
            <Typography
              variant="caption"
              sx={{
                bgcolor: "action.hover",
                color: "text.secondary",
                px: 2,
                py: 0.75,
                borderRadius: 2,
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              {matchesRemaining} MATCHES LEFT
            </Typography>
          )}
          {selectionsRemaining > 0 && (
            <Typography
              variant="caption"
              sx={{
                bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                color: "error.main",
                px: 2,
                py: 0.75,
                borderRadius: 2,
                fontWeight: 600,
                letterSpacing: 0.5,
              }}
            >
              {selectionsRemaining} RANKINGS LEFT
            </Typography>
          )}
          {matchesRemaining === 0 &&
            selectionsRemaining === 0 &&
            !hasWinnerDuplicate && (
              <Typography
                variant="caption"
                sx={{
                  bgcolor: (theme) => alpha(theme.palette.success.main, 0.1),
                  color: "success.main",
                  border: 1,
                  borderColor: (theme) =>
                    alpha(theme.palette.success.main, 0.3),
                  px: 2,
                  py: 0.75,
                  borderRadius: 2,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                }}
              >
                GROUP {groups[activeTab]} COMPLETE
              </Typography>
            )}
        </Box>
        <Box sx={{ width: "100%", display: "flex" }}>
          {activeTab > 0 && (
            <Button
              startIcon={<ArrowBackIos />}
              onClick={() => setActiveTab((prev) => prev - 1)}
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              Group {groups[activeTab - 1]}
            </Button>
          )}
          {activeTab < 11 && (
            <Button
              endIcon={<ArrowForwardIos />}
              onClick={() => setActiveTab((prev) => prev + 1)}
              sx={{
                width: "100%",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              Group {groups[activeTab + 1]}
            </Button>
          )}
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
