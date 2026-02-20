import {
  Box,
  Button,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { apiClient, getErrorMessage } from '../api/apiClient';

const ROLES = ['ADMIN', 'WAREHOUSE_MANAGER', 'PROCESS_LEADER'];

export function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: '' });
  const [syncLoading, setSyncLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    identification: '',
    name: '',
    email: '',
    role: 'WAREHOUSE_MANAGER',
    password: '',
    warehouses: '',
  });

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await apiClient.get('/users/');
      setUsers(data);
    } catch (err) {
      setSnack({
        open: true,
        message: getErrorMessage(err),
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSync = async () => {
    setSyncLoading(true);
    try {
      const { data } = await apiClient.post('/users/sync');
      setSnack({ open: true, message: `Synced. Users created: ${data?.users_created ?? 0}` });
      loadUsers();
    } catch (err) {
      setSnack({
        open: true,
        message: getErrorMessage(err),
      });
    } finally {
      setSyncLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post('/users/', {
        ...form,
        warehouses: form.warehouses ? form.warehouses.split(',').map((s) => s.trim()).filter(Boolean) : [],
      });
      setSnack({ open: true, message: 'User created' });
      setCreateOpen(false);
      setForm({
        identification: '',
        name: '',
        email: '',
        role: 'WAREHOUSE_MANAGER',
        password: '',
        warehouses: '',
      });
      loadUsers();
    } catch (err) {
      setSnack({
        open: true,
        message: getErrorMessage(err),
      });
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 3 }}>
        <Typography variant="h5" gutterBottom>
          Users
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button variant="contained" onClick={loadUsers} disabled={loading}>
            Refresh
          </Button>
          <Button variant="outlined" onClick={handleSync} disabled={syncLoading}>
            {syncLoading ? 'Syncing...' : 'Sync Users'}
          </Button>
          <Button variant="contained" onClick={() => setCreateOpen(true)}>
            Create User
          </Button>
        </Box>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Identification</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Warehouses</TableCell>
              <TableCell>Active</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.identification}</TableCell>
                <TableCell>{u.role}</TableCell>
                <TableCell>{Array.isArray(u.warehouses) ? u.warehouses.join(', ') : ''}</TableCell>
                <TableCell>{u.is_active ? 'Yes' : 'No'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create User</DialogTitle>
        <form onSubmit={handleCreate}>
          <DialogContent>
            <TextField
              fullWidth
              label="Identification"
              value={form.identification}
              onChange={(e) => setForm((f) => ({ ...f, identification: e.target.value }))}
              margin="dense"
              required
            />
            <TextField
              fullWidth
              label="Name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              margin="dense"
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              margin="dense"
              required
            />
            <TextField
              fullWidth
              select
              label="Role"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              margin="dense"
            >
              {ROLES.map((r) => (
                <MenuItem key={r} value={r}>
                  {r}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              margin="dense"
              required
            />
            <TextField
              fullWidth
              label="Warehouses (comma-separated UUIDs)"
              value={form.warehouses}
              onChange={(e) => setForm((f) => ({ ...f, warehouses: e.target.value }))}
              margin="dense"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained">
              Create
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Snackbar
        open={snack.open}
        autoHideDuration={6000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        message={snack.message}
      />
    </Container>
  );
}
