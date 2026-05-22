"use client";

import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleIcon from "@mui/icons-material/Circle";
import {
  Avatar,
  Box,
  Paper,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import StandingSelector from "./StandingSelector";
import { calculateGroupStandings, Match, StandingPredictions } from "./types";

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
}

export default function GroupStageStep({
  matches,
  onScoreChange,
  standings,
  onStandingChange,
}: GroupStageStepProps) {
  const [activeTab, setActiveTab] = useState(0);
  const groups = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const currentGroupName = `${groups[activeTab]}`; // Ensuring format matches DB
  const isLocked = new Date() > new Date(matches[0].kickoff_time);

  const filteredMatches = matches.filter(
    (m) => m.group_name === currentGroupName && m.stage.includes("Group Stage"),
  );

  // Use find instead of filter()[0] for safety, as the group might not exist in standings yet
  const filteredStandings = standings.find(
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

  // Determine if there are duplicates
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

    // 1. Check Matches: Every match must have non-null scores
    const matchesComplete =
      groupMatches.length > 0 &&
      groupMatches.every(
        (m) =>
          m.home_goals_predicted !== null && m.away_goals_predicted !== null,
      );

    // 2. Check Selections: All three ranks must be filled
    const selectionsComplete = !!(
      groupStanding?.w_id &&
      groupStanding?.r_id &&
      groupStanding?.t_id
    );

    // 3. Check for Duplicates
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
    onScoreChange(matchId, team, parseInt(value));
    await fetch("/api/predictions/match", {
      method: "POST",
      body: JSON.stringify({
        matchId,
        homeGoals:
          team === "home" ? parseInt(value) : match.home_goals_predicted,
        awayGoals:
          team === "away" ? parseInt(value) : match.away_goals_predicted,
      }),
    });
  };

  const handleStandingSave = async (
    rank: "winner" | "runnerUp" | "third",
    teamId: number,
  ) => {
    // Look up the full team details from our calculated array to pass back up
    const selectedTeam = currentGroupStandings.find((t) => t.teamId === teamId);
    if (!selectedTeam) return;

    // 1. Update local state in parent
    onStandingChange(
      currentGroupName,
      rank,
      teamId,
      selectedTeam.teamName,
      selectedTeam.flagUrl,
    );

    // 2. Save to DB
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

  return (
    <Box sx={{ display: "flex", gap: 3, height: "70vh" }}>
      <Tabs
        orientation="vertical"
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        sx={{ borderRight: 0.5, borderColor: "divider", minWidth: "125px" }}
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
                    sx={{ fontSize: 16, color: "success.main" }}
                  />
                ) : (
                  <CircleIcon sx={{ fontSize: 8, color: "action.disabled" }} />
                )
              }
              iconPosition="end"
              sx={{
                fontWeight: "bold",
                justifyContent: "space-around",
                minHeight: 48,
                textAlign: "left",
                alignItems: "center",
              }}
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
          width: "100%",
        }}
      >
        <Box sx={{ mb: 2, display: "flex", gap: 2, width: "100%" }}>
          {matchesRemaining > 0 && (
            <Typography
              variant="overline"
              sx={{
                // px: 1,
                // py: 0.5,
                border: "2px solid gray",
                borderRadius: 1,
                width: "100%",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {matchesRemaining} matches left to pick
            </Typography>
          )}
          {selectionsRemaining > 0 && (
            <Typography
              variant="overline"
              sx={{
                // px: 1,
                // py: 0.5,
                borderColor: "red",
                border: "2px solid darkgray",
                borderRadius: 1,
                width: "100%",
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              {selectionsRemaining} rankings left to pick
            </Typography>
          )}
          {matchesRemaining === 0 &&
            selectionsRemaining === 0 &&
            !hasWinnerDuplicate && (
              <Typography
                variant="overline"
                sx={{
                  // py: 0.5,
                  border: "2px solid green",
                  color: "green",
                  borderRadius: 1,
                  width: "100%",
                  fontWeight: "bold",
                  textAlign: "center",
                }}
              >
                Group {groups[activeTab]} Complete!
              </Typography>
            )}
        </Box>
        {filteredMatches.map((m) => {
          const isFinished =
            m.status === "Finished" || "Match Finished" ? true : false;
          return (
            <Paper
              key={m.api_fixture_id}
              variant="outlined"
              sx={{
                p: 2,
                mb: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                borderRadius: 2,
              }}
            >
              {isLocked ? (
                // --- LOCKED UI ---
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                    <Typography variant="h6" sx={{ color: "text.secondary" }}>
                      {m.home_goals_predicted} - {m.away_goals_predicted}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.disabled" }}
                    >
                      Your Pick
                    </Typography>
                  </Box>
                  {isFinished && (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        bgcolor: "background.default",
                        p: 1,
                        borderRadius: 1,
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        Actual: {m.home_goals_actual} - {m.away_goals_actual}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          color:
                            m.points_earned === 3
                              ? "success.main"
                              : "text.primary",
                          fontWeight: "bold",
                        }}
                      >
                        +{m.points_earned} pts
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      width: "150px",
                    }}
                  >
                    <Avatar
                      src={m.home_flag}
                      sx={{ height: 24, width: 36 }}
                      variant="rounded"
                    />
                    <Typography sx={{ fontSize: "0.9rem" }}>
                      {m.home_name}
                    </Typography>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <TextField
                      type="number"
                      size="small"
                      value={m.home_goals_predicted ?? ""}
                      sx={{
                        width: "60px",
                        "& .MuiInputBase-input": { textAlign: "center" },
                      }}
                      onBlur={(e) => savePrediction(m, "home", e.target.value)}
                      onChange={(e) =>
                        onScoreChange(
                          m.api_fixture_id,
                          "home",
                          parseInt(e.target.value),
                        )
                      }
                    />
                    <Typography sx={{ color: "text.disabled" }}>vs</Typography>
                    <TextField
                      type="number"
                      size="small"
                      value={m.away_goals_predicted ?? ""}
                      sx={{
                        width: "60px",
                        "& .MuiInputBase-input": { textAlign: "center" },
                      }}
                      onBlur={(e) => savePrediction(m, "away", e.target.value)}
                      onChange={(e) =>
                        onScoreChange(
                          m.api_fixture_id,
                          "away",
                          parseInt(e.target.value),
                        )
                      }
                    />
                  </Box>

                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 2,
                      width: "150px",
                    }}
                  >
                    <Typography sx={{ fontSize: "0.9rem", textAlign: "right" }}>
                      {m.away_name}
                    </Typography>
                    <Avatar
                      src={m.away_flag}
                      sx={{ height: 24, width: 36 }}
                      variant="rounded"
                    />
                  </Box>
                </Box>
              )}
            </Paper>
          );
        })}

        <Box sx={{ display: "flex", gap: 4, mt: 2 }}>
          {/* Standing Selections */}
          <Box sx={{ flex: 1 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Official Picks
            </Typography>
            <StandingSelector
              label="Group Winner"
              value={filteredStandings?.w_id}
              options={currentGroupStandings}
              projectedId={currentGroupStandings[0]?.teamId}
              onChange={(id) => handleStandingSave("winner", id)}
              isDuplicate={hasWinnerDuplicate}
            />
            <StandingSelector
              label="Runner Up"
              value={filteredStandings?.r_id}
              options={currentGroupStandings}
              projectedId={currentGroupStandings[1]?.teamId}
              onChange={(id) => handleStandingSave("runnerUp", id)}
              isDuplicate={hasRunnerUpDuplicate}
            />
            <StandingSelector
              label="Third Place"
              value={filteredStandings?.t_id}
              options={currentGroupStandings}
              projectedId={currentGroupStandings[2]?.teamId}
              onChange={(id) => handleStandingSave("third", id)}
              isDuplicate={hasThirdDuplicate}
            />
          </Box>

          {/* Calculated Standings Table */}
          <Box sx={{ flex: 1 }}>
            <TableContainer
              component={Paper}
              variant="outlined"
              sx={{ borderRadius: 3 }}
            >
              <Table size="small">
                <TableHead sx={{ bgcolor: "action.hover" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Team</TableCell>
                    <TableCell align="center">P</TableCell>
                    <TableCell align="center">GD</TableCell>
                    <TableCell align="center" sx={{ fontWeight: "bold" }}>
                      Pts
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentGroupStandings.map((team, idx) => (
                    <TableRow
                      key={team.teamId}
                      sx={{
                        "&:nth-of-type(-n+2)": { bgcolor: "primary.50" },
                        "&:nth-of-type(3)": { bgcolor: "info.50" },
                      }}
                    >
                      <TableCell
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="caption"
                          sx={{ color: "text.secondary", width: 12 }}
                        >
                          {idx + 1}
                        </Typography>
                        <Avatar
                          src={team.flagUrl}
                          variant="rounded"
                          sx={{ width: 24, height: 16 }}
                        />
                        <Typography variant="body2">{team.teamName}</Typography>
                      </TableCell>
                      <TableCell align="center">{team.played}</TableCell>
                      <TableCell align="center">
                        {team.gd > 0 ? `+${team.gd}` : team.gd}
                      </TableCell>
                      <TableCell align="center" sx={{ fontWeight: "bold" }}>
                        {team.points}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
