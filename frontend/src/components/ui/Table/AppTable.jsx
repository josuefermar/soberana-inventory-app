import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import styles from './AppTable.module.scss';

/**
 * Application table: light gray header, clear borders (Soberana style).
 * Columns and rows are passed as props; presentation-only.
 * @param {Object} props
 * @param {Array<{ id: string; label: string; align?: 'left'|'right'|'center' }>} props.columns
 * @param {Array<Record<string, React.ReactNode>>} props.rows - Array of row objects; keys should match column ids
 * @param {string} [props.rowKey] - Key field for row key (default: 'id')
 */
export function AppTable({ columns = [], rows = [], rowKey = 'id' }) {
  return (
    <div className={styles.tableWrap}>
      <Table className={styles.table} size="medium">
        <TableHead>
          <TableRow className={styles.headerRow}>
            {columns.map((col) => (
              <TableCell key={col.id} align={col.align} className={styles.headerCell}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, idx) => (
            <TableRow key={row[rowKey] ?? idx} className={styles.bodyRow}>
              {columns.map((col) => (
                <TableCell key={col.id} align={col.align} className={styles.bodyCell}>
                  {row[col.id]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
