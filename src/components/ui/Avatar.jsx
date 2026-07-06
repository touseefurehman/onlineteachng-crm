const PALETTE = [
  ['#E3F1EF', '#124842'], ['#F7EFD9', '#8a6a17'], ['#E8F0FC', '#2d5fb0'],
  ['#FBE9E7', '#a13325'], ['#E7F5EE', '#1f7a50'],
];

export default function Avatar({ name = '', size = 34 }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';
  const [bg, fg] = PALETTE[(name.charCodeAt(0) || 0) % PALETTE.length];
  return (
    <span className="avatar" style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.36 }}>
      {initials}
    </span>
  );
}
