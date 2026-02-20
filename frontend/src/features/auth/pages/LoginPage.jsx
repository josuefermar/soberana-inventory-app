import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '../../../components/layout';
import { AppButton, AppTextField } from '../../../components/ui';
import { useLogin } from '../hooks';

export function LoginPage() {
  const { t } = useTranslation();
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  } = useLogin();

  return (
    <PageContainer maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        {t('login.title')}
      </Typography>
      <form onSubmit={handleSubmit}>
        <AppTextField
          label={t('login.email')}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <AppTextField
          label={t('login.password')}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
        <AppButton type="submit" fullWidth sx={{ mt: 2 }} disabled={loading}>
          {loading ? t('login.loggingIn') : t('login.submit')}
        </AppButton>
      </form>
    </PageContainer>
  );
}
