# Noor CRM 2.0 — React

Modern React rebuild of the Noor CRM (E Online Quran) admin application:
two dedicated panels (Enrollment, Admin & Support), an intelligent Trial
Scheduling module, and family-first student management.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle in /dist
npm run preview    # serve the production build
```

No environment variables or backend needed — the app ships with a seeded
in-memory data layer (`src/data/seed.js`) behind a service/context boundary,
so swapping in a real API later only touches `src/services` and
`src/context/AppContext.jsx`.

See `ARCHITECTURE.md` for the folder structure, component hierarchy,
routing, state management and data-flow documentation.
# onlineteachng-crm
