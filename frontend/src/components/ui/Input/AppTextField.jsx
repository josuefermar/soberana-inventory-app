import TextField from '@mui/material/TextField';

/**
 * Application text field. Standardized with error handling support.
 * Presentation-only; no API calls.
 * @param {import('@mui/material/TextField').TextFieldProps} props
 */
export function AppTextField({
  error,
  helperText,
  fullWidth = true,
  margin = 'normal',
  variant = 'outlined',
  ...props
}) {
  return (
    <TextField
      fullWidth={fullWidth}
      margin={margin}
      variant={variant}
      error={Boolean(error)}
      helperText={helperText ?? error}
      {...props}
    />
  );
}
