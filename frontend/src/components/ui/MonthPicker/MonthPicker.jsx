import dayjs from 'dayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

/**
 * Month/year picker using MUI X Date Picker.
 * Value is string 'YYYY-MM' or empty string; opens calendar on field click.
 * @param {{ value: string; onChange: (value: string) => void; label?: string; required?: boolean; size?: 'small' | 'medium'; sx?: object; slotProps?: object }} props
 */
export function MonthPicker({ value, onChange, label, required, size, sx, slotProps, ...rest }) {
  const dateValue = value && value.length >= 7 ? dayjs(`${value}-01`) : null;

  const handleChange = (date) => {
    onChange(date ? date.format('YYYY-MM') : '');
  };

  return (
    <DatePicker
      label={label}
      value={dateValue}
      onChange={handleChange}
      views={['year', 'month']}
      openTo="month"
      format="MMMM YYYY"
      slotProps={{
        textField: {
          fullWidth: true,
          required: Boolean(required),
          size,
          ...slotProps?.textField,
        },
        ...slotProps,
      }}
      sx={sx}
      {...rest}
    />
  );
}
