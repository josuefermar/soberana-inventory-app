import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { setStoredLanguage, supportedLngs } from '../../../i18n';

const labels = { en: 'English', es: 'Español' };

/**
 * Language selector. Persists choice to localStorage via i18n.
 * Always shows selected language; uses theme colors so text is never hidden (e.g. white on white).
 */
export function LanguageSelector() {
  const { t, i18n } = useTranslation();
  const base = (i18n.language || i18n.resolvedLanguage || 'en').split('-')[0];
  const current = supportedLngs.includes(base) ? base : 'en';
  const label = t('common.language');

  return (
    <FormControl size="small" sx={{ minWidth: 120 }}>
      <InputLabel id="language-label" sx={{ color: 'text.secondary' }}>
        {label}
      </InputLabel>
      <Select
        labelId="language-label"
        value={current}
        label={label}
        onChange={(e) => setStoredLanguage(e.target.value)}
        renderValue={(value) => labels[value] ?? value}
        sx={{
          color: 'text.primary',
          backgroundColor: 'background.paper',
          '.MuiOutlinedInput-notchedOutline': { borderColor: 'divider' },
          '& .MuiSelect-select': { color: 'text.primary' },
        }}
      >
        {supportedLngs.map((lng) => (
          <MenuItem key={lng} value={lng}>
            {labels[lng] ?? lng}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
