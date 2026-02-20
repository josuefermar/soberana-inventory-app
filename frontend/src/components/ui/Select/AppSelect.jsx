import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

/**
 * Application select. Wraps MUI TextField select with consistent styling.
 * @param {Object} props
 * @param {Array<{ value: string | number; label: string }>} props.options
 * @param {import('@mui/material/TextField').TextFieldProps} props.rest
 */
export function AppSelect({ options = [], fullWidth = true, margin = 'normal', ...rest }) {
  return (
    <TextField select fullWidth margin={margin} variant="outlined" {...rest}>
      {options.map((opt) => (
        <MenuItem key={String(opt.value)} value={opt.value}>
          {opt.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
