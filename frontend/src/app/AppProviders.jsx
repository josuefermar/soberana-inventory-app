import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTranslation } from 'react-i18next';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/es';
import { createAppTheme } from '../theme/theme';
import { AuthProvider } from '../context/AuthContext';

const theme = createAppTheme('light');

/** Wraps children with date picker localization; adapter locale follows i18n language. */
function DatePickerLocale({ children }) {
  const { i18n } = useTranslation();
  const adapterLocale = i18n.language?.startsWith('es') ? 'es' : 'en';
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={adapterLocale}>
      {children}
    </LocalizationProvider>
  );
}

/**
 * Composes all app-level providers (theme, router, auth, date pickers).
 * No business logic; composition only.
 */
export function AppProviders({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DatePickerLocale>
        <BrowserRouter>
          <AuthProvider>{children}</AuthProvider>
        </BrowserRouter>
      </DatePickerLocale>
    </ThemeProvider>
  );
}
