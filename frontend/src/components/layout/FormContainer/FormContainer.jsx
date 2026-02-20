import Box from '@mui/material/Box';

/**
 * Wrapper for form content with consistent spacing.
 * @param {import('@mui/material/Box').BoxProps} props
 */
export function FormContainer(props) {
  return <Box component="form" {...props} />;
}
