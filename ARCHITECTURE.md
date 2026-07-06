# Noor CRM 2.0 — Architecture Overview

## 1. Folder structure

```
noor-crm/
├── index.html                     # Vite entry, loads fonts (Fraunces / Inter / IBM Plex Mono)
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                   # React root, global CSS import
    ├── App.jsx                    # Router: the two panels and every route
    │
    ├── styles/
    │   └── global.css             # Design tokens (CSS variables) + component styles
    │
    ├── layouts/
    │   └── AppLayout.jsx          # Shell: Sidebar + Topbar + routed <Outlet/>
    │
    ├── components/
    │   ├── layout/
    │   │   ├── nav.config.jsx     # Panel-scoped navigation definition (single source of truth)
    │   │   ├── Sidebar.jsx        # NavLink-driven sidebar; active item = #00635D
    │   │   ├── Topbar.jsx         # Global search, clock, time zone, notifications
    │   │   └── PageHeader.jsx     # Title / subtitle / actions header
    │   ├── ui/                    # Reusable design-system primitives
    │   │   ├── Button.jsx         # primary / gold / ghost / danger-ghost, sm size
    │   │   ├── Card.jsx           # Card, CardHead, CardBody
    │   │   ├── Badge.jsx          # tone-based status pills + trial status maps
    │   │   ├── Avatar.jsx         # deterministic-color initials avatar
    │   │   ├── Field.jsx          # labelled input wrapper w/ error + hint states
    │   │   ├── Modal.jsx          # accessible dialog (Esc, scrim click, focus label)
    │   │   ├── Tabs.jsx           # role=tablist tab strip
    │   │   ├── StatCard.jsx       # dashboard KPI card
    │   │   ├── EmptyState.jsx     # icon + title + guidance
    │   │   ├── Skeleton.jsx       # SkeletonRow / SkeletonBlock loading states
    │   │   └── Icons.jsx          # central stroke-icon set (no icon dependency)
    │   ├── charts/
    │   │   ├── BarChart.jsx       # dependency-free SVG bar chart
    │   │   └── DonutChart.jsx     # dependency-free SVG donut + legend
    │   └── LeadTable.jsx          # reusable pipeline table (search, paging, skeletons, empty)
    │
    ├── pages/
    │   ├── enrollment/            # ENROLLMENT PANEL
    │   │   ├── Dashboard.jsx
    │   │   ├── StagePages.jsx     # NewLeads, Intake, Qualified, TrialDead (share LeadTable)
    │   │   ├── Trials.jsx         # trial list, statuses, convert, reschedule entry point
    │   │   └── TrialScheduling.jsx# the intelligent scheduler (schedule + reschedule modes)
    │   └── admin/                 # ADMIN & SUPPORT PANEL
    │       ├── Dashboard.jsx
    │       ├── Families.jsx       # expandable family cards (students grouped under family code)
    │       ├── FamilyProfile.jsx  # parent card + per-student tabs
    │       ├── Support.jsx        # conversation view with active families
    │       ├── Communications.jsx # cross-family message history
    │       └── Tickets.jsx        # helpdesk queue with lifecycle actions
    │
    ├── context/
    │   └── AppContext.jsx         # useReducer store + typed actions (the app's "backend")
    ├── services/
    │   └── tutorService.js        # availability, filtering, scoring, recommendation, TZ preview
    ├── hooks/
    │   ├── useToast.jsx           # ToastProvider + useToast()
    │   ├── useDebounce.js
    │   └── useSimulatedLoading.js # skeleton pass on data-view mount
    ├── data/
    │   └── seed.js                # constants + realistic seed generators
    └── utils/
        └── date.js                # date/time math, slot overlap, formatters
```

## 2. Component hierarchy

```
<App>
 └─ <AppProvider>            (global store)
     └─ <ToastProvider>      (notifications)
         └─ <BrowserRouter>
             └─ <AppLayout panel="enrollment" | "admin">
                 ├─ <Sidebar>   (nav.config → NavLink items, active = #00635D)
                 ├─ <Topbar>    (global search bound to store)
                 └─ <Outlet>    → page component
                     └─ pages compose: PageHeader, StatCard, Card,
                        LeadTable, Badge, Modal, Field, Tabs,
                        BarChart/DonutChart, EmptyState, Skeleton…
```

## 3. Routing

React Router v6, two route groups — one per panel. Each group mounts its own
`AppLayout` instance, so a panel can only ever render its own modules:

| Panel | Route | Page |
|---|---|---|
| — | `/` | redirect → `/enrollment/dashboard` |
| Enrollment | `/enrollment/dashboard` | Dashboard |
| Enrollment | `/enrollment/new-leads` | New Leads |
| Enrollment | `/enrollment/intake` | Intake |
| Enrollment | `/enrollment/qualified` | Qualified Leads |
| Enrollment | `/enrollment/trials` | Trials |
| Enrollment | `/enrollment/trial-dead` | Trial Dead |
| Enrollment | `/enrollment/schedule-trial` | Trial Scheduling (`?leadId=` prefill, `?rescheduleId=` reschedule mode) |
| Admin & Support | `/admin/dashboard` | Dashboard |
| Admin & Support | `/admin/families` | Active Families |
| Admin & Support | `/admin/families/:id` | Family Profile (`?student=` selects a student tab) |
| Admin & Support | `/admin/support` | Customer Support (`?familyId=` opens a thread) |
| Admin & Support | `/admin/communications` | Communication History |
| Admin & Support | `/admin/tickets` | Support Tickets |

The sidebar uses `NavLink`, so the **active item updates automatically on
navigation** and is styled with `background: #00635D`; all other items keep
the default appearance with smooth hover/transition effects.

**Panel separation.** The Enrollment nav config contains no routes to active
families, students, or customer support; the Admin & Support nav contains no
routes to raw/new leads, intake, qualified or trial pipeline pages. Because
navigation and routing are both derived from the panel prop, neither panel
can reach the other's modules through the UI.

## 4. State management

A single `AppContext` built on `useReducer` holds the domain state:

```
{ tutors, families, leads, trials, tickets, search }
```

Components never mutate state directly — they call **actions** exposed by the
provider (`scheduleTrial`, `rescheduleTrial`, `convertTrial`, `moveLeadStage`,
`addStudentNote`, `setTicketStatus`, …). Each action dispatches a reducer case
that returns new immutable state. This mirrors a Redux-style architecture
without the dependency, and gives one obvious seam for replacing the reducer
cases with API calls later.

Local, page-only concerns (form drafts, expanded rows, active tabs, pagination)
stay in component `useState` — global state carries only shared domain data.

## 5. Data flow

```
seed.js ──(once, on load)──▶ AppContext initial state
                                   │
        useApp() selectors ◀───────┤────▶ actions (dispatch)
                │                             │
     pages/components render          reducer validates + updates
                │                             │
        tutorService.js  ◀── pure functions ──┘
        (availability, scoring, recommendation)
```

### The trial-scheduling flow specifically

1. The page derives the requested slot `{date, start, end}` from the form.
2. `availableTutors(tutors, slot, filters)` returns only tutors who
   (a) pass the Female / Remote / Arabic + select filters,
   (b) are on duty for that weekday and duty window, and
   (c) have **no overlapping booking** on that date.
3. `recommendTutor(...)` scores the pool (rating, day-load freshness, course
   specialisation, language fit) and the best match is auto-selected and
   flagged "Best match" until the user picks manually.
4. On submit, `actions.scheduleTrial` **re-validates the slot against current
   state** before writing — so double-booking is impossible even with a stale
   screen. Scheduling atomically: creates the trial, books the tutor's
   calendar, and moves the lead to the Trial stage.
5. Rescheduling (`?rescheduleId=`) releases the old booking (bookings carry
   their `trialId`) and books the new slot in one reducer transaction.
6. Converting a trial creates a Family (with the students, teacher, schedule
   and notes carried over) and removes the lead from the pipeline — which is
   how records travel from the Enrollment panel to the Admin & Support panel.

## 6. Family model

```
Family { id (family code), parent {name, email, phone, country, timezone,
         preferredContact}, students[], communications[], status }
Student { id, name, age, gender, grade, course, teacher,
          schedule[], attendance[], payments[], notes[], status }
```

Students never appear as loose records: the Families page lists family cards;
expanding one reveals its students; each student has independent Schedule,
Attendance, Teachers, Courses, Payments and Notes tabs in the Family Profile,
while the parent's contact details are stored once on the family and shared.
