import { NavLink, useNavigate } from 'react-router-dom';
import { NAV } from './nav.config';
import { useApp } from '../../context/AppContext';
import Icon from '../ui/Icons';
import Avatar from '../ui/Avatar';

function Lattice() {
  return (
    <svg className="lattice" viewBox="0 0 100 100" aria-hidden="true">
      {Array.from({ length: 5 }).map((_, i) =>
        Array.from({ length: 5 }).map((_, j) => (
          <path
            key={`${i}-${j}`}
            d={`M${i * 20 + 10} ${j * 20} l10 10 -10 10 -10 -10 Z`}
            fill="none" stroke="#fff" strokeWidth="1"
          />
        )),
      )}
    </svg>
  );
}

export default function Sidebar({ panel, open, onClose }) {
  const state = useApp();
  const navigate = useNavigate();
  const cfg = NAV[panel];

  return (
    <>
      {open && <div className="sidebar-scrim" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <Lattice />
        <div className="brand">
          <div className="brand-mark">ن</div>
          <div>
            <div className="brand-name">Noor CRM</div>
            <div className="brand-sub">E Online Quran</div>
          </div>
        </div>

        <div className="panel-switch" role="tablist" aria-label="Switch panel">
          {Object.entries(NAV).map(([key, p]) => (
            <button
              key={key}
              role="tab"
              aria-selected={key === panel}
              className={key === panel ? 'active' : ''}
              onClick={() => {
                navigate(`${p.base}/dashboard`);
                onClose();
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        <nav className="nav-scroll">
          {cfg.groups.map((g) => (
            <div key={g.group}>
              <div className="nav-group-label">{g.group}</div>
              {g.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <Icon name={item.icon} size={17} />
                  {item.label}
                  {item.badge && <span className="nav-badge">{item.badge(state)}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-user">
          <Avatar name={cfg.user.name} />
          <div>
            <b>{cfg.user.name}</b>
            <span>{cfg.user.role}</span>
          </div>
        </div>
      </aside>
    </>
  );
}
