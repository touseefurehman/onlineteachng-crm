import { createContext, useContext, useMemo, useReducer } from 'react';
import { seedAll } from '../data/seed';
import { isTutorFreeForSlot } from '../services/tutorService';
import { rnd } from '../utils/date';
import { SUPPORT_AGENTS } from '../data/seed';

const AppContext = createContext(null);

let trialSeq = 4001;
let familySeq = 2001;
let studentSeq = 9001;

const initialState = (() => {
  const { tutors, families, leads, trials, tickets } = seedAll();
  return { tutors, families, leads, trials, tickets, search: '' };
})();

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.value };

    case 'MOVE_LEAD_STAGE': {
      const leads = state.leads.map((l) =>
        l.id === action.id ? { ...l, stage: action.stage, lastActivity: new Date() } : l,
      );
      return { ...state, leads };
    }

    case 'ADD_LEAD':
      return { ...state, leads: [action.lead, ...state.leads] };

    case 'ADD_LEAD_NOTE': {
      const leads = state.leads.map((l) =>
        l.id === action.id ? { ...l, notes: [...l.notes, action.note] } : l,
      );
      return { ...state, leads };
    }

    case 'SCHEDULE_TRIAL': {
      const { trial, tutorBooking } = action;
      const tutors = state.tutors.map((t) =>
        t.id === trial.tutorId ? { ...t, bookings: [...t.bookings, tutorBooking] } : t,
      );
      const leads = state.leads.map((l) =>
        l.id === trial.leadId ? { ...l, stage: 'trial', lastActivity: new Date() } : l,
      );
      return { ...state, tutors, leads, trials: [trial, ...state.trials] };
    }

    case 'RESCHEDULE_TRIAL': {
      const { trialId, date, start, end, tutorId, tutorName, timezone } = action;
      const trials = state.trials.map((t) =>
        t.id === trialId
          ? {
              ...t, date, start, end, tutorId, tutorName, timezone: timezone || t.timezone,
              status: 'scheduled',
              history: [...t.history, { label: `Rescheduled to ${date} ${start} with ${tutorName}`, time: new Date() }],
            }
          : t,
      );
      // rebuild the affected tutors' bookings for this trial
      const tutors = state.tutors.map((t) => {
        let bookings = t.bookings.filter((b) => b.trialId !== trialId);
        if (t.id === tutorId) {
          const trial = trials.find((x) => x.id === trialId);
          bookings = [...bookings, { trialId, date, start, end, label: `Trial — ${trial.studentName}` }];
        }
        return { ...t, bookings };
      });
      return { ...state, trials, tutors };
    }

    case 'SET_TRIAL_STATUS': {
      const trials = state.trials.map((t) =>
        t.id === action.id
          ? { ...t, status: action.status, history: [...t.history, { label: `Status → ${action.status}`, time: new Date() }] }
          : t,
      );
      let leads = state.leads;
      const trial = state.trials.find((t) => t.id === action.id);
      if (trial?.leadId && (action.status === 'cancelled' || action.status === 'no_show')) {
        leads = leads.map((l) => (l.id === trial.leadId ? { ...l, stage: 'trial_dead' } : l));
      }
      return { ...state, trials, leads };
    }

    case 'CONVERT_TRIAL_TO_FAMILY': {
      const trial = state.trials.find((t) => t.id === action.id);
      if (!trial) return state;
      const lead = state.leads.find((l) => l.id === trial.leadId);
      const family = {
        id: 'FAM-' + familySeq++,
        parent: lead ? { ...lead.parent } : { name: trial.parentName, email: '', phone: '', country: '', timezone: trial.timezone, preferredContact: 'WhatsApp' },
        surname: (lead?.parent.name || trial.parentName).split(' ').slice(-1)[0],
        students: (lead?.students || [{ name: trial.studentName, age: '', gender: '', grade: '' }]).map((s) => ({
          id: 'STU-' + studentSeq++,
          name: s.name,
          age: s.age || '—',
          gender: s.gender || '—',
          grade: s.grade || '—',
          course: trial.course,
          teacher: trial.tutorName,
          schedule: (trial.studyDays || [1, 3]).map((day) => ({ day, time: trial.start, durationMin: 30 })),
          attendance: [],
          payments: [],
          notes: trial.notes ? [{ text: trial.notes, author: 'Enrollment', time: new Date() }] : [],
          status: 'active',
        })),
        status: 'active',
        createdAt: new Date(),
        lastActivity: new Date(),
        communications: [],
        supportNotes: [],
      };
      const trials = state.trials.map((t) =>
        t.id === action.id
          ? { ...t, status: 'converted', familyId: family.id, history: [...t.history, { label: `Converted → ${family.id}`, time: new Date() }] }
          : t,
      );
      const leads = state.leads.filter((l) => l.id !== trial.leadId);
      return { ...state, trials, leads, families: [family, ...state.families] };
    }

    case 'ADD_STUDENT_NOTE': {
      const families = state.families.map((f) =>
        f.id !== action.familyId
          ? f
          : {
              ...f,
              students: f.students.map((s) =>
                s.id === action.studentId ? { ...s, notes: [...s.notes, action.note] } : s,
              ),
            },
      );
      return { ...state, families };
    }

    case 'ADD_FAMILY_MESSAGE': {
      const families = state.families.map((f) =>
        f.id === action.familyId
          ? { ...f, communications: [...f.communications, action.message], lastActivity: new Date() }
          : f,
      );
      return { ...state, families };
    }

    case 'SET_TICKET_STATUS': {
      const tickets = state.tickets.map((t) =>
        t.id === action.id ? { ...t, status: action.status } : t,
      );
      return { ...state, tickets };
    }

    case 'ADD_TICKET':
      return { ...state, tickets: [action.ticket, ...state.tickets] };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const actions = useMemo(
    () => ({
      setSearch: (value) => dispatch({ type: 'SET_SEARCH', value }),
      moveLeadStage: (id, stage) => dispatch({ type: 'MOVE_LEAD_STAGE', id, stage }),
      addLead: (lead) => dispatch({ type: 'ADD_LEAD', lead }),
      addLeadNote: (id, note) => dispatch({ type: 'ADD_LEAD_NOTE', id, note }),

      /**
       * Schedule a trial. Returns { ok, error?, trial? }.
       * Re-validates tutor availability so double-booking is impossible
       * even if the UI is stale.
       */
      scheduleTrial: (payload, tutorsSnapshot) => {
        const tutor = tutorsSnapshot.find((t) => t.id === payload.tutorId);
        if (!tutor) return { ok: false, error: 'Select an available tutor before scheduling.' };
        if (!isTutorFreeForSlot(tutor, payload)) {
          return { ok: false, error: `${tutor.name} is no longer free for this slot. Refresh available tutors.` };
        }
        const trial = {
          id: 'TRL-' + trialSeq++,
          leadId: payload.leadId || null,
          familyId: null,
          parentName: payload.parentName,
          studentName: payload.studentName,
          course: payload.course,
          date: payload.date,
          start: payload.start,
          end: payload.end,
          timezone: payload.timezone,
          tutorId: tutor.id,
          tutorName: tutor.name,
          platform: payload.platform,
          status: payload.status || 'scheduled',
          notes: payload.notes || '',
          studyDays: payload.studyDays || [],
          createdAt: new Date(),
          history: [{ label: `Trial scheduled with ${tutor.name}`, time: new Date() }],
        };
        dispatch({
          type: 'SCHEDULE_TRIAL',
          trial,
          tutorBooking: { trialId: trial.id, date: trial.date, start: trial.start, end: trial.end, label: `Trial — ${trial.studentName}` },
        });
        return { ok: true, trial };
      },

      rescheduleTrial: (trialId, slot, tutor, tutorsSnapshot) => {
        const target = tutorsSnapshot.find((t) => t.id === tutor.id);
        if (!target || !isTutorFreeForSlot(target, slot, trialId)) {
          return { ok: false, error: `${tutor.name} is not free for the new slot.` };
        }
        dispatch({ type: 'RESCHEDULE_TRIAL', trialId, ...slot, tutorId: tutor.id, tutorName: tutor.name });
        return { ok: true };
      },

      setTrialStatus: (id, status) => dispatch({ type: 'SET_TRIAL_STATUS', id, status }),
      convertTrial: (id) => dispatch({ type: 'CONVERT_TRIAL_TO_FAMILY', id }),

      addStudentNote: (familyId, studentId, text) =>
        dispatch({ type: 'ADD_STUDENT_NOTE', familyId, studentId, note: { text, author: rnd(SUPPORT_AGENTS), time: new Date() } }),
      addFamilyMessage: (familyId, message) => dispatch({ type: 'ADD_FAMILY_MESSAGE', familyId, message }),
      setTicketStatus: (id, status) => dispatch({ type: 'SET_TICKET_STATUS', id, status }),
      addTicket: (ticket) => dispatch({ type: 'ADD_TICKET', ticket }),
    }),
    [],
  );

  const value = useMemo(() => ({ ...state, actions }), [state, actions]);
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
