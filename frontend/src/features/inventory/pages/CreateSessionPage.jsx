import { Typography } from '@mui/material';
import { PageContainer } from '../../../components/layout';
import { AppButton, AppSnackbar, AppTextField } from '../../../components/ui';
import { AppSelect } from '../../../components/ui/Select';
import { useCreateSession } from '../hooks';

const COUNT_OPTIONS = [
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
];

export function CreateSessionPage() {
  const {
    warehouse_id,
    setWarehouse_id,
    month,
    setMonth,
    count_number,
    setCount_number,
    loading,
    handleSubmit,
    snack,
    closeSnack,
  } = useCreateSession();

  return (
    <PageContainer maxWidth="sm">
      <Typography variant="h5" gutterBottom>
        Create Inventory Session
      </Typography>
      <form onSubmit={handleSubmit}>
        <AppTextField
          label="Warehouse ID (UUID)"
          value={warehouse_id}
          onChange={(e) => setWarehouse_id(e.target.value)}
          required
        />
        <AppTextField
          label="Month"
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          required
          InputLabelProps={{ shrink: true }}
        />
        <AppSelect
          label="Count number (1-3)"
          value={count_number}
          onChange={(e) => setCount_number(Number(e.target.value))}
          options={COUNT_OPTIONS}
        />
        <AppButton type="submit" sx={{ mt: 2 }} disabled={loading}>
          {loading ? 'Creating...' : 'Create'}
        </AppButton>
      </form>
      <AppSnackbar
        open={snack.open}
        message={snack.message}
        severity={snack.severity}
        onClose={closeSnack}
      />
    </PageContainer>
  );
}
