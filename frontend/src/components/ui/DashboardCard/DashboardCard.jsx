import { Card, Typography } from '@mui/material';
import styles from './DashboardCard.module.scss';

/**
 * Dashboard widget card: icon, title, optional description, action button.
 * accent: 'green' | 'grain'
 * @param {Object} props
 * @param {React.ReactNode} props.icon
 * @param {string} props.title
 * @param {string} [props.description]
 * @param {React.ReactNode} [props.action]
 * @param {'green'|'grain'} [props.accent]
 */
export function DashboardCard({ icon, title, description, action, accent = 'green' }) {
  return (
    <Card component="article" className={styles.card} elevation={0}>
      <div className={`${styles.iconWrap} ${styles[accent]}`}>{icon}</div>
      <Typography className={styles.title} component="h3">
        {title}
      </Typography>
      {description && (
        <Typography className={styles.description} variant="body2">
          {description}
        </Typography>
      )}
      {action && <div className={styles.action}>{action}</div>}
    </Card>
  );
}
