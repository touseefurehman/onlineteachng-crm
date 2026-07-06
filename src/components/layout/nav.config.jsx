/**
 * Panel-scoped navigation. Only two panels exist:
 *  - Enrollment  → pipeline work, no access to active families/students
 *  - Admin & Support → active families & support, no access to raw pipeline
 * The active item is highlighted with #00635D via NavLink (see Sidebar).
 */
export const NAV = {
  enrollment: {
    label: 'Enrollment',
    base: '/enrollment',
    user: { name: 'Sohail Sales22', role: 'Enrollment Agent' },
    groups: [
      {
        group: 'Overview',
        items: [{ to: '/enrollment/dashboard', label: 'Dashboard', icon: 'dashboard' }],
      },
      {
        group: 'Pipeline',
        items: [
          { to: '/enrollment/new-leads', label: 'New Leads', icon: 'users', badge: (s) => s.leads.filter((l) => l.stage === 'raw').length },
          { to: '/enrollment/intake', label: 'Intake', icon: 'chat', badge: (s) => s.leads.filter((l) => l.stage === 'intake').length },
          { to: '/enrollment/qualified', label: 'Qualified Leads', icon: 'check', badge: (s) => s.leads.filter((l) => l.stage === 'qualified').length },
          { to: '/enrollment/trials', label: 'Trials', icon: 'clock', badge: (s) => s.trials.filter((t) => t.status === 'scheduled').length },
          { to: '/enrollment/trial-dead', label: 'Trial Dead', icon: 'x', badge: (s) => s.leads.filter((l) => l.stage === 'trial_dead').length },
          { to: '/enrollment/unified-inbox', label: 'Unified Inbox', icon: 'chat' },
          { to: '/enrollment/user-management', label: 'User Management', icon: 'users' },
          { to: '/enrollment/connected-channels', label: 'Connected Channels', icon: 'chat' },
        ],
      },
      {
        group: 'Scheduling',
        items: [{ to: '/enrollment/schedule-trial', label: 'Trial Scheduling', icon: 'calendar' }],
      },
    ],
  },
  admin: {
    label: 'Admin & Support',
    base: '/admin',
    user: { name: 'Hafiz Mariam', role: 'Admin & Support' },
    groups: [
      {
        group: 'Overview',
        items: [{ to: '/admin/dashboard', label: 'Dashboard', icon: 'dashboard' }],
      },
      {
        group: 'Families',
        items: [
          { to: '/admin/families', label: 'Active Families', icon: 'family', badge: (s) => s.families.length },
          { to: '/admin/support', label: 'Customer Support', icon: 'chat' },
          { to: '/admin/communications', label: 'Communication History', icon: 'mail' },
        ],
      },
      {
        group: 'Helpdesk',
        items: [
          { to: '/admin/tickets', label: 'Support Tickets', icon: 'ticket', badge: (s) => s.tickets.filter((t) => t.status !== 'Closed').length },
        ],
      },
    ],
  },
};
