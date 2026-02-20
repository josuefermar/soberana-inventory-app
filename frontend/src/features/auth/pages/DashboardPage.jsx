import { Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { PageContainer } from '../../../components/layout';
import { AppButton } from '../../../components/ui';
import { ROLES } from '../../../constants';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? '';

  return (
    <PageContainer maxWidth="md">
      <Typography variant="h5" gutterBottom>
        Welcome
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Role: {role}
      </Typography>
      <Stack spacing={2}>
        {role === ROLES.ADMIN && (
          <>
            <AppButton onClick={() => navigate('/users')}>
              Manage Users
            </AppButton>
            <AppButton onClick={() => navigate('/create-session')}>
              Create Inventory Session
            </AppButton>
            <AppButton
              variant="outlined"
              color="secondary"
              onClick={() => navigate('/users')}
            >
              Sync Users
            </AppButton>
          </>
        )}
        {role === ROLES.WAREHOUSE_MANAGER && (
          <>
            <AppButton onClick={() => navigate('/create-session')}>
              Create Inventory Session
            </AppButton>
            <AppButton
              onClick={() => {
                const sessionId = prompt('Enter session ID (UUID):');
                if (sessionId) navigate(`/register-count/${sessionId}`);
              }}
            >
              Register Count
            </AppButton>
          </>
        )}
        {role === ROLES.PROCESS_LEADER && (
          <AppButton
            onClick={() => {
              const sessionId = prompt('Enter session ID (UUID):');
              if (sessionId) navigate(`/view-counts/${sessionId}`);
            }}
          >
            View Counts
          </AppButton>
        )}
      </Stack>
    </PageContainer>
  );
}
