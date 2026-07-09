import { createContext, useContext, useMemo, useReducer } from 'react';
import { seedAll } from '../data/seed';
import { isTutorFreeForSlot } from '../services/tutorService';
import { rnd } from '../utils/date';
import { AGENTS, SUPPORT_AGENTS } from '../data/seed';

const AppContext = createContext(null);

let trialSeq = 4001;
let familySeq = 2001;
let studentSeq = 9001;
let invoiceSeq = 7001;

const initialState = (() => {
  const { tutors, families, leads, trials, tickets } = seedAll();
  return { tutors, families, leads, trials, tickets, search: '' };
})();

function auditEntry(action, staff, reason, comments) {
  return {
    id: 'AUD-' + Date.now() + Math.floor(Math.random() * 1000),
    time: new Date(),
    staff,
    action,
    reason,
    comments,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_SEARCH':
      return { ...state, search: action.value };

    case 'MOVE_LEAD_STAGE': {
      const leads = state.leads.map((l) =>
        l.id === action.id
          ? {
              ...l,
              stage: action.stage,
              lastActivity: new Date(),
              timeline: [
                ...(l.timeline || []),
                { id: 'TL-' + Date.now(), time: new Date(), staff: action.staff || l.agent, action: `Status changed to ${action.stage}` },
              ],
            }
          : l,
      );
      return { ...state, leads };
    }

    case 'UPDATE_LEAD_FOLLOW_UP': {
      const leads = state.leads.map((l) =>
        l.id === action.id
          ? {
              ...l,
              nextFollowUp: action.nextFollowUp,
              priority: action.priority,
              lastActivity: new Date(),
              timeline: [
                ...(l.timeline || []),
                { id: 'TL-' + Date.now(), time: new Date(), staff: action.staff || l.agent, action: 'Follow-up updated' },
              ],
            }
          : l,
      );
      return { ...state, leads };
    }

    case 'ADD_LEAD': {
      const createdAt = action.lead.createdAt || new Date();
      const lead = {
        ...action.lead,
        communications: action.lead.communications || [],
        timeline: action.lead.timeline || [
          { id: 'TL-' + Date.now(), time: createdAt, staff: action.lead.agent || 'Enrollment', action: 'Lead Created' },
        ],
      };
      return { ...state, leads: [lead, ...state.leads] };
    }

    case 'ADD_LEAD_NOTE': {
      const leads = state.leads.map((l) =>
        l.id === action.id
          ? {
              ...l,
              notes: [...l.notes, action.note],
              timeline: [...(l.timeline || []), { id: 'TL-' + Date.now(), time: new Date(), staff: action.note.author, action: 'Lead Note Added' }],
            }
          : l,
      );
      return { ...state, leads };
    }

    case 'ADD_LEAD_MESSAGE': {
      const leads = state.leads.map((l) =>
        l.id === action.id
          ? {
              ...l,
              communications: [...(l.communications || []), action.message],
              lastActivity: new Date(),
              timeline: [
                ...(l.timeline || []),
                { id: 'TL-' + Date.now(), time: action.message.time, staff: action.message.who, action: `${action.message.channel} ${action.message.dir === 'out' ? 'Conversation Started' : 'Parent Replied'}` },
              ],
            }
          : l,
      );
      return { ...state, leads };
    }

    case 'SCHEDULE_TRIAL': {
      const { trial, tutorBooking } = action;
      const tutors = state.tutors.map((t) =>
        t.id === trial.tutorId ? { ...t, bookings: [...t.bookings, tutorBooking] } : t,
      );
      const leads = state.leads.map((l) =>
        l.id === trial.leadId
          ? {
              ...l,
              stage: 'trial',
              lastActivity: new Date(),
              timeline: [
                ...(l.timeline || []),
                { id: 'TL-' + Date.now(), time: new Date(), staff: action.staff || l.agent, action: 'Demo Class Scheduled' },
              ],
            }
          : l,
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

    case 'ADD_FAMILY_NOTE': {
      const families = state.families.map((f) =>
        f.id === action.familyId
          ? {
              ...f,
              supportNotes: [...(f.supportNotes || []), action.note],
              familyDiary: [
                ...(f.familyDiary || []),
                {
                  id: 'DIA-' + Date.now(),
                  time: action.note.time,
                  staff: action.note.author,
                  department: 'Admin & Support',
                  category: action.category || 'General Note',
                  note: action.note.text,
                  followUpRequired: !!action.followUpRequired,
                },
              ],
              auditLog: [...(f.auditLog || []), auditEntry('Family diary note added', action.note.author, action.category || 'General Note', action.note.text)],
              lastActivity: new Date(),
            }
          : f,
      );
      return { ...state, families };
    }

    case 'CHANGE_FAMILY_STATUS': {
      const families = state.families.map((f) => {
        if (f.id !== action.familyId) return f;
        const patch = {
          status: action.status,
          statusReason: action.reason,
          cancellationReason: action.status === 'dead' ? action.reason : f.cancellationReason,
          leaveStartDate: action.leaveStartDate || null,
          expectedReturnDate: action.expectedReturnDate || null,
          closureDate: action.status === 'dead' ? new Date() : f.closureDate,
          lastActivity: new Date(),
          auditLog: [
            ...(f.auditLog || []),
            auditEntry(`Family marked ${action.status.replace('_', ' ')}`, action.requestedBy, action.reason, action.notes),
          ],
          familyDiary: [
            ...(f.familyDiary || []),
            {
              id: 'DIA-' + Date.now(),
              time: new Date(),
              staff: action.requestedBy,
              department: 'Admin & Support',
              category: action.status === 'on_leave' ? 'Leave Request' : 'General Note',
              note: action.notes || action.reason,
              followUpRequired: action.status === 'on_leave',
            },
          ],
        };
        if (action.status === 'active') {
          patch.closureDate = null;
          patch.leaveStartDate = null;
          patch.expectedReturnDate = null;
        }
        return { ...f, ...patch };
      });
      return { ...state, families };
    }

    case 'SUBMIT_APPROVAL_REQUEST': {
      const families = state.families.map((f) =>
        f.id === action.familyId
          ? {
              ...f,
              approvalRequests: [
                ...(f.approvalRequests || []),
                {
                  id: 'APR-' + Date.now(),
                  actionLabel: action.actionLabel,
                  requestedBy: action.requestedBy,
                  reason: action.reason,
                  comments: action.comments,
                  status: 'Pending',
                  requestedAt: new Date(),
                  approvedBy: null,
                  reviewedAt: null,
                },
              ],
              auditLog: [...(f.auditLog || []), auditEntry(`Approval requested: ${action.actionLabel}`, action.requestedBy, action.reason, action.comments)],
              lastActivity: new Date(),
            }
          : f,
      );
      return { ...state, families };
    }

    case 'REVIEW_APPROVAL_REQUEST': {
      const families = state.families.map((f) =>
        f.id === action.familyId
          ? {
              ...f,
              approvalRequests: (f.approvalRequests || []).map((r) =>
                r.id === action.requestId
                  ? { ...r, status: action.status, approvedBy: action.approvedBy, reviewedAt: new Date(), reviewComments: action.comments }
                  : r,
              ),
              auditLog: [...(f.auditLog || []), auditEntry(`Approval ${action.status.toLowerCase()}`, action.approvedBy, action.requestId, action.comments)],
              lastActivity: new Date(),
            }
          : f,
      );
      return { ...state, families };
    }

    case 'UPDATE_ATTENDANCE': {
      const families = state.families.map((f) =>
        f.id !== action.familyId
          ? f
          : {
              ...f,
              students: f.students.map((s) =>
                s.id === action.studentId
                  ? {
                      ...s,
                      attendance: [
                        { date: action.date, status: action.status, staff: action.staff, reason: action.reason, adjustedAt: new Date() },
                        ...s.attendance,
                      ],
                    }
                  : s,
              ),
              auditLog: [...(f.auditLog || []), auditEntry('Attendance adjusted', action.staff, action.reason, action.status)],
              lastActivity: new Date(),
            },
      );
      return { ...state, families };
    }

    case 'EDIT_FAMILY_NOTE': {
      const families = state.families.map((f) =>
        f.id === action.familyId
          ? {
              ...f,
              supportNotes: (f.supportNotes || []).map((n) =>
                n.id === action.noteId ? { ...n, text: action.text, editedAt: new Date(), editedBy: action.staff } : n,
              ),
            }
          : f,
      );
      return { ...state, families };
    }

    case 'RESTORE_FAMILY': {
      const families = state.families.map((f) =>
        f.id === action.familyId ? { ...f, status: 'active', cancellationReason: '', lastActivity: new Date() } : f,
      );
      return { ...state, families };
    }

    case 'ADD_STUDENT_INVOICE': {
      const families = state.families.map((f) =>
        f.id !== action.familyId
          ? f
          : {
              ...f,
              students: f.students.map((s) =>
                s.id === action.studentId ? { ...s, payments: [action.invoice, ...s.payments] } : s,
              ),
            },
      );
      return { ...state, families };
    }

    case 'UPDATE_STUDENT_INVOICE': {
      const families = state.families.map((f) =>
        f.id !== action.familyId
          ? f
          : {
              ...f,
              students: f.students.map((s) =>
                s.id === action.studentId
                  ? { ...s, payments: s.payments.map((p) => (p.id === action.invoiceId ? { ...p, ...action.patch } : p)) }
                  : s,
              ),
            },
      );
      return { ...state, families };
    }

    case 'DELETE_STUDENT_INVOICE': {
      const families = state.families.map((f) =>
        f.id !== action.familyId
          ? f
          : {
              ...f,
              students: f.students.map((s) =>
                s.id === action.studentId ? { ...s, payments: s.payments.filter((p) => p.id !== action.invoiceId) } : s,
              ),
            },
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
      moveLeadStage: (id, stage, staff) => dispatch({ type: 'MOVE_LEAD_STAGE', id, stage, staff }),
      updateLeadFollowUp: (id, nextFollowUp, priority, staff) => dispatch({ type: 'UPDATE_LEAD_FOLLOW_UP', id, nextFollowUp, priority, staff }),
      addLead: (lead) => dispatch({ type: 'ADD_LEAD', lead }),
      addLeadNote: (id, text, staff = rnd(AGENTS)) =>
        dispatch({ type: 'ADD_LEAD_NOTE', id, note: { id: 'NOTE-' + Date.now(), text, author: staff, time: new Date() } }),
      addLeadMessage: (id, payload) =>
        dispatch({
          type: 'ADD_LEAD_MESSAGE',
          id,
          message: { id: 'MSG-' + Date.now(), time: new Date(), ...payload },
        }),

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
          staff: payload.staff,
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

      addStudentNote: (familyId, studentId, text, staff = rnd(SUPPORT_AGENTS)) =>
        dispatch({ type: 'ADD_STUDENT_NOTE', familyId, studentId, note: { id: 'NOTE-' + Date.now(), text, author: staff, time: new Date(), editedAt: null } }),
      addFamilyMessage: (familyId, message) => dispatch({ type: 'ADD_FAMILY_MESSAGE', familyId, message }),
      addFamilyNote: (familyId, text, staff = rnd(SUPPORT_AGENTS)) =>
        dispatch({ type: 'ADD_FAMILY_NOTE', familyId, note: { id: 'NOTE-' + Date.now(), text, author: staff, time: new Date(), editedAt: null } }),
      addFamilyDiaryEntry: (familyId, text, category = 'General Note', staff = rnd(SUPPORT_AGENTS), followUpRequired = false) =>
        dispatch({ type: 'ADD_FAMILY_NOTE', familyId, category, followUpRequired, note: { id: 'NOTE-' + Date.now(), text, author: staff, time: new Date(), editedAt: null } }),
      changeFamilyStatus: (familyId, payload) => dispatch({ type: 'CHANGE_FAMILY_STATUS', familyId, ...payload }),
      submitApprovalRequest: (familyId, payload) => dispatch({ type: 'SUBMIT_APPROVAL_REQUEST', familyId, ...payload }),
      reviewApprovalRequest: (familyId, requestId, status, approvedBy, comments) =>
        dispatch({ type: 'REVIEW_APPROVAL_REQUEST', familyId, requestId, status, approvedBy, comments }),
      updateAttendance: (familyId, studentId, payload) => dispatch({ type: 'UPDATE_ATTENDANCE', familyId, studentId, ...payload }),
      editFamilyNote: (familyId, noteId, text, staff = rnd(SUPPORT_AGENTS)) =>
        dispatch({ type: 'EDIT_FAMILY_NOTE', familyId, noteId, text, staff }),
      restoreFamily: (familyId) => dispatch({ type: 'RESTORE_FAMILY', familyId }),
      addStudentInvoice: (familyId, studentId, invoice) =>
        dispatch({ type: 'ADD_STUDENT_INVOICE', familyId, studentId, invoice: { id: 'INV-' + invoiceSeq++, date: new Date(), status: 'due', ...invoice } }),
      updateStudentInvoice: (familyId, studentId, invoiceId, patch) =>
        dispatch({ type: 'UPDATE_STUDENT_INVOICE', familyId, studentId, invoiceId, patch }),
      deleteStudentInvoice: (familyId, studentId, invoiceId) =>
        dispatch({ type: 'DELETE_STUDENT_INVOICE', familyId, studentId, invoiceId }),
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
