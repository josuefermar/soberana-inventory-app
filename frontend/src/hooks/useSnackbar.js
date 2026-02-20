import { useCallback, useState } from 'react';

const DEFAULT_STATE = { open: false, message: '', severity: 'success' };

/**
 * Shared snackbar state and controls.
 * @returns {{ snack: { open: boolean; message: string; severity: 'success'|'error'|'warning'|'info' }; showSuccess: (message: string) => void; showError: (message: string) => void; closeSnack: () => void }}
 */
export function useSnackbar() {
  const [snack, setSnack] = useState(DEFAULT_STATE);

  const showSuccess = useCallback((message) => {
    setSnack({ open: true, message, severity: 'success' });
  }, []);

  const showError = useCallback((message) => {
    setSnack({ open: true, message, severity: 'error' });
  }, []);

  const closeSnack = useCallback(() => {
    setSnack((s) => ({ ...s, open: false }));
  }, []);

  return { snack, showSuccess, showError, closeSnack };
}
