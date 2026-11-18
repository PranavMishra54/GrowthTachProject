import { ChevronDown, ChevronUp, ChevronsUpDown } from 'lucide-react';
import Loader from './Loader';

export default function DataTable({ columns, rows, loading, empty = 'Nothing to show yet', sortBy, sortOrder, onSort, rowKey = '_id' }) {
  return (
    <div className="table-scroll">
      <table className="data-table">
        <thead><tr>{columns.map((column) => <th key={column.key}>
          {column.sortable ? <button className="sort-btn" onClick={() => onSort(column.key)}>{column.label}{sortBy === column.key ? (sortOrder === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />) : <ChevronsUpDown size={14} />}</button> : column.label}
        </th>)}</tr></thead>
        <tbody>
          {loading ? <tr><td colSpan={columns.length}><Loader label="Loading data" /></td></tr>
            : rows.length ? rows.map((row) => <tr key={row[rowKey]}>{columns.map((column) => <td key={column.key}>{column.render ? column.render(row) : row[column.key] ?? '—'}</td>)}</tr>)
              : <tr><td className="empty-cell" colSpan={columns.length}>{empty}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
