import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';

/**
 * Application dialog. Consistent structure: title, content, actions.
 * Presentation-only; controlled via open/onClose.
 * @param {Object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} [props.title]
 * @param {React.ReactNode} [props.children] - Dialog content
 * @param {React.ReactNode} [props.actions] - DialogActions content
 * @param {string} [props.maxWidth] - 'xs' | 'sm' | 'md' | 'lg' | 'xl'
 */
export function AppDialog({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  ...rest
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth={maxWidth} fullWidth={fullWidth} {...rest}>
      {title && <DialogTitle>{title}</DialogTitle>}
      {children != null && <DialogContent>{children}</DialogContent>}
      {actions != null && <DialogActions>{actions}</DialogActions>}
    </Dialog>
  );
}
