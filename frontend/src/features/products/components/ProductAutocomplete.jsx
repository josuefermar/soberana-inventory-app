import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

/**
 * Options: array of { id: string, label: string } (e.g. from getProducts mapped).
 * valueIds: array of product ids (multiple selection).
 * onChange: (ids: string[]) => void.
 */
export function ProductAutocomplete({
  options = [],
  valueIds = [],
  onChange,
  label,
  placeholder,
  margin = 'normal',
  fullWidth = true,
  disabled = false,
}) {
  const value = options.filter((o) => valueIds.includes(o.id));

  const handleChange = (_event, newValue) => {
    onChange(Array.isArray(newValue) ? newValue.map((x) => x.id) : []);
  };

  return (
    <Autocomplete
      multiple
      options={options}
      getOptionLabel={(opt) => opt.label ?? opt.id}
      value={value}
      onChange={handleChange}
      isOptionEqualToValue={(opt, val) => opt.id === val.id}
      fullWidth={fullWidth}
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          margin={margin}
          variant="outlined"
        />
      )}
    />
  );
}
