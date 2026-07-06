import { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import Icon from '../ui/Icons';

export default function Topbar({ onMenu }) {
  const { search, actions } = useApp();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <header className="topbar">
      <button className="menu-toggle" onClick={onMenu} aria-label="Open navigation">
        <Icon name="menu" size={18} />
      </button>
      <div className="search-wrap">
        <Icon name="search" size={15} />
        <input
          placeholder="Search leads, families, students…"
          value={search}
          onChange={(e) => actions.setSearch(e.target.value)}
          aria-label="Global search"
        />
      </div>
      <div className="topbar-right">
        <div className="top-chip hide-sm">
          <label>Local time</label>
          <b>{now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}</b>
        </div>
        <div className="top-chip hide-sm">
          <label>Local date</label>
          <b>{now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</b>
        </div>
        <div className="top-chip">
          <label>Time zone</label>
          <b>Asia/Karachi</b>
        </div>
        <button className="btn btn-ghost btn-sm" aria-label="Notifications">
          <Icon name="bell" size={16} /> Notifications
        </button>
      </div>
    </header>
  );
}
