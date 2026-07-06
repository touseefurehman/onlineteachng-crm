const TONES = {
  success: ['var(--success)', 'var(--success-bg)'],
  warning: ['var(--warning)', 'var(--warning-bg)'],
  danger: ['var(--danger)', 'var(--danger-bg)'],
  info: ['var(--info)', 'var(--info-bg)'],
  teal: ['var(--teal-600)', 'var(--teal-100)'],
  gold: ['var(--gold-600)', 'var(--gold-100)'],
  muted: ['var(--text-2)', 'var(--border-soft)'],
};

export default function Badge({ tone = 'muted', dot = true, children }) {
  const [fg, bg] = TONES[tone] || TONES.muted;
  return (
    <span className="badge" style={{ color: fg, background: bg }}>
      {dot && <span className="badge-dot" style={{ background: fg }} />}
      {children}
    </span>
  );
}

export const trialStatusTone = {
  scheduled: 'info',
  completed: 'teal',
  converted: 'success',
  no_show: 'warning',
  cancelled: 'danger',
};

export const trialStatusLabel = {
  scheduled: 'Scheduled',
  completed: 'Completed',
  converted: 'Converted',
  no_show: 'No-show',
  cancelled: 'Cancelled',
};
