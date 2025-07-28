import { createTheme } from '@mui/material/styles';

// Student Hub Theme - Based on README color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#2563EB', // Blue-600 - Primary buttons, highlights
      light: '#3B82F6', // Blue-500
      dark: '#1E40AF', // Blue-700
    },
    secondary: {
      main: '#475569', // Slate-600 - Secondary text, icons
      light: '#64748B', // Slate-500
      dark: '#334155', // Slate-700
    },
    success: {
      main: '#16A34A', // Green-600 - "Open Chat", positive actions
      light: '#22C55E', // Green-500
      dark: '#15803D', // Green-700
    },
    error: {
      main: '#DC2626', // Red-600 - Errors, delete actions
      light: '#EF4444', // Red-500
      dark: '#B91C1C', // Red-700
    },
    warning: {
      main: '#D97706', // Amber-600
      light: '#F59E0B', // Amber-500
      dark: '#B45309', // Amber-700
    },
    info: {
      main: '#0891B2', // Cyan-600
      light: '#06B6D4', // Cyan-500
      dark: '#0E7490', // Cyan-700
    },
    background: {
      default: '#F3F4F6', // Gray-100 - Page background
      paper: '#FFFFFF', // White - Cards, modals
    },
    text: {
      primary: '#1F2937', // Gray-900 - Headings, main text
      secondary: '#6B7280', // Gray-500 - Helper text, timestamps
    },
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.43,
    },
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
});

export default theme;
