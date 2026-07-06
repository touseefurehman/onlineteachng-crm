/* Central icon set — 16/18px stroke icons used across the app. */
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round' };

const paths = {
  dashboard: <><rect x="3" y="3" width="7" height="9" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="12" width="7" height="9" rx="1.5" /><rect x="3" y="16" width="7" height="5" rx="1.5" /></>,
  users: <><circle cx="9" cy="8" r="3.4" /><path d="M2.8 20c.7-3.4 3.2-5.2 6.2-5.2s5.5 1.8 6.2 5.2" /><path d="M16 4.6a3.4 3.4 0 0 1 0 6.7M21.2 20c-.5-2.4-1.9-4-3.9-4.8" /></>,
  user: <><circle cx="12" cy="8" r="3.6" /><path d="M4.6 20.4c.9-3.8 3.9-5.8 7.4-5.8s6.5 2 7.4 5.8" /></>,
  check: <><circle cx="12" cy="12" r="9" /><path d="m8 12.4 2.6 2.6L16 9.4" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5.2l3.4 2" /></>,
  x: <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6M15 9l-6 6" /></>,
  calendar: <><rect x="3.5" y="5" width="17" height="16" rx="2" /><path d="M3.5 10h17M8 3v4M16 3v4" /></>,
  ticket: <><path d="M4 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2a2 2 0 0 0 0 4v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2a2 2 0 0 0 0-4Z" /><path d="M13 6v2M13 11v2M13 16v2" /></>,
  chat: <><path d="M21 12a8 8 0 0 1-8 8H4l2.2-2.6A8 8 0 1 1 21 12Z" /><path d="M8.5 10.5h7M8.5 13.5h4.5" /></>,
  family: <><circle cx="8" cy="7.5" r="2.8" /><circle cx="16" cy="7.5" r="2.8" /><path d="M2.8 20c.6-3 2.5-4.7 5.2-4.7 1.4 0 2.6.5 3.5 1.3M21.2 20c-.6-3-2.5-4.7-5.2-4.7-1.4 0-2.6.5-3.5 1.3" /><circle cx="12" cy="14.6" r="2.2" /><path d="M8.6 21.4c.5-1.9 1.8-3 3.4-3s2.9 1.1 3.4 3" /></>,
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.6 15.6 4.4 4.4" /></>,
  bell: <><path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9Z" /><path d="M10 19.5a2.2 2.2 0 0 0 4 0" /></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  plus: <path d="M12 5v14M5 12h14" />,
  arrowRight: <path d="M5 12h13m-5-6 6 6-6 6" />,
  refresh: <><path d="M20.5 11A8.6 8.6 0 0 0 5.6 6.6L3.5 8.8" /><path d="M3.5 13a8.6 8.6 0 0 0 14.9 4.4l2.1-2.2" /><path d="M3.5 4.5v4.3h4.3M20.5 19.5v-4.3h-4.3" /></>,
  bolt: <path d="M13 2 4.5 13.5H11L10 22l8.5-11.5H13L13 2Z" />,
  star: <path d="m12 3 2.7 5.7 6.3.8-4.6 4.3 1.2 6.2L12 17l-5.6 3 1.2-6.2L3 9.5l6.3-.8L12 3Z" />,
  video: <><rect x="3" y="6" width="13" height="12" rx="2" /><path d="m16 10.5 5-3v9l-5-3" /></>,
  phone: <path d="M6.5 3.5h3l1.7 4.3-2.1 1.6a12.5 12.5 0 0 0 5.5 5.5l1.6-2.1 4.3 1.7v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7a2 2 0 0 1 2-2.2Z" />,
  mail: <><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="m4 7 8 6 8-6" /></>,
  note: <><path d="M6 3.5h9L20 8.5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-16a1 1 0 0 1 1-1Z" /><path d="M14.5 3.5v5.5H20M9 13h6M9 17h4" /></>,
  card: <><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="M3 10h18M7 14.5h4" /></>,
  book: <><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v17.5H7.5A2.5 2.5 0 0 0 5 22V4.5Z" /><path d="M5 19.5A2.5 2.5 0 0 1 7.5 17H19" /></>,
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a13.6 13.6 0 0 1 0 18M12 3a13.6 13.6 0 0 0 0 18" /></>,
  chevronDown: <path d="m6 9 6 6 6-6" />,
  edit: <path d="M4 20h4l11-11a2.1 2.1 0 0 0-3-3L5 17l-1 3Z" />,
  paperclip: <><path d="M7 12.5 13 6.5a3.5 3.5 0 1 1 5 5l-8 8a3.5 3.5 0 0 1-5-5l8-8" /><path d="M10 9.5 15.5 15" /></>,
  mic: <><circle cx="12" cy="12" r="4" /><path d="M7 12a5 5 0 0 0 10 0M12 17v3M9 20h6" /></>,
};

export default function Icon({ name, size = 18, ...rest }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" {...base} {...rest}>
      {paths[name] || paths.dashboard}
    </svg>
  );
}
