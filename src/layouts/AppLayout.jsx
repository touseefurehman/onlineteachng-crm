import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/layout/Sidebar';
import Topbar from '../components/layout/Topbar';

/**
 * Application shell: fixed sidebar (panel-aware) + topbar + routed page.
 * `panel` is 'enrollment' or 'admin' and decides which nav is rendered.
 */
export default function AppLayout({ panel }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="shell">
      <Sidebar panel={panel} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="main-col">
        <Topbar onMenu={() => setMenuOpen(true)} />
        {/* key remounts the page wrapper so the enter animation replays per route */}
        <main className="page-root" key={location.pathname}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
