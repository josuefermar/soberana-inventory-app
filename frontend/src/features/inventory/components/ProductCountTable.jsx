import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { AppButton } from '../../../components/ui';
import { ProductRow } from './ProductRow';

/**
 * Dynamic editable table: Product (autocomplete), Measure Unit (select), Quantity, Delete.
 * "+ Add Product" adds a new row.
 * @param {Object} props
 * @param {Array<import('../hooks/useInventorySessionProducts').ProductRowState>} props.rows
 * @param {(id: string, patch: Partial<import('../hooks/useInventorySessionProducts').ProductRowState>) => void} props.onUpdateRow
 * @param {(id: string) => void} props.onRemoveRow
 * @param {() => void} props.onAddRow
 * @param {Array<{ id: string; label: string; product?: import('../services/types').ProductListItem }>} props.productOptions
 * @param {boolean} [props.productOptionsLoading]
 * @param {(inputValue?: string) => void} [props.onFetchProducts]
 * @param {Array<{ id: string; name: string }>} props.measureOptions
 * @param {Record<string, string>} [props.validationErrors]
 * @param {string} [props.addProductLabel]
 * @param {string} [props.productColumnLabel]
 * @param {string} [props.unitColumnLabel]
 * @param {string} [props.quantityColumnLabel]
 * @param {string} [props.actionsColumnLabel]
 */
export function ProductCountTable({
  rows,
  onUpdateRow,
  onRemoveRow,
  onAddRow,
  productOptions,
  productOptionsLoading = false,
  onFetchProducts,
  measureOptions,
  validationErrors = {},
  addProductLabel = 'Add Product',
  productColumnLabel = 'Product',
  unitColumnLabel = 'Measure Unit',
  quantityColumnLabel = 'Quantity',
  actionsColumnLabel = '',
}) {
  return (
    <Box>
      <Box sx={{ mb: 1 }}>
        <AppButton type="button" variant="outlined" onClick={onAddRow}>
          + {addProductLabel}
        </AppButton>
      </Box>
      <Table size="small" sx={{ minWidth: 640 }}>
        <TableHead>
          <TableRow>
            <TableCell>{productColumnLabel}</TableCell>
            <TableCell>{unitColumnLabel}</TableCell>
            <TableCell>{quantityColumnLabel}</TableCell>
            <TableCell align="right" padding="checkbox">
              {actionsColumnLabel}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <ProductRow
              key={row.id}
              row={row}
              productOptions={productOptions}
              productOptionsLoading={productOptionsLoading}
              measureOptions={measureOptions}
              onUpdate={(patch) => onUpdateRow(row.id, patch)}
              onRemove={() => onRemoveRow(row.id)}
              validationError={validationErrors[row.id]}
              onFetchProducts={onFetchProducts}
              productLabel={productColumnLabel}
              quantityLabel={quantityColumnLabel}
              unitLabel={unitColumnLabel}
            />
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}
