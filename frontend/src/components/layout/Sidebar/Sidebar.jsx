import { NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Dashboard as DashboardIcon,
  Inventory2 as InventoryIcon,
  AddCircleOutline as CreateSessionIcon,
  Assignment as RegisterCountIcon,
  Visibility as ViewCountsIcon,
  People as UsersIcon,
  Straighten as MeasuresIcon,
  Flag as FeatureFlagsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useAuth } from '../../../context/AuthContext';
import { ROLES } from '../../../constants';
import styles from './Sidebar.module.scss';

const navItems = [
  { to: '/dashboard', icon: DashboardIcon, labelKey: 'dashboard.title', roles: null },
  {
    to: '/admin-sessions',
    icon: InventoryIcon,
    labelKey: 'dashboard.inventorySessions',
    roles: [ROLES.ADMIN, ROLES.PROCESS_LEADER],
  },
  {
    to: '/create-session',
    icon: CreateSessionIcon,
    labelKey: 'dashboard.createSession',
    roles: [ROLES.ADMIN, ROLES.WAREHOUSE_MANAGER],
  },
  {
    to: '/users',
    icon: UsersIcon,
    labelKey: 'dashboard.manageUsers',
    roles: [ROLES.ADMIN],
  },
  {
    to: '/measures',
    icon: MeasuresIcon,
    labelKey: 'dashboard.measurementUnits',
    roles: [ROLES.ADMIN],
  },
  {
    to: '/feature-flags',
    icon: FeatureFlagsIcon,
    labelKey: 'dashboard.featureFlags',
    roles: [ROLES.ADMIN],
  },
];

function NavItem({ to, icon: Icon, labelKey }) {
  const { t } = useTranslation();
  return (
    <Tooltip title={t(labelKey)} placement="right" className={styles.tooltip}>
      <NavLink
        to={to}
        className={({ isActive }) => (isActive ? `${styles.link} ${styles.active}` : styles.link)}
      >
        <Icon className={styles.icon} />
      </NavLink>
    </Tooltip>
  );
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const role = user?.role ?? '';

  const visibleItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(role)
  );

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {visibleItems.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={item.icon}
            labelKey={item.labelKey}
          />
        ))}
      </nav>
      <Tooltip title={t('common.logout')} placement="right">
        <IconButton
          className={styles.link}
          onClick={handleLogout}
          size="small"
          aria-label={t('common.logout')}
        >
          <LogoutIcon className={styles.icon} />
        </IconButton>
      </Tooltip>
    </aside>
  );
}
