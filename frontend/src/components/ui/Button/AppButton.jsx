import MuiButton from '@mui/material/Button';

/**
 * Application button. Wraps MUI Button with consistent variant and theme.
 * Presentation-only; no business logic.
 * @param {import('@mui/material/Button').ButtonProps} props
 */
export function AppButton({ variant = 'contained', color = 'primary', ...props }) {
  return <MuiButton variant={variant} color={color} {...props} />;
}
