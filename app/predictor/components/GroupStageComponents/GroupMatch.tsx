"use client";

import {
  alpha,
  Avatar,
  Box,
  Divider,
  Paper,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import { Match } from "../../types";

export default function GroupMatch({ m }: { m: Match }) {
  const theme = useTheme();
  const isFinished = m.status === "Match Finished" ? true : false;

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

  const isGroupStageGame = m.stage.includes("Group Stage");

  return (
    <Paper
      key={m.api_fixture_id}
      elevation={0}
      sx={{
        transition: "transform 0.2s, border-color 0.2s",
        "&:hover": {
          borderColor: "text.disabled",
          transform: "translateY(-2px)",
        },
      }}
    >
      <Paper
        sx={{
          bgcolor:
            m.status !== "Not Started" && m.status !== "Match Finished"
              ? theme.palette.grey[100]
              : theme.palette.primary.main,
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
          color={
            m.status !== "Not Started" && m.status !== "Match Finished"
              ? "primary"
              : "textPrimary"
          }
          sx={{
            textAlign: "center",
            fontWeight: "bold",
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
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
        }}
      >
        {isGroupStageGame && (
          <Stack
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 1,
              width: "100%",
            }}
          >
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              PREDICTION
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flex: 1,
              }}
            >
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
                {m.home_code}
              </Typography>
              <Box
                sx={{
                  px: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: (theme) =>
                    alpha(theme.palette.action.disabledBackground, 0.04),
                  borderRadius: 1, // Subtle rounding
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: "1rem",
                    color: "text.primary",
                    textAlign: "center",
                  }}
                >
                  {m.home_goals_predicted ?? "-"}
                </Typography>
              </Box>
            </Box>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                flex: 1,
              }}
            >
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
                {m.away_code}
              </Typography>
              <Box
                sx={{
                  px: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: (theme) =>
                    alpha(theme.palette.action.disabledBackground, 0.04),
                  borderRadius: 1, // Subtle rounding
                  border: 1,
                  borderColor: "divider",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: "bold",
                    fontSize: "1rem",
                    color: "text.primary",
                    textAlign: "center",
                  }}
                >
                  {m.away_goals_predicted ?? "-"}
                </Typography>
              </Box>
            </Box>
          </Stack>
        )}
        <Divider orientation="vertical" flexItem />
        <Stack
          sx={{
            display: "flex",
            flexDirection: isGroupStageGame ? "column" : "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
            width: "100%",
            py: !isGroupStageGame ? 1 : 0,
          }}
        >
          {isGroupStageGame && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              ACTUAL
            </Typography>
          )}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flex: 1,
              justifyContent: "flex-end",
            }}
          >
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
              {m.home_code}
            </Typography>
            <Box
              sx={{
                px: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: (theme) =>
                  alpha(theme.palette.action.disabledBackground, 0.04),
                borderRadius: 1, // Subtle rounding
                border: 1,
                borderColor: "divider",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "1rem",
                  color: "text.primary",
                  textAlign: "center",
                }}
              >
                {m.status === "Not Started"
                  ? "-"
                  : (m.home_goals_actual ?? "-")}
              </Typography>
            </Box>
          </Box>
          {!isGroupStageGame && (
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              vs.
            </Typography>
          )}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              flex: 1,
              justifyContent: "flex-start",
            }}
          >
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
              {m.away_code}
            </Typography>
            <Box
              sx={{
                px: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: (theme) =>
                  alpha(theme.palette.action.disabledBackground, 0.04),
                borderRadius: 1, // Subtle rounding
                border: 1,
                borderColor: "divider",
              }}
            >
              <Typography
                sx={{
                  fontWeight: "bold",
                  fontSize: "1rem",
                  color: "text.primary",
                  textAlign: "center",
                }}
              >
                {m.status === "Not Started"
                  ? "-"
                  : (m.away_goals_actual ?? "-")}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Stack>
      {isGroupStageGame && (
        <Stack
          direction={"row"}
          sx={{
            display: "flex",
            gap: 1,
            justifyContent: "center",
            alignItems: "center",
            mt: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{
              textAlign: "center",
              fontWeight: 600,
              letterSpacing: 0.3,
              display: "flex",
              color: "text.secondary",
              justifyContent: "center",
            }}
          >
            {m.city.includes("San Fran")
              ? "San Francisco"
              : m.city.includes("New York")
                ? "New York"
                : m.city}
          </Typography>
          <Divider
            flexItem
            orientation="vertical"
            sx={{ color: "text.secondary" }}
          />
          <Typography
            variant="caption"
            sx={{
              textAlign: "center",
              fontWeight: 600,
              letterSpacing: 0.3,
              display: "flex",
              justifyContent: "center",
              color: "text.secondary",
            }}
          >
            {m.stage}
          </Typography>
        </Stack>
      )}
      <Paper
        sx={{
          bgcolor:
            isFinished && m.points_earned && m.points_earned > 1
              ? theme.palette.success.light
              : isFinished && m.points_earned && m.points_earned == 0
                ? theme.palette.error.light
                : isFinished && m.points_earned && m.points_earned == 1
                  ? theme.palette.warning.dark
                  : theme.palette.divider,
          width: "100%",
          borderTopLeftRadius: 2,
          borderTopRightRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 0.25,
          mt: 1,
        }}
      >
        {isGroupStageGame ? (
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
            Points Earned: {isFinished ? m.points_earned : "N/A"}
          </Typography>
        ) : (
          <Typography
            variant="caption"
            sx={{
              textAlign: "center",
              // mt: 2,
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
        )}
      </Paper>
    </Paper>
  );
}
