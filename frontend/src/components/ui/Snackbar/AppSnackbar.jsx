import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

const DEFAULT_ANCHOR = { vertical: 'bottom', horizontal: 'center' };
const DEFAULT_AUTO_HIDE = 6000;

/**
 * Application snackbar with Alert. Consistent placement and duration.
 * @param {Object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {string} [props.message]
 * @param {'error'|'warning'|'info'|'success'} [props.severity='success']
 * @param {number} [props.autoHideDuration]
 */
export function AppSnackbar({
  open,
  onClose,
  message = '',
  severity = 'success',
  autoHideDuration = DEFAULT_AUTO_HIDE,
  anchorOrigin = DEFAULT_ANCHOR,
  ...rest
}) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
      {...rest}
    >
      <Alert onClose={onClose} severity={severity} variant="filled">
        {message}
      </Alert>
    </Snackbar>
  );
}
