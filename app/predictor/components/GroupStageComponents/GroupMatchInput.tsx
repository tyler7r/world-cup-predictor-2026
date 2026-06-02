"use client";
import {
  Avatar,
  Box,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { Match } from "../../types";

export type GroupMatchProps = {
  m: Match;
  onScoreChange: (
    matchId: number,
    team: "home" | "away",
    score: number,
  ) => void;
  savePrediction: (match: Match, team: "home" | "away", value: string) => void;
};

export const GroupMatchInput = ({
  m,
  onScoreChange,
  savePrediction,
}: GroupMatchProps) => {
  const theme = useTheme();

  const formatKickoffTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const time = date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
    const d = date.toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
    });
    return `${d} - ${time}`;
  };

  return (
    <Paper
      key={m.api_fixture_id}
      elevation={0}
      sx={{
        mb: 1,
        pb: 1,
        transition: "transform 0.2s, border-color 0.2s",
        "&:hover": {
          borderColor: "text.disabled",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Paper
        sx={{
          bgcolor: theme.palette.primary.main,
          width: "100%",
          borderBottomLeftRadius: 2,
          borderBottomRightRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0.25,
          mb: 1,
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
          {`${formatKickoffTime(m.kickoff_time)} / ${m.status}`}
        </Typography>
      </Paper>
      <Stack
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flex: 1,
            justifyContent: "flex-end",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.65rem",
              fontWeight: 600,
              mr: -0.5,
            }}
          >
            (#{m.home_rank})
          </Typography>
          <Avatar
            src={m.home_flag}
            variant="rounded"
            sx={{ width: 32, height: 24 }}
          />
          <Typography
            sx={{
              fontSize: "0.95rem",
              fontWeight: 600,
              textAlign: "right",
              fontStyle: "italic",
            }}
          >
            {m.home_name}
          </Typography>
          <TextField
            type="number"
            variant="standard"
            value={m.home_goals_predicted ?? ""}
            slotProps={{
              input: { disableUnderline: true },
              htmlInput: { min: 0 },
            }}
            sx={{
              width: "40px",
              "& input": {
                textAlign: "center",
                fontWeight: "bold",
              },
              "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                {
                  display: "none",
                  WebkitAppearance: "none",
                  margin: 0,
                },
              "& input[type=number]": {
                MozAppearance: "textfield",
              },
              "&:focus-within": {
                boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}`,
              },
            }}
            onBlur={(e) => savePrediction(m, "home", e.target.value)}
            onChange={(e) =>
              onScoreChange(m.api_fixture_id, "home", parseInt(e.target.value))
            }
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              px: 0.5,
              fontSize: 14,
            }}
          >
            vs.
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            flex: 1,
            justifyContent: "flex-start",
          }}
        >
          <Typography
            sx={{
              fontSize: "0.65rem",
              fontWeight: 600,
              mr: -0.5,
            }}
          >
            (#{m.away_rank})
          </Typography>
          <Avatar
            src={m.away_flag}
            variant="rounded"
            sx={{ width: 32, height: 24 }}
          />
          <Typography
            sx={{
              fontSize: "0.95rem",
              fontWeight: 600,
              textAlign: "left",
              fontStyle: "italic",
            }}
          >
            {m.away_name}
          </Typography>
          <TextField
            type="number"
            variant="standard"
            value={m.away_goals_predicted ?? ""}
            slotProps={{
              input: { disableUnderline: true },
              htmlInput: { min: 0 },
            }}
            sx={{
              width: "40px",
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              "& input": {
                textAlign: "center",
                fontWeight: "bold",
              },
              "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                {
                  display: "none",
                  WebkitAppearance: "none",
                  margin: 0,
                },
              "& input[type=number]": {
                MozAppearance: "textfield",
              },
              "&:focus-within": {
                boxShadow: (theme) => `0 0 0 2px ${theme.palette.primary.main}`,
              },
            }}
            onBlur={(e) => savePrediction(m, "away", e.target.value)}
            onChange={(e) =>
              onScoreChange(m.api_fixture_id, "away", parseInt(e.target.value))
            }
          />
        </Box>
      </Stack>
      <Typography
        variant="caption"
        sx={{
          textAlign: "center",
          mt: 1,
          fontWeight: 600,
          letterSpacing: 0.5,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          color: "text.secondary",
        }}
      >
        {m.venue} / {m.stage}
      </Typography>
    </Paper>
  );
};
