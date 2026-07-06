export function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i}><div className="skeleton" style={{ height: 14, width: i === 0 ? '70%' : '55%' }} /></td>
      ))}
    </tr>
  );
}

export function SkeletonBlock({ height = 90 }) {
  return <div className="skeleton" style={{ height, width: '100%' }} />;
}
