import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';

/**
 * Options: array of { id: string, label: string } (e.g. from getWarehouses mapped to id + description).
 * valueIds: single string (id) when multiple=false, or array of strings when multiple=true.
 * onChange: (ids: string | string[]) => void.
 */
export function WarehouseAutocomplete({
  options = [],
  valueIds,
  onChange,
  multiple = false,
  label,
  placeholder,
  margin = 'normal',
  fullWidth = true,
  required = false,
  disabled = false,
}) {
  const value = multiple
    ? options.filter((o) => Array.isArray(valueIds) && valueIds.includes(o.id))
    : options.find((o) => o.id === valueIds) ?? null;

  const handleChange = (_event, newValue) => {
    if (multiple) {
      onChange(Array.isArray(newValue) ? newValue.map((x) => x.id) : []);
    } else {
      onChange(newValue?.id ?? '');
    }
  };

  return (
    <Autocomplete
      multiple={multiple}
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
          required={required && (multiple ? !value?.length : !value)}
          variant="outlined"
        />
      )}
    />
  );
}
