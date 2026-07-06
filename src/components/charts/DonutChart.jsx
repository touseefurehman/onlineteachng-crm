/** Dependency-free SVG donut with legend. */
export default function DonutChart({ data, size = 150 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 15.9;
  let offset = 25;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 18, flexWrap: 'wrap' }}>
      <svg viewBox="0 0 42 42" width={size} height={size} role="img" aria-label="Distribution chart">
        <circle cx="21" cy="21" r={r} fill="none" stroke="var(--border-soft)" strokeWidth="6" />
        {data.map((d) => {
          const pct = (d.value / total) * 100;
          const el = (
            <circle
              key={d.label}
              cx="21" cy="21" r={r} fill="none"
              stroke={d.color} strokeWidth="6"
              strokeDasharray={`${pct} ${100 - pct}`}
              strokeDashoffset={offset}
              strokeLinecap="butt"
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </circle>
          );
          offset -= pct;
          return el;
        })}
        <text x="21" y="21.5" textAnchor="middle" dominantBaseline="middle" fontSize="7" fontWeight="700" fill="var(--text-1)">
          {total}
        </text>
      </svg>
      <div style={{ display: 'grid', gap: 7 }}>
        {data.map((d) => (
          <div key={d.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
            <span style={{ width: 10, height: 10, borderRadius: 3, background: d.color }} />
            <span style={{ color: 'var(--text-2)' }}>{d.label}</span>
            <b style={{ marginLeft: 'auto' }}>{d.value}</b>
          </div>
        ))}
      </div>
    </div>
  );
}
