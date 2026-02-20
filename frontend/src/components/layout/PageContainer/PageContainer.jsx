import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

/**
 * Standard page wrapper: Container + vertical padding.
 * @param {Object} props
 * @param {React.ReactNode} [props.children]
 * @param {'xs'|'sm'|'md'|'lg'|'xl'} [props.maxWidth]
 */
export function PageContainer({ children, maxWidth = 'lg', ...rest }) {
  return (
    <Container maxWidth={maxWidth} {...rest}>
      <Box sx={{ py: 3 }}>{children}</Box>
    </Container>
  );
}
