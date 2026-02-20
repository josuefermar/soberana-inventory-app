import { Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../../context/AuthContext';
import { PageContainer } from '../../../components/layout';
import { AppButton } from '../../../components/ui';
import { ROLES } from '../../../constants';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const role = user?.role ?? '';

  return (
    <PageContainer maxWidth="md">
      <Typography variant="h5" gutterBottom>
        {t('dashboard.welcome')}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        {t('dashboard.role')}: {role}
      </Typography>
      <Stack spacing={2}>
        {role === ROLES.ADMIN && (
          <>
            <AppButton onClick={() => navigate('/users')}>
              {t('dashboard.manageUsers')}
            </AppButton>
            <AppButton onClick={() => navigate('/create-session')}>
              {t('dashboard.createSession')}
            </AppButton>
            <AppButton onClick={() => navigate('/admin-sessions')}>
              {t('dashboard.inventorySessions')}
            </AppButton>
            <AppButton onClick={() => navigate('/measures')}>
              {t('dashboard.measurementUnits')}
            </AppButton>
            <AppButton onClick={() => navigate('/feature-flags')}>
              {t('dashboard.featureFlags')}
            </AppButton>
            <AppButton
              variant="outlined"
              color="secondary"
              onClick={() => navigate('/users')}
            >
              {t('dashboard.syncUsers')}
            </AppButton>
          </>
        )}
        {role === ROLES.WAREHOUSE_MANAGER && (
          <>
            <AppButton onClick={() => navigate('/create-session')}>
              {t('dashboard.createSession')}
            </AppButton>
            <AppButton
              onClick={() => {
                const sessionId = prompt(t('dashboard.enterSessionId'));
                if (sessionId) navigate(`/register-count/${sessionId}`);
              }}
            >
              {t('dashboard.registerCount')}
            </AppButton>
          </>
        )}
        {role === ROLES.PROCESS_LEADER && (
          <AppButton
            onClick={() => {
              const sessionId = prompt(t('dashboard.enterSessionId'));
              if (sessionId) navigate(`/view-counts/${sessionId}`);
            }}
          >
            {t('dashboard.viewCounts')}
          </AppButton>
        )}
      </Stack>
    </PageContainer>
  );
}
