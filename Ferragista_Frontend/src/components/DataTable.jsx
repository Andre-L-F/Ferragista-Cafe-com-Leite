export default function DataTable({ columns, children, empty = 'Nenhum registro encontrado.', tableId, bodyId }) {
  return (
    <div className="table-wrap">
      <table className="data-table" id={tableId}>
        <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody id={bodyId}>{children || <tr><td colSpan={columns.length} className="empty-state">{empty}</td></tr>}</tbody>
      </table>
    </div>
  );
}
