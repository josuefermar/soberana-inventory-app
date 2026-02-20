import { Box, Button, Typography } from '@mui/material';

/**
 * Presentational fallback UI when an error boundary catches an error.
 * Dumb component: props only.
 * @param {Object} props
 * @param {Error} [props.error]
 * @param {() => void} [props.resetErrorBoundary] - Called when user clicks Retry
 */
export function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '40vh',
        px: 2,
        textAlign: 'center',
      }}
    >
      <Typography variant="h6" color="error" gutterBottom>
        Something went wrong
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {error?.message ?? 'An unexpected error occurred.'}
      </Typography>
      {typeof resetErrorBoundary === 'function' && (
        <Button variant="contained" color="primary" onClick={resetErrorBoundary}>
          Retry
        </Button>
      )}
    </Box>
  );
}
