import { Box, Button, Container, MenuItem, Snackbar, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient, getErrorMessage } from '../api/apiClient';

export function CreateSession() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [warehouse_id, setWarehouse_id] = useState('');
  const [month, setMonth] = useState('');
  const [count_number, setCount_number] = useState(1);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.sub) return;
    setLoading(true);
    try {
      const monthDate = month ? `${month}-01T00:00:00.000Z` : new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z';
      const { data } = await apiClient.post('/inventory-sessions/', {
        warehouse_id,
        month: monthDate,
        count_number: Number(count_number),
        created_by: user.sub,
      });
      setSnack({ open: true, message: `Session created: ${data.id}` });
      setWarehouse_id('');
      setMonth('');
      setCount_number(1);
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
          Create Inventory Session
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Warehouse ID (UUID)"
            value={warehouse_id}
            onChange={(e) => setWarehouse_id(e.target.value)}
            required
            margin="normal"
          />
          <TextField
            fullWidth
            label="Month"
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            required
            margin="normal"
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            fullWidth
            select
            label="Count number (1-3)"
            value={count_number}
            onChange={(e) => setCount_number(Number(e.target.value))}
            margin="normal"
          >
            <MenuItem value={1}>1</MenuItem>
            <MenuItem value={2}>2</MenuItem>
            <MenuItem value={3}>3</MenuItem>
          </TextField>
          <Button type="submit" variant="contained" sx={{ mt: 2 }} disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
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
