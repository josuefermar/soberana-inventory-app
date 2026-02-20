import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { setStoredLanguage, supportedLngs } from '../../../i18n';

const labels = { en: 'English', es: 'Español' };

/**
 * Language selector. Persists choice to localStorage via i18n.
 */
export function LanguageSelector() {
  const { i18n } = useTranslation();
  const current = i18n.language && supportedLngs.includes(i18n.language) ? i18n.language : 'en';

  return (
    <FormControl size="small" sx={{ minWidth: 100 }}>
      <InputLabel id="language-label">Lang</InputLabel>
      <Select
        labelId="language-label"
        value={current}
        label="Lang"
        onChange={(e) => setStoredLanguage(e.target.value)}
        sx={{ color: 'primary.contrastText', '.MuiOutlinedInput-notchedOutline': { borderColor: 'rgba(255,255,255,0.3)' } }}
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
