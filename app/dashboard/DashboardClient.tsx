"use client";

import { createLeague, joinLeague } from "@/app/actions/league-actions";
import { Add as AddIcon, GroupAdd as GroupAddIcon } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { LeagueDetails } from "./page";

export default function DashboardClient({
  leagues,
}: {
  leagues: LeagueDetails[];
}) {
  const [openCreate, setOpenCreate] = useState(false);
  const [openJoin, setOpenJoin] = useState(false);

  return (
    <Box>
      {/* Action Buttons */}
      <Box component="div" sx={{ display: "flex", gap: 2, mb: 4 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreate(true)}
        >
          Create League
        </Button>
        <Button
          variant="outlined"
          startIcon={<GroupAddIcon />}
          onClick={() => setOpenJoin(true)}
        >
          Join League
        </Button>
      </Box>

      {/* Leagues Grid */}
      <Typography variant="h5">My Leagues</Typography>
      {leagues.length === 0 ? (
        <Typography color="text.secondary">
          You have not joined any leagues yet.
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {leagues.map((league) => (
            <Grid key={league.id}>
              <Card variant="outlined" sx={{ height: "100%" }}>
                <CardActionArea
                  href={`/dashboard/${league.id}`}
                  sx={{ height: "100%" }}
                >
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      {league.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {league.member_count}{" "}
                      {league.member_count === 1 ? "Member" : "Members"}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ bgcolor: "grey.200", p: 0.5, borderRadius: 1 }}
                    >
                      Code: {league.invite_code}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* CREATE LEAGUE MODAL */}
      <Dialog open={openCreate} onClose={() => setOpenCreate(false)}>
        <form
          action={async (formData) => {
            await createLeague(formData);
            setOpenCreate(false);
          }}
        >
          <DialogTitle>Create a New League</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="leagueName"
              label="League Name"
              fullWidth
              required
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* JOIN LEAGUE MODAL */}
      <Dialog open={openJoin} onClose={() => setOpenJoin(false)}>
        <form
          action={async (formData) => {
            await joinLeague(formData);
            setOpenJoin(false);
          }}
        >
          <DialogTitle>Join a League</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              name="inviteCode"
              label="Invite Code"
              fullWidth
              required
              variant="outlined"
              //   inputProps={{ style: { textTransform: "uppercase" } }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenJoin(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Join
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
