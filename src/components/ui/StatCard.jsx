import { Card } from './Card';

export default function StatCard({ label, value, delta, tone = 'var(--success)' }) {
  return (
    <Card className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {delta && <div className="stat-delta" style={{ color: tone }}>{delta}</div>}
    </Card>
  );
}
