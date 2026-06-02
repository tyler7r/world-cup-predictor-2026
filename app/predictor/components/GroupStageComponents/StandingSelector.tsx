"use client";

import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  Avatar,
  Box,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material";
import { GroupStanding } from "../../types";

interface StandingSelectorProps {
  label: string;
  value: number | null | undefined;
  options: GroupStanding[];
  projectedId: number | null | undefined;
  onChange: (id: number) => void;
  isDuplicate: boolean;
  isLocked: boolean; // New Prop
  standings: { id: number; flag: string; name: string; name_code: string };
}

export default function StandingSelector({
  label,
  value,
  options,
  projectedId,
  onChange,
  isDuplicate,
}: StandingSelectorProps) {
  const isMismatch = value && projectedId && value !== projectedId;

  return (
    <FormControl fullWidth size="small" sx={{ mt: 1.5 }} error={isDuplicate}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value || ""}
        label={label}
        onChange={(e) => onChange(Number(e.target.value))}
        // Ensures the selected value inside the input box is also flex-aligned
        renderValue={(selectedId) => {
          const team = options.find((t) => t.teamId === selectedId);
          return (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Avatar
                src={team?.flagUrl}
                variant="rounded"
                sx={{ width: 24, height: 18 }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {team?.teamName}
              </Typography>
            </Box>
          );
        }}
      >
        {options.map((team) => (
          <MenuItem
            key={team.teamId}
            value={team.teamId}
            sx={{
              display: "flex",
              alignItems: "center", // Vertical center
              gap: 1.5,
              py: 1,
            }}
          >
            <Avatar
              src={team.flagUrl}
              variant="rounded"
              sx={{ width: 24, height: 18, flexShrink: 0 }}
            />
            {/* Using Typography with flex-grow ensures text stays on one line next to flag */}
            <Typography variant="body2" sx={{ fontWeight: 600, flexGrow: 1 }}>
              {team.teamName}
              <Box
                component="span"
                sx={{ fontWeight: 400, color: "text.secondary", ml: 0.5 }}
              >
                {projectedId === team.teamId ? "(Projected)" : ""}
              </Box>
            </Typography>
          </MenuItem>
        ))}
      </Select>

      {/* Error/Warning Messages */}
      {isDuplicate && (
        <FormHelperText
          sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
        >
          <ErrorOutlineOutlinedIcon sx={{ fontSize: "1rem" }} /> This team is
          selected twice
        </FormHelperText>
      )}
      {!isDuplicate && isMismatch && (
        <FormHelperText
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            color: "warning.main",
          }}
        >
          <WarningAmberIcon sx={{ fontSize: "1rem" }} /> Mismatch with
          calculated predictions
        </FormHelperText>
      )}
    </FormControl>
  );
}
