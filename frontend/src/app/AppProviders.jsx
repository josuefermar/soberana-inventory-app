import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { createAppTheme } from '../theme/theme';
import { AuthProvider } from '../context/AuthContext';

const theme = createAppTheme('light');

/**
 * Composes all app-level providers (theme, router, auth).
 * No business logic; composition only.
 */
export function AppProviders({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
