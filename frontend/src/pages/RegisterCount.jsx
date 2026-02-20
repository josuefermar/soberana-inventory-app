import { Box, Button, Container, Snackbar, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient, getErrorMessage } from '../api/apiClient';

export function RegisterCount() {
  const { sessionId } = useParams();
  const [product_id, setProduct_id] = useState('');
  const [packaging_quantity, setPackaging_quantity] = useState('');
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '' });
  const [lastTotal, setLastTotal] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setLastTotal(null);
    try {
      const { data } = await apiClient.post(`/inventory-sessions/${sessionId}/counts`, {
        product_id,
        packaging_quantity: Number(packaging_quantity),
      });
      setLastTotal(data.total_units);
      setSnack({ open: true, message: 'Count registered' });
      setProduct_id('');
      setPackaging_quantity('');
    } catch (err) {
      setSnack({
        open: true,
        message: getErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 3 }}>
        <Typography variant="h5" gutterBottom>
          Register Count
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Session: {sessionId}
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Product ID (UUID)"
            value={product_id}
            onChange={(e) => setProduct_id(e.target.value)}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Packaging quantity"
            type="number"
            inputProps={{ min: 1 }}
            value={packaging_quantity}
            onChange={(e) => setPackaging_quantity(e.target.value)}
            required
            margin="normal"
          />
          {lastTotal != null && (
            <Typography sx={{ mt: 1 }}>
              Total units: <strong>{lastTotal}</strong>
            </Typography>
          )}
          <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit'}
          </Button>
        </form>
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
