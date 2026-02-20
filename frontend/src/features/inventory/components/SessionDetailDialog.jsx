import { useEffect, useState, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { getCounts } from '../services/inventoryService';
import { getErrorMessage } from '../../../utils/errorHandling';
import styles from './SessionDetailDialog.module.scss';

/**
 * Modal with session summary and products/counts table.
 * @param {Object} props
 * @param {boolean} props.open
 * @param {() => void} props.onClose
 * @param {import('../services/types').SessionListItem | null} props.session
 */
export function SessionDetailDialog({ open, onClose, session }) {
  const { t, i18n } = useTranslation();
  const [counts, setCounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const dayjsLocale = i18n.language?.startsWith('es') ? 'es' : 'en';

  useEffect(() => {
    if (!open || !session?.id) {
      setCounts([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    getCounts(session.id)
      .then(setCounts)
      .catch((err) => setError(getErrorMessage(err)))
      .finally(() => setLoading(false));
  }, [open, session?.id]);

  const createdDate = session?.created_at
    ? dayjs(session.created_at).format('DD-MM-YYYY')
    : '—';
  const monthLabel = session?.month
    ? dayjs(session.month).locale(dayjsLocale).format('MMMM YYYY')
    : '—';

  const productColumns = useMemo(
    () => [
      { id: 'code', label: t('inventorySessions.detailTableCode') },
      { id: 'description', label: t('inventorySessions.detailTableDescription') },
      { id: 'inventory_unit', label: t('inventorySessions.detailTableInventoryUnit') },
      { id: 'packaging_unit', label: t('inventorySessions.detailTablePackagingUnit') },
      { id: 'quantity_packaging', label: t('inventorySessions.detailTableQuantityPackaging'), align: 'right' },
      { id: 'conversion_factor', label: t('inventorySessions.detailTableConversionFactor'), align: 'right' },
      { id: 'quantity_units', label: t('inventorySessions.detailTableQuantityUnits'), align: 'right' },
    ],
    [t]
  );

  const tableRows = useMemo(
    () =>
      counts.map((row, idx) => ({
        id: `session-detail-row-${session?.id}-${row.product?.id ?? idx}-${idx}`,
        code: row.product?.code ?? '—',
        description: row.product?.description ?? '—',
        inventory_unit: row.measure_unit?.name ?? '—',
        packaging_unit: row.measure_unit?.abbreviation ?? '—',
        quantity_packaging: row.packaging_quantity,
        conversion_factor:
          row.product?.conversion_factor == null
            ? '—'
            : Number(row.product.conversion_factor),
        quantity_units: row.total_units,
      })),
    [counts, session?.id]
  );

  if (!session) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
      className={styles.dialog}
      PaperProps={{ className: styles.paper }}
    >
      <DialogTitle className={styles.title}>
        {t('inventorySessions.detailTitle')}
      </DialogTitle>
      <DialogContent dividers className={styles.content}>
        <Box className={styles.summary}>
          <Typography variant="body2" className={styles.summaryRow}>
            <strong>{t('inventorySessions.detailCreatedBy')}:</strong>{' '}
            {session.created_by_name ?? '—'}
          </Typography>
          <Typography variant="body2" className={styles.summaryRow}>
            <strong>{t('inventorySessions.detailCreatedAt')}:</strong> {createdDate}
          </Typography>
          <Typography variant="body2" className={styles.summaryRow}>
            <strong>{t('inventorySessions.warehouseColumn')}:</strong>{' '}
            {session.warehouse_description ?? '—'}
          </Typography>
          <Typography variant="body2" className={styles.summaryRow}>
            <strong>{t('inventorySessions.detailMonth')}:</strong> {monthLabel}
          </Typography>
        </Box>

        <Typography variant="subtitle2" className={styles.tableSectionTitle}>
          {t('inventorySessions.detailProductsTableTitle')}
        </Typography>

        {error && (
          <Typography color="error" variant="body2" sx={{ mb: 1 }}>
            {error}
          </Typography>
        )}
        {loading && (
          <Typography variant="body2" color="text.secondary">
            {t('common.loading')}
          </Typography>
        )}
        {!loading && !error && tableRows.length === 0 && (
          <Typography variant="body2" color="text.secondary" className={styles.noProducts}>
            {t('inventorySessions.noProductsInSession')}
          </Typography>
        )}
        {!loading && !error && tableRows.length > 0 && (
          <div className={styles.tableWrap}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow className={styles.headerRow}>
                  {productColumns.map((col) => (
                    <TableCell
                      key={col.id}
                      align={col.align}
                      className={styles.headerCell}
                    >
                      {col.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableRows.map((row) => (
                  <TableRow key={row.id} className={styles.bodyRow}>
                    {productColumns.map((col) => (
                      <TableCell
                        key={col.id}
                        align={col.align}
                        className={styles.bodyCell}
                      >
                        {row[col.id]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
      <DialogActions className={styles.actions}>
        <Button onClick={onClose} variant="contained" color="primary">
          {t('inventorySessions.detailClose')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
