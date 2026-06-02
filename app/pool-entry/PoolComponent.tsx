"use client";

import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import PaidIcon from "@mui/icons-material/Paid";
import {
  Box,
  Button,
  Divider,
  Paper,
  Stack,
  Typography,
  alpha,
} from "@mui/material";

export default function PoolEntryPage({
  totalPot,
  participantCount,
}: {
  totalPot: number;
  participantCount: number;
}) {
  const firstPlacePrize = (totalPot * 0.75).toFixed(2);
  const secondPlacePrize = (totalPot * 0.25).toFixed(2);

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", py: 4, px: 2 }}>
      {/* Prize Pool Display */}
      <Paper
        elevation={0}
        sx={{
          p: 4,
          textAlign: "center",
          borderRadius: 4,
          bgcolor: "primary.main",
          color: "primary.contrastText",
          mb: 4,
          boxShadow: (theme) =>
            `0 10px 30px ${alpha(theme.palette.primary.main, 0.3)}`,
        }}
      >
        <Typography variant="overline" sx={{ letterSpacing: 2, opacity: 0.9 }}>
          CURRENT PRIZE POOL
        </Typography>
        <Typography variant="h1" sx={{ fontWeight: 900, my: 1 }}>
          ${totalPot}
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.8 }}>
          Across {participantCount} verified entries
        </Typography>
      </Paper>

      {/* The Split Breakdown */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Paper
          variant="outlined"
          sx={{ flex: 1, p: 2, textAlign: "center", borderRadius: 3 }}
        >
          <EmojiEventsIcon sx={{ color: "#FFD700", fontSize: 40 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            ${firstPlacePrize}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            1ST PLACE (75%)
          </Typography>
        </Paper>
        <Paper
          variant="outlined"
          sx={{ flex: 1, p: 2, textAlign: "center", borderRadius: 3 }}
        >
          <EmojiEventsIcon sx={{ color: "#C0C0C0", fontSize: 40 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            ${secondPlacePrize}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            2ND PLACE (25%)
          </Typography>
        </Paper>
      </Stack>

      {/* Action Section */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
          Are you in?
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Entry is $10 USD. Once payment is verified, you will be eligible for
          the cash prizes based on your ranking.
        </Typography>

        <Stack spacing={2}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<PaidIcon />}
            href="https://venmo.com/YOUR_USERNAME"
            target="_blank"
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontSize: "1.1rem",
              fontWeight: 700,
              bgcolor: "#008CFF", // Venmo Blue
              "&:hover": { bgcolor: "#0074D9" },
            }}
          >
            Pay with Venmo
          </Button>

          <Button
            variant="contained"
            fullWidth
            size="large"
            startIcon={<AccountBalanceWalletIcon />}
            href="https://paypal.me/YOUR_USERNAME"
            target="_blank"
            sx={{
              py: 1.5,
              borderRadius: 2,
              fontSize: "1.1rem",
              fontWeight: 700,
              bgcolor: "#003087", // PayPal Blue
              "&:hover": { bgcolor: "#001C64" },
            }}
          >
            Pay with PayPal
          </Button>
        </Stack>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Verification Notice */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: "block", textAlign: "center", fontStyle: "italic" }}
      >
        Note: I will manually verify payments. Your status will update to
        Entered once the transfer is confirmed.
      </Typography>
    </Box>
  );
}
