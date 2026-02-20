import Card from '@mui/material/Card';

/**
 * Application card. Wraps MUI Card with theme consistency.
 * @param {import('@mui/material/Card').CardProps} props
 */
export function AppCard(props) {
  return <Card {...props} />;
}
