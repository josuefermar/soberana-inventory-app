import { Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Navbar } from '../../Navbar.jsx';
import { Sidebar } from '../Sidebar';
import styles from './AppLayout.module.scss';

/**
 * Base layout: Navbar + optional Sidebar (when authenticated) + main content.
 * Used for all private routes; login uses no layout.
 */
export function AppLayout() {
  const { user } = useAuth();
  const showSidebar = Boolean(user);

  return (
    <div className={styles.layout}>
      <Navbar />
      <div className={styles.mainRow}>
        {showSidebar && <Sidebar />}
        <main className={showSidebar ? styles.content : styles.contentNoSidebar}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
