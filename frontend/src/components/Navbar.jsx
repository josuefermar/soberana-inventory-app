import { AppBar, Box, Button, Container, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" color="primary">
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ gap: 2 }}>
          <Box
            component="button"
            onClick={() => navigate('/dashboard')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: 0,
            }}
          >
            <img
              src="/logo-la-soberana.svg"
              alt="La Soberana"
              style={{ height: 40 }}
            />
          </Box>
          {user && (
            <>
              <Typography variant="body2" sx={{ flexGrow: 1, color: 'primary.contrastText' }}>
                {user.role}
              </Typography>
              <Button color="inherit" onClick={handleLogout}>
                Logout
              </Button>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
