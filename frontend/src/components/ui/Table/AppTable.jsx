import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

/**
 * Application table with styled header row (primary background).
 * Columns and rows are passed as props; presentation-only.
 * @param {Object} props
 * @param {Array<{ id: string; label: string; align?: 'left'|'right'|'center' }>} props.columns
 * @param {Array<Record<string, React.ReactNode>>} props.rows - Array of row objects; keys should match column ids
 * @param {string} [props.rowKey] - Key field for row key (default: 'id')
 */
export function AppTable({ columns = [], rows = [], rowKey = 'id' }) {

  return (
    <Table>
      <TableHead>
        <TableRow sx={{ bgcolor: 'primary.main' }}>
          {columns.map((col) => (
            <TableCell
              key={col.id}
              align={col.align}
              sx={{ color: 'primary.contrastText', fontWeight: 600 }}
            >
              {col.label}
            </TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, idx) => (
          <TableRow key={row[rowKey] ?? idx}>
            {columns.map((col) => (
              <TableCell key={col.id} align={col.align}>
                {row[col.id]}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
