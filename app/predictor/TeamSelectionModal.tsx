"use client";

import {
  Avatar,
  Dialog,
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import { Team } from "./types";

interface TeamSelectionModalProps {
  open: boolean;
  onClose: () => void;
  availableTeams: Team[];
  onSelect: (teamId: number) => void;
  stageName: string;
}

export default function TeamSelectionModal({
  open,
  onClose,
  availableTeams,
  onSelect,
  stageName,
}: TeamSelectionModalProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Select team for {stageName}</DialogTitle>
      <DialogContent dividers sx={{ p: 0 }}>
        <List>
          {availableTeams.map((team) => (
            <ListItem disablePadding key={team.id}>
              <ListItemButton
                onClick={() => {
                  onSelect(team.id);
                  onClose();
                }}
              >
                <ListItemAvatar>
                  <Avatar src={team.flag_url} variant="rounded" />
                </ListItemAvatar>
                <ListItemText primary={team.name} secondary={team.group_name} />
              </ListItemButton>
            </ListItem>
          ))}
          {availableTeams.length === 0 && (
            <Typography
              sx={{ p: 3, textAlign: "center", color: "text.secondary" }}
            >
              No teams available. Complete previous stages first.
            </Typography>
          )}
        </List>
      </DialogContent>
    </Dialog>
  );
}
