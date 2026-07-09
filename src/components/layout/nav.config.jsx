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
        group: 'Inbox',
        items: [{ to: '/enrollment/unified-inbox', label: 'Unified Inbox', icon: 'chat' }],
      },
      {
        group: 'Pipeline',
        items: [
          { to: '/enrollment/new-leads', label: 'New Leads', icon: 'users', badge: (s) => s.leads.filter((l) => l.stage === 'raw').length },
          { to: '/enrollment/qualified', label: 'Qualified Leads', icon: 'check', badge: (s) => s.leads.filter((l) => l.stage === 'qualified').length },
          { to: '/enrollment/trials', label: 'Trial Students', icon: 'clock', badge: (s) => s.trials.filter((t) => t.status === 'scheduled').length },
          { to: '/enrollment/trial-dead', label: 'Trial Dead', icon: 'x', badge: (s) => s.leads.filter((l) => l.stage === 'trial_dead').length },
          { to: '/enrollment/reports', label: 'Reports', icon: 'card' },
          { to: '/enrollment/connected-channels', label: 'Connected Channels', icon: 'chat' },
        ],
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
        group: 'Families & Students',
        items: [
          { to: '/admin/families', label: 'Active Families', icon: 'family', badge: (s) => s.families.filter((f) => f.status === 'active').length },
          { to: '/admin/families-on-leave', label: 'Families on Leave', icon: 'clock', badge: (s) => s.families.filter((f) => f.status === 'on_leave').length },
          { to: '/admin/dead-families', label: 'Dead Families', icon: 'x', badge: (s) => s.families.filter((f) => f.status === 'dead').length },
          { to: '/admin/active-students', label: 'Active Students', icon: 'users', badge: (s) => s.families.filter((f) => f.status === 'active').flatMap((f) => f.students).length },
          { to: '/admin/student-profiles', label: 'Student Profiles', icon: 'user' },
        ],
      },
      {
        group: 'Scheduling',
        items: [
          { to: '/admin/teacher-schedule', label: 'Teacher Schedule', icon: 'calendar' },
          { to: '/admin/class-schedule', label: 'Class Schedule', icon: 'calendar' },
        ],
      },
      {
        group: 'Support',
        items: [
          { to: '/admin/support', label: 'Customer Support', icon: 'chat' },
          { to: '/admin/unified-inbox', label: 'Unified Inbox', icon: 'chat' },
          { to: '/admin/tickets', label: 'Ticket System', icon: 'ticket', badge: (s) => s.tickets.filter((t) => t.status !== 'Closed').length },
        ],
      },
      {
        group: 'Operations',
        items: [
          { to: '/admin/attendance', label: 'Attendance', icon: 'check' },
          { to: '/admin/student-notes', label: 'Student Notes', icon: 'note' },
          { to: '/admin/family-diary', label: 'Family Diary', icon: 'book' },
          { to: '/admin/parent-communication', label: 'Parent Communication', icon: 'mail' },
          { to: '/admin/billing-invoices', label: 'Billing & Invoices', icon: 'card' },
          { to: '/admin/reports', label: 'Reports', icon: 'card' },
          { to: '/admin/approvals', label: 'Approvals', icon: 'check' },
        ],
      },
    ],
  },
};
