// theme.ts
import { alpha, createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "rgba(38, 198, 218, 0.9)", // Toned-down, sleek cyan
      light: "rgba(38, 198, 218, 0.5)",
    },
    info: {
      main: "rgb(255, 215, 0)",
    },
    success: {
      main: "rgba(102, 187, 106, 1)",
      light: "rgba(102, 187, 106, 0.5)", // Toned-down, pleasant green
    },
    error: {
      main: "rgba(239, 83, 80, 1)",
      light: "rgba(239, 83, 80, 0.5)", // Soft red for missing ranks
    },
    background: {
      default: "#121212", // Slightly lighter base background
      paper: "#1e1e1e", // Elevated elements like cards
    },
    divider: "rgba(255, 255, 255, 0.08)",
  },
  typography: {
    fontFamily: "'Inter', sans-serif",
    subtitle1: {
      fontWeight: 700,
      letterSpacing: 1,
    },
  },
  components: {
    // Globally style all Paper components (Cards, Tables)
    MuiPaper: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: "none", // Removes MUI's default elevation overlay
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 12, // Global 12px border radius
        }),
      },
    },
    // Globally style the Tabs
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none", // Prevents ALL CAPS
          fontWeight: 600,
          fontSize: "1rem",
          transition: "all 0.2s",
        },
      },
    },
    // Globally clean up standard TextFields
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          "& .MuiInputBase-root": {
            backgroundColor: alpha(theme.palette.common.white, 0.05),
            borderRadius: 8,
          },
        }),
      },
    },
  },
});
