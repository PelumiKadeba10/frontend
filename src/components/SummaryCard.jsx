export function SummaryCard({ title, value, hint }) {
  return (
    <div className="summary-card">
      <p className="summary-title">{title}</p>
      <p className="summary-value">{value}</p>
      {hint ? <p className="summary-hint">{hint}</p> : null}
    </div>
  );
}
