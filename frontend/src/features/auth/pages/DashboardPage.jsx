import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Typography } from '@mui/material';
import {
  Inventory2 as InventoryIcon,
  AddCircleOutline as CreateSessionIcon,
  People as UsersIcon,
  Straighten as MeasuresIcon,
  Flag as FeatureFlagsIcon,
  Assignment as RegisterCountIcon,
  Visibility as ViewCountsIcon,
  LocalShipping as WarehouseIcon,
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { PageContainer } from '../../../components/layout';
import { AppButton, DashboardCard } from '../../../components/ui';
import { ROLES } from '../../../constants';
import styles from './DashboardPage.module.scss';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const role = user?.role ?? '';

  const handleSessionPrompt = (pathPrefix) => {
    const sessionId = prompt(t('dashboard.enterSessionId'));
    if (sessionId) navigate(`${pathPrefix}/${sessionId}`);
  };

  return (
    <PageContainer maxWidth="lg">
      <section className={styles.welcomeSection}>
        <Typography variant="h4" className={styles.pageTitle}>
          {t('dashboard.welcome')}
        </Typography>
        <Typography variant="body1" className={styles.subtitle}>
          {t('dashboard.role')}: <strong>{role}</strong>
        </Typography>
      </section>

      <Typography variant="h6" className={styles.pageTitle} component="h2">
        {t('dashboard.title')}
      </Typography>
      <div className={styles.cardsGrid}>
        {role === ROLES.ADMIN && (
          <>
            <DashboardCard
              icon={<UsersIcon fontSize="medium" />}
              title={t('dashboard.manageUsers')}
              description={t('users.title')}
              accent="green"
              action={
                <AppButton size="small" onClick={() => navigate('/users')}>
                  {t('dashboard.manageUsers')}
                </AppButton>
              }
            />
            <DashboardCard
              icon={<CreateSessionIcon fontSize="medium" />}
              title={t('dashboard.createSession')}
              description={t('inventorySessions.title')}
              accent="green"
              action={
                <AppButton size="small" onClick={() => navigate('/create-session')}>
                  {t('dashboard.createSession')}
                </AppButton>
              }
            />
            <DashboardCard
              icon={<InventoryIcon fontSize="medium" />}
              title={t('dashboard.inventorySessions')}
              description={t('inventorySessions.adminSessionsTitle')}
              accent="grain"
              action={
                <AppButton size="small" variant="outlined" onClick={() => navigate('/admin-sessions')}>
                  {t('dashboard.inventorySessions')}
                </AppButton>
              }
            />
            <DashboardCard
              icon={<MeasuresIcon fontSize="medium" />}
              title={t('dashboard.measurementUnits')}
              description={t('measures.title')}
              accent="grain"
              action={
                <AppButton size="small" variant="outlined" onClick={() => navigate('/measures')}>
                  {t('dashboard.measurementUnits')}
                </AppButton>
              }
            />
            <DashboardCard
              icon={<FeatureFlagsIcon fontSize="medium" />}
              title={t('dashboard.featureFlags')}
              description={t('dashboard.featureFlags')}
              accent="grain"
              action={
                <AppButton size="small" variant="outlined" onClick={() => navigate('/feature-flags')}>
                  {t('dashboard.featureFlags')}
                </AppButton>
              }
            />
          </>
        )}
        {role === ROLES.WAREHOUSE_MANAGER && (
          <>
            <DashboardCard
              icon={<WarehouseIcon fontSize="medium" />}
              title={t('dashboard.createSession')}
              description={t('inventorySessions.title')}
              accent="green"
              action={
                <AppButton size="small" onClick={() => navigate('/create-session')}>
                  {t('dashboard.createSession')}
                </AppButton>
              }
            />
            <DashboardCard
              icon={<RegisterCountIcon fontSize="medium" />}
              title={t('dashboard.registerCount')}
              description={t('products.title')}
              accent="grain"
              action={
                <AppButton size="small" variant="outlined" onClick={() => handleSessionPrompt('/register-count')}>
                  {t('dashboard.registerCount')}
                </AppButton>
              }
            />
          </>
        )}
        {role === ROLES.PROCESS_LEADER && (
          <DashboardCard
            icon={<ViewCountsIcon fontSize="medium" />}
            title={t('dashboard.viewCounts')}
            description={t('dashboard.viewCounts')}
            accent="green"
            action={
              <AppButton size="small" onClick={() => handleSessionPrompt('/view-counts')}>
                {t('dashboard.viewCounts')}
              </AppButton>
            }
          />
        )}
      </div>
    </PageContainer>
  );
}
