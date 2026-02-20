import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LanguageSelector } from './ui';
import styles from './Navbar/Navbar.module.scss';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <AppBar position="static" className={styles.navbar} elevation={0}>
      <Toolbar className={styles.toolbar} disableGutters>
        <Box
          component="button"
          onClick={() => navigate(user ? '/dashboard' : '/login')}
          className={styles.logoButton}
        >
          <img
            src="/logo-la-soberana.svg"
            alt="La Soberana"
            className={styles.logo}
          />
        </Box>
        {user && (
          <>
            <div className={styles.spacer} />
            <Typography variant="body2" className={styles.role}>
              {user.role}
            </Typography>
            <LanguageSelector />
            <Button className={styles.logoutBtn} onClick={handleLogout}>
              {t('common.logout')}
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
}
