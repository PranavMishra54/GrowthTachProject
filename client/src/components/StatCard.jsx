export default function StatCard({ label, value, note, icon: Icon, tone = 'blue' }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${tone}`}>{Icon && <Icon size={20} strokeWidth={2} />}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value ?? '—'}</div>
      {note && <div className="stat-note">{note}</div>}
    </article>
  );
}
