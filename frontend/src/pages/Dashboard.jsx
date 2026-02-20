import { Box, Button, Container, Stack, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROLES = {
  ADMIN: 'ADMIN',
  WAREHOUSE_MANAGER: 'WAREHOUSE_MANAGER',
  PROCESS_LEADER: 'PROCESS_LEADER',
};

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const role = user?.role ?? '';

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 3 }}>
        <Typography variant="h5" gutterBottom>
          Welcome
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Role: {role}
        </Typography>
        <Stack spacing={2}>
          {role === ROLES.ADMIN && (
            <>
              <Button
                variant="contained"
                onClick={() => navigate('/users')}
              >
                Manage Users
              </Button>
              <Button
                variant="contained"
                onClick={() => navigate('/create-session')}
              >
                Create Inventory Session
              </Button>
              <Button
                variant="outlined"
                onClick={() => navigate('/users')}
              >
                Sync Users
              </Button>
            </>
          )}
          {role === ROLES.WAREHOUSE_MANAGER && (
            <>
              <Button
                variant="contained"
                onClick={() => navigate('/create-session')}
              >
                Create Inventory Session
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  const sessionId = prompt('Enter session ID (UUID):');
                  if (sessionId) navigate(`/register-count/${sessionId}`);
                }}
              >
                Register Count
              </Button>
            </>
          )}
          {role === ROLES.PROCESS_LEADER && (
            <Button
              variant="contained"
              onClick={() => {
                const sessionId = prompt('Enter session ID (UUID):');
                if (sessionId) navigate(`/view-counts/${sessionId}`);
              }}
            >
              View Counts
            </Button>
          )}
        </Stack>
      </Box>
    </Container>
  );
}
