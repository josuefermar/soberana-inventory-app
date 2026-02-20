import { Box, Container, Snackbar, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient, getErrorMessage } from '../api/apiClient';

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

export function ViewCounts() {
  const { sessionId } = useParams();
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snack, setSnack] = useState({ open: false, message: '' });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await apiClient.get(`/inventory-sessions/${sessionId}/counts`);
        if (!cancelled) setCounts(Array.isArray(data) ? data : []);
      } catch (err) {
        if (!cancelled) {
          setSnack({
            open: true,
            message: getErrorMessage(err),
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [sessionId]);

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h5" gutterBottom>
          View Counts
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Session: {sessionId}
        </Typography>
        {loading ? (
          <Typography>Loading...</Typography>
        ) : (
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product</TableCell>
                <TableCell>Packaging quantity</TableCell>
                <TableCell>Total units</TableCell>
                <TableCell>Created at</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {counts.map((row, idx) => (
                <TableRow key={row.product?.id ?? idx}>
                  <TableCell>
                    {row.product?.description ?? row.product?.code ?? row.product?.id ?? '—'}
                  </TableCell>
                  <TableCell>{row.packaging_quantity}</TableCell>
                  <TableCell>{row.total_units}</TableCell>
                  <TableCell>{formatDate(row.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Box>
      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        message={snack.message}
      />
    </Container>
  );
}
