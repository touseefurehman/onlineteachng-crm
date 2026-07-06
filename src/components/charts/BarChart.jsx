/** Dependency-free SVG bar chart. */
export default function BarChart({ data, height = 190, color = 'var(--teal-500)' }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const bw = 100 / data.length;
  return (
    <div>
      <svg viewBox="0 0 100 60" preserveAspectRatio="none" style={{ width: '100%', height }}>
        {data.map((d, i) => {
          const h = (d.value / max) * 52;
          return (
            <rect
              key={d.label}
              x={i * bw + bw * 0.18}
              y={58 - h}
              width={bw * 0.64}
              height={h}
              rx="1.4"
              fill={d.color || color}
              opacity="0.9"
            >
              <title>{`${d.label}: ${d.value}`}</title>
            </rect>
          );
        })}
      </svg>
      <div style={{ display: 'flex' }}>
        {data.map((d) => (
          <span key={d.label} style={{ flex: 1, textAlign: 'center', fontSize: 10.5, color: 'var(--text-3)', fontWeight: 600 }}>
            {d.label}
          </span>
        ))}
      </div>
    </div>
  );
}
