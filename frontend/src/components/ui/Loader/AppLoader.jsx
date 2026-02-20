import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

/**
 * Application loading indicator. Optional message.
 * @param {Object} props
 * @param {string} [props.message]
 */
export function AppLoader({ message = 'Loading...' }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
      <CircularProgress size={24} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );
}
