import { createTheme } from '@mui/material/styles';

// Soberana S.A.S — Corporativo, confianza, claridad (sector alimentos)
const primaryPalette = {
  dark: '#1B6E33',
  main: '#2E7D32', // Verde corporativo principal
  light: '#4CAF50',
};

const secondaryPalette = {
  dark: '#E6B800',
  main: '#F4C430', // Amarillo suave para alertas
  light: '#FFD95A',
};

const lightPalette = {
  mode: 'light',
  primary: {
    main: primaryPalette.main,
    light: primaryPalette.light,
    dark: primaryPalette.dark,
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: secondaryPalette.main,
    light: secondaryPalette.light,
    dark: secondaryPalette.dark,
    contrastText: '#212121',
  },
  error: {
    main: '#C62828', // Rojo suave para diferencias/errores
    light: '#EF5350',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: secondaryPalette.dark,
    light: secondaryPalette.main,
    dark: '#B38600',
    contrastText: '#212121',
  },
  success: {
    main: primaryPalette.dark,
    light: primaryPalette.main,
    dark: '#124D24',
    contrastText: '#FFFFFF',
  },
  info: {
    main: primaryPalette.light,
    light: '#81C784',
    dark: primaryPalette.main,
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F5F5F5',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#212121',
    secondary: '#616161',
    disabled: '#9E9E9E',
  },
};

const darkPalette = {
  mode: 'dark',
  primary: {
    main: primaryPalette.light,
    light: '#81C784',
    dark: primaryPalette.main,
    contrastText: '#FFFFFF',
  },
  secondary: {
    main: secondaryPalette.main,
    light: secondaryPalette.light,
    dark: secondaryPalette.dark,
    contrastText: '#212121',
  },
  error: {
    main: '#EF5350',
    contrastText: '#FFFFFF',
  },
  warning: {
    main: secondaryPalette.dark,
    light: secondaryPalette.main,
    dark: '#B38600',
    contrastText: '#212121',
  },
  success: {
    main: primaryPalette.main,
    light: primaryPalette.light,
    dark: primaryPalette.dark,
    contrastText: '#FFFFFF',
  },
  info: {
    main: primaryPalette.light,
    light: '#81C784',
    dark: primaryPalette.main,
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#121212',
    paper: '#1E1E1E',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#B0B0B0',
    disabled: '#6B6B6B',
  },
};

const shape = {
  borderRadius: 10,
};

const typography = {
  fontFamily: '"Open Sans", "Roboto", sans-serif',
  h1: { fontWeight: 700, fontSize: '2rem' },
  h2: { fontWeight: 600, fontSize: '1.75rem' },
  h3: { fontWeight: 600, fontSize: '1.5rem' },
  h4: { fontWeight: 600, fontSize: '1.25rem' },
  h5: { fontWeight: 600, fontSize: '1.125rem' },
  h6: { fontWeight: 600, fontSize: '1rem' },
  body1: { fontWeight: 400 },
  button: {
    textTransform: 'none',
    fontWeight: 600,
  },
};

const getComponentOverrides = (palette) => ({
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadius,
        textTransform: 'none',
        boxShadow: '0px 1px 3px rgba(0,0,0,0.12)',
        '&:hover': {
          boxShadow: '0px 2px 6px rgba(0,0,0,0.16)',
        },
      },
      containedPrimary: {
        '&:hover': {
          backgroundColor: palette.primary.dark,
        },
      },
      containedSecondary: {
        '&:hover': {
          backgroundColor: palette.secondary.dark,
        },
      },
      contained: {
        '&:disabled': {
          boxShadow: 'none',
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: palette.mode === 'light' ? '#FFFFFF' : palette.background.paper,
        color: palette.text.primary,
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadius,
        boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadius,
        boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
        border: '1px solid',
        borderColor: palette.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      variant: 'outlined',
    },
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: shape.borderRadius,
          backgroundColor: palette.mode === 'light' ? '#FFFFFF' : undefined,
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.primary.main,
            borderWidth: 2,
          },
          '&.Mui-focused fieldset': {
            borderColor: palette.primary.main,
          },
        },
        '& .MuiInputLabel-root.Mui-focused': {
          color: palette.primary.main,
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontWeight: 500,
      },
      colorDefault: {
        backgroundColor: palette.mode === 'light' ? '#F5F5F5' : 'rgba(255,255,255,0.08)',
        color: palette.text.secondary,
      },
      colorSuccess: {
        backgroundColor: palette.mode === 'light' ? 'rgba(46, 125, 50, 0.12)' : undefined,
      },
      colorWarning: {
        backgroundColor: palette.mode === 'light' ? 'rgba(244, 196, 48, 0.2)' : undefined,
      },
      colorError: {
        backgroundColor: palette.mode === 'light' ? 'rgba(198, 40, 40, 0.12)' : undefined,
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: shape.borderRadius,
      },
      standardWarning: {
        backgroundColor: palette.mode === 'light' ? 'rgba(244, 196, 48, 0.15)' : undefined,
        color: palette.mode === 'light' ? '#5D4E37' : undefined,
      },
      standardError: {
        backgroundColor: palette.mode === 'light' ? 'rgba(198, 40, 40, 0.1)' : undefined,
      },
    },
  },
});

/**
 * @param {'light' | 'dark'} mode
 * @returns {import('@mui/material/styles').Theme}
 */
export function createAppTheme(mode = 'light') {
  const palette = mode === 'dark' ? darkPalette : lightPalette;
  return createTheme({
    palette,
    shape,
    typography,
    components: getComponentOverrides(palette),
  });
}
