"use client";

import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { GroupStanding } from "./types"; // Ensure this matches your exported interface from calculateGroupStandings

interface StandingSelectorProps {
  label: string;
  value: number | null | undefined;
  options: GroupStanding[];
  projectedId: number | null | undefined;
  onChange: (id: number) => void;
  isDuplicate: boolean;
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
    <FormControl fullWidth size="small" sx={{ mb: 2 }} error={isDuplicate}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value || ""}
        label={label}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {options.map((team) => (
          <MenuItem key={team.teamId} value={team.teamId}>
            {team.teamName} {projectedId === team.teamId ? "(Projected)" : ""}
          </MenuItem>
        ))}
      </Select>
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
