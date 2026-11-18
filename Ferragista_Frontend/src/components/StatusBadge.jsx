export default function StatusBadge({ tone = 'muted', children }) {
  return <span className={`status-badge badge-${tone}`}>{children}</span>;
}
