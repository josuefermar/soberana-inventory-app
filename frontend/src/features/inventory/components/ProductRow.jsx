import Autocomplete from '@mui/material/Autocomplete';
import IconButton from '@mui/material/IconButton';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import { AppTextField } from '../../../components/ui';

/**
 * Single editable row: product autocomplete, measure unit select, quantity, delete.
 * @param {Object} props
 * @param {import('../hooks/useInventorySessionProducts').ProductRowState} props.row
 * @param {Array<{ id: string; label: string; product?: import('../services/types').ProductListItem }>} props.productOptions
 * @param {boolean} [props.productOptionsLoading]
 * @param {Array<{ id: string; name: string }>} props.measureOptions - All measures; row filters by product units when product set
 * @param {(patch: Partial<import('../hooks/useInventorySessionProducts').ProductRowState>) => void} props.onUpdate
 * @param {() => void} props.onRemove
 * @param {string} [props.validationError]
 * @param {(inputValue: string) => void} [props.onFetchProducts]
 * @param {string} [props.productLabel]
 * @param {string} [props.quantityLabel]
 * @param {string} [props.unitLabel]
 * @param {string} [props.deleteLabel]
 */
export function ProductRow({
  row,
  productOptions,
  productOptionsLoading = false,
  measureOptions,
  onUpdate,
  onRemove,
  validationError,
  onFetchProducts,
  productLabel = 'Product',
  quantityLabel = 'Quantity',
  unitLabel = 'Measure Unit',
  deleteLabel = 'Delete',
}) {
  const productOption = productOptions.find((o) => o.id === row.product_id) ?? null;
  const measureOption = measureOptions.find((m) => m.id === row.measure_unit_id) ?? null;

  /** @type {Array<{ id: string; name: string }>} */
  const availableMeasures = (() => {
    if (!row.product?.inventory_unit_id && !row.product?.packaging_unit_id) {
      return measureOptions;
    }
    const ids = new Set([
      row.product?.inventory_unit_id,
      row.product?.packaging_unit_id,
    ].filter(Boolean));
    return measureOptions.filter((m) => ids.has(m.id));
  })();

  const handleProductChange = (_event, newValue) => {
    const product = newValue?.product;
    const baseUnitId =
      product?.inventory_unit_id ?? product?.packaging_unit_id ?? '';
    onUpdate({
      product_id: newValue?.id ?? '',
      productLabel: newValue?.label,
      product,
      measure_unit_id: baseUnitId || row.measure_unit_id,
    });
  };

  const handleMeasureChange = (e) => {
    const value = e.target.value;
    onUpdate({ measure_unit_id: value });
  };

  const handleQuantityChange = (e) => {
    const raw = e.target.value;
    const num = parseFloat(raw);
    onUpdate({ quantity: raw === '' ? 0 : (Number.isNaN(num) ? row.quantity : num) });
  };

  return (
    <TableRow>
      <TableCell>
        <Autocomplete
          size="small"
          fullWidth
          options={productOptions}
          value={productOption}
          onChange={handleProductChange}
          onInputChange={(_e, inputValue) => onFetchProducts?.(inputValue)}
          getOptionLabel={(opt) => opt?.label ?? ''}
          isOptionEqualToValue={(opt, val) => opt?.id === val?.id}
          loading={productOptionsLoading}
          renderInput={(params) => (
            <TextField
              {...params}
              label={productLabel}
              error={Boolean(validationError)}
              helperText={validationError}
            />
          )}
        />
      </TableCell>
      <TableCell>
        <TextField
          select
          size="small"
          fullWidth
          label={unitLabel}
          value={row.measure_unit_id}
          onChange={handleMeasureChange}
          SelectProps={{ native: true }}
          error={Boolean(validationError)}
        >
          <option value="">—</option>
          {(availableMeasures.length ? availableMeasures : measureOptions).map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </TextField>
      </TableCell>
      <TableCell>
        <AppTextField
          size="small"
          type="number"
          label={quantityLabel}
          value={row.quantity <= 0 ? '' : row.quantity}
          onChange={handleQuantityChange}
          inputProps={{ min: 0, step: 0.01 }}
          error={Boolean(validationError)}
        />
      </TableCell>
      <TableCell padding="checkbox" align="right">
        <IconButton
          aria-label={deleteLabel}
          onClick={onRemove}
          color="error"
          size="small"
        >
          <DeleteOutline />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}
