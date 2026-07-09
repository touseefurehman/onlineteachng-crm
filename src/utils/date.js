export const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function daysAgo(n) {
  return new Date(Date.now() - n * 86400000);
}

export function daysFromNow(n) {
  return new Date(Date.now() + n * 86400000);
}

export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function fmtDateTime(d) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-GB', {
    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
  });
}

export function fmtExactDateTime(d, timezone) {
  if (!d) return '—';
  const date = new Date(d);
  const zone = timezone || Intl.DateTimeFormat().resolvedOptions().timeZone;
  const parts = date.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: zone,
    timeZoneName: 'short',
  });
  return parts.replace(',', ' —');
}

export function timeAgo(d) {
  if (!d) return '—';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${Math.max(mins, 1)}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  return `${days}d ago`;
}

export function toISODate(d) {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
}

export function todayISO() {
  return toISODate(new Date());
}

/** "HH:MM" -> minutes since midnight */
export function toMinutes(hhmm) {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

/** minutes since midnight -> "h:MM AM/PM" */
export function fmtTime(hhmm) {
  const mins = typeof hhmm === 'string' ? toMinutes(hhmm) : hhmm;
  if (mins == null) return '—';
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/** add minutes to "HH:MM" */
export function addMinutes(hhmm, mins) {
  const total = (toMinutes(hhmm) + mins) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** two [start,end] minute ranges overlap? */
export function rangesOverlap(aStart, aEnd, bStart, bEnd) {
  return aStart < bEnd && bStart < aEnd;
}

export function rnd(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function rndInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
