import { daysAgo, rnd, rndInt, toISODate, daysFromNow } from '../utils/date';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

export const COURSES = [
  'Qaida Reading',
  'Quran Reading (Nazra)',
  'Hifz Program',
  'Tajweed Mastery',
  'Tafsir Studies',
  'Islamic Studies',
  'Arabic Language',
];

export const COUNTRIES = ['USA', 'UK', 'Canada', 'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Australia', 'Germany', 'Pakistan'];

export const TIMEZONES = [
  'Asia/Karachi', 'Asia/Dubai', 'Asia/Riyadh', 'Europe/London', 'Europe/Berlin',
  'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'America/Toronto', 'Australia/Sydney',
];

export const SOURCES = ['Website Form', 'WhatsApp Inbound', 'Facebook Ad', 'Google Ad', 'Referral', 'Instagram DM'];

export const AGENTS = ['Sana Malik', 'Bilal Ahmed', 'Sohail Sales22', 'Fatima Noor', 'Usman Tariq', 'Ayesha Raza'];
export const SUPPORT_AGENTS = ['Mariam QC', 'Hassan Support', 'Rabia Care', 'Danish Helpdesk'];

export const TRIAL_STATUSES = ['scheduled', 'completed', 'no_show', 'converted', 'cancelled'];

export const PLATFORMS = ['Zoom', 'Google Meet', 'Microsoft Teams', 'Skype'];

const FIRST = ['Ahmed', 'Fatima', 'Yusuf', 'Amina', 'Bilal', 'Sarah', 'Omar', 'Layla', 'Hamza', 'Zainab', 'Ibrahim', 'Maryam', 'Zaid', 'Noor', 'Khalid', 'Aisha', 'Tariq', 'Hafsa', 'Rayan', 'Sumaya', 'Idris', 'Halima', 'Musa', 'Safiya', 'Adam', 'Nadia', 'Salman', 'Iman', 'Karim', 'Rania'];
const LAST = ['Khan', 'Ali', 'Rahman', 'Siddiqui', 'Hussain', 'Ahmed', 'Malik', 'Farooq', 'Iqbal', 'Rashid', 'Chaudhry', 'Baig', 'Sheikh', 'Qureshi', 'Abdullah', 'Hashmi', 'Yousuf', 'Aziz', 'Karimi', 'Osman'];

export const LEAD_STAGES = [
  { key: 'raw', label: 'New Lead' },
  { key: 'intake', label: 'Intake' },
  { key: 'qualified', label: 'Qualified' },
  { key: 'trial', label: 'Trial' },
  { key: 'trial_dead', label: 'Trial Dead' },
];

export function stageLabel(key) {
  const s = LEAD_STAGES.find((x) => x.key === key);
  if (s) return s.label;
  return key === 'active' ? 'Active' : key;
}

/* ------------------------------------------------------------------ */
/*  Tutors — availability engine data                                  */
/* ------------------------------------------------------------------ */

const TUTOR_DEFS = [
  ['Ustadha Khadija Noor', 'female', 'remote', 'Egypt', ['Arabic', 'English'], 4.9],
  ['Qari Abdul Basit', 'male', 'remote', 'Pakistan', ['Urdu', 'English'], 4.8],
  ['Ustadha Ruqayya Amin', 'female', 'onsite', 'Pakistan', ['Urdu', 'Arabic', 'English'], 4.7],
  ['Sheikh Mahmoud Farid', 'male', 'remote', 'Egypt', ['Arabic', 'English'], 4.9],
  ['Ustadha Hafsa Iqbal', 'female', 'remote', 'Pakistan', ['Urdu', 'English'], 4.6],
  ['Qari Imran Hashmi', 'male', 'onsite', 'Pakistan', ['Urdu', 'English'], 4.5],
  ['Ustadha Salma Yousuf', 'female', 'remote', 'Jordan', ['Arabic', 'English'], 4.8],
  ['Sheikh Naveed Qureshi', 'male', 'remote', 'Pakistan', ['Urdu', 'Arabic', 'English'], 4.7],
  ['Ustadha Amna Sheikh', 'female', 'onsite', 'Pakistan', ['Urdu', 'English'], 4.4],
  ['Qari Talha Baig', 'male', 'remote', 'Pakistan', ['Urdu', 'English'], 4.6],
  ['Ustadha Mariam Sami', 'female', 'remote', 'Egypt', ['Arabic', 'English'], 4.9],
  ['Sheikh Owais Rashid', 'male', 'remote', 'Pakistan', ['Urdu', 'English'], 4.3],
];

function makeTutors() {
  return TUTOR_DEFS.map(([name, gender, mode, nationality, languages, rating], i) => {
    // Duty windows differ per tutor so availability is realistic.
    const startHour = rnd([6, 8, 9, 10, 14, 16]);
    const span = rnd([6, 8, 10]);
    const days = gender === 'female' && i % 3 === 0
      ? [1, 2, 3, 4, 5] // weekdays only
      : [0, 1, 2, 3, 4, 5, 6].filter(() => Math.random() > 0.15);
    return {
      id: 'TUT-' + (100 + i),
      name,
      initials: name.split(' ').slice(-2).map((w) => w[0]).join('').toUpperCase(),
      gender,
      mode, // 'remote' | 'onsite'
      nationality,
      languages,
      rating,
      timezone: nationality === 'Egypt' ? 'Africa/Cairo' : nationality === 'Jordan' ? 'Asia/Amman' : 'Asia/Karachi',
      courses: COURSES.filter(() => Math.random() > 0.35).concat([rnd(COURSES)]),
      dutyStart: `${String(startHour).padStart(2, '0')}:00`,
      dutyEnd: `${String(Math.min(startHour + span, 23)).padStart(2, '0')}:00`,
      dutyDays: days.length ? days : [1, 2, 3],
      bookings: [], // { date:'YYYY-MM-DD', start:'HH:MM', end:'HH:MM', label }
    };
  });
}

/* ------------------------------------------------------------------ */
/*  Families & students                                                */
/* ------------------------------------------------------------------ */

let familySeq = 1001;
let studentSeq = 5001;

function makeStudent(course, tutorName) {
  const first = rnd(FIRST);
  const schedule = [
    { day: rnd([1, 3]), time: `${rndInt(16, 20)}:00`, durationMin: 30 },
    { day: rnd([2, 4, 6]), time: `${rndInt(16, 20)}:30`, durationMin: 30 },
  ];
  const attendance = Array.from({ length: 10 }, (_, i) => ({
    date: toISODate(daysAgo((i + 1) * 2)),
    status: rnd(['present', 'present', 'present', 'late', 'absent']),
  }));
  const payments = Array.from({ length: 4 }, (_, i) => {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    return {
      id: `INV-${rndInt(10000, 99999)}`,
      month: d.toLocaleString('en-GB', { month: 'long', year: 'numeric' }),
      amount: rnd([39.99, 49.99, 59.99]),
      status: i === 0 ? rnd(['paid', 'due']) : 'paid',
      date: toISODate(d),
    };
  });
  return {
    id: 'STU-' + studentSeq++,
    name: `${first}`,
    age: rndInt(6, 17),
    gender: rnd(['male', 'female']),
    grade: `Grade ${rndInt(1, 10)}`,
    course: course || rnd(COURSES),
    teacher: tutorName,
    schedule,
    attendance,
    payments,
    notes: Math.random() > 0.5
      ? [{ text: rnd(['Prefers evening classes after Isha.', 'Working on Surah Al-Mulk memorisation.', 'Needs revision of previous lesson weekly.']), author: rnd(SUPPORT_AGENTS), time: daysAgo(rndInt(1, 20)) }]
      : [],
    status: 'active',
  };
}

function makeFamily(tutors) {
  const last = rnd(LAST);
  const parentFirst = rnd(FIRST);
  const studentCount = rndInt(1, 3);
  const students = Array.from({ length: studentCount }, () =>
    makeStudent(rnd(COURSES), rnd(tutors).name),
  );
  const country = rnd(COUNTRIES);
  return {
    id: 'FAM-' + familySeq++,
    parent: {
      name: `${parentFirst} ${last}`,
      email: `${parentFirst}.${last}@mail.com`.toLowerCase(),
      phone: `+${rndInt(1, 971)} ${rndInt(300, 999)}-${rndInt(1000, 9999)}`,
      country,
      timezone: rnd(TIMEZONES),
      preferredContact: rnd(['WhatsApp', 'Email', 'Phone']),
    },
    surname: last,
    students,
    status: 'active',
    createdAt: daysAgo(rndInt(30, 400)),
    lastActivity: daysAgo(rndInt(0, 6)),
    communications: genCommunications(parentFirst + ' ' + last),
    supportNotes: [],
  };
}

const MSG_IN = [
  'Assalamualaikum, I wanted to ask about the class schedule.',
  'Can we reschedule tomorrow\u2019s class please?',
  'Jazakallah khair, the last lesson went really well!',
  'I need the Zoom link again, the previous one expired.',
  'Do you offer a female tutor for Tajweed?',
  'My child enjoyed the lesson, can we continue?',
];
const MSG_OUT = [
  'Walaikumassalam! Of course, sharing the updated schedule now.',
  'No problem, I\u2019ve rescheduled your class — confirmation sent.',
  'Alhamdulillah, glad to hear that! Progress report coming shortly.',
  'Here is your updated Zoom link for today\u2019s class.',
  'Yes, we can assign a qualified female tutor for you.',
  'That\u2019s wonderful! I\u2019ve noted your request.',
];

function genCommunications(parentName) {
  const channels = ['WhatsApp', 'Email', 'Zoom Chat'];
  const n = rndInt(3, 7);
  const out = [];
  for (let i = 0; i < n; i++) {
    const dir = i % 2 === 0 ? 'in' : 'out';
    out.push({
      id: 'MSG-' + rndInt(10000, 99999),
      dir,
      channel: rnd(channels),
      text: rnd(dir === 'in' ? MSG_IN : MSG_OUT),
      who: dir === 'in' ? parentName : rnd(SUPPORT_AGENTS),
      time: daysAgo(rndInt(0, 14)),
    });
  }
  return out.sort((a, b) => new Date(a.time) - new Date(b.time));
}

/* ------------------------------------------------------------------ */
/*  Leads (enrollment pipeline)                                        */
/* ------------------------------------------------------------------ */

let leadSeq = 801;

function makeLead(stage) {
  const last = rnd(LAST);
  const parentFirst = rnd(FIRST);
  const studentCount = rndInt(1, 2);
  return {
    id: 'LEAD-' + leadSeq++,
    stage,
    parent: {
      name: `${parentFirst} ${last}`,
      email: `${parentFirst}.${last}@mail.com`.toLowerCase(),
      phone: `+${rndInt(1, 971)} ${rndInt(300, 999)}-${rndInt(1000, 9999)}`,
      country: rnd(COUNTRIES),
      timezone: rnd(TIMEZONES),
      preferredContact: rnd(['WhatsApp', 'Email', 'Phone']),
    },
    students: Array.from({ length: studentCount }, () => ({
      name: rnd(FIRST),
      age: rndInt(5, 16),
      gender: rnd(['male', 'female', '']),
      grade: '',
      notes: '',
    })),
    course: rnd(COURSES),
    source: rnd(SOURCES),
    agent: rnd(AGENTS),
    tags: [rnd(['High Intent', 'Price Sensitive', 'Referral', 'Kids Program', 'Needs Female Tutor', 'Weekend Only'])],
    createdAt: daysAgo(rndInt(1, 60)),
    lastActivity: daysAgo(rndInt(0, 5)),
    notes: [],
  };
}

/* ------------------------------------------------------------------ */
/*  Trials & tickets                                                   */
/* ------------------------------------------------------------------ */

let trialSeq = 3001;

function makeTrialFor(lead, tutors) {
  const tutor = rnd(tutors);
  const date = toISODate(daysFromNow(rndInt(0, 6)));
  const startH = rndInt(9, 20);
  const start = `${String(startH).padStart(2, '0')}:00`;
  const end = `${String(startH).padStart(2, '0')}:30`;
  const trialId = 'TRL-' + trialSeq++;
  tutor.bookings.push({ trialId, date, start, end, label: `Trial — ${lead.students[0].name} ${lead.parent.name.split(' ')[1]}` });
  return {
    id: trialId,
    leadId: lead.id,
    familyId: null,
    parentName: lead.parent.name,
    studentName: lead.students[0].name,
    course: lead.course,
    date,
    start,
    end,
    timezone: lead.parent.timezone,
    tutorId: tutor.id,
    tutorName: tutor.name,
    platform: 'Zoom',
    status: 'scheduled',
    notes: '',
    studyDays: [1, 3],
    createdAt: new Date(),
    history: [{ label: 'Trial scheduled', time: new Date() }],
  };
}

const TICKET_SUBJECTS = ['Zoom link not working', 'Requesting class reschedule', 'Refund inquiry', 'Tutor change request', 'Billing discrepancy', 'App login issue', 'Certificate request'];

function makeTickets(families) {
  return families.slice(0, 12).map((f, i) => ({
    id: 'TCK-' + (3000 + i),
    familyId: f.id,
    familyName: `${f.surname} Family`,
    parentName: f.parent.name,
    subject: rnd(TICKET_SUBJECTS),
    status: rnd(['Open', 'Open', 'In Progress', 'Resolved', 'Closed']),
    priority: rnd(['Low', 'Medium', 'High']),
    agent: rnd(SUPPORT_AGENTS),
    channel: rnd(['WhatsApp', 'Email', 'Phone']),
    created: daysAgo(rndInt(0, 10)),
  }));
}

/* ------------------------------------------------------------------ */
/*  Seed everything                                                    */
/* ------------------------------------------------------------------ */

export function seedAll() {
  const tutors = makeTutors();

  const families = Array.from({ length: 14 }, () => makeFamily(tutors));

  // fill tutor calendars with existing class bookings so availability is meaningful
  families.forEach((f) =>
    f.students.forEach((s) => {
      const tutor = tutors.find((t) => t.name === s.teacher);
      if (!tutor) return;
      s.schedule.forEach((slot) => {
        for (let k = 0; k < 7; k++) {
          const d = daysFromNow(k);
          if (d.getDay() === slot.day) {
            tutor.bookings.push({
              date: toISODate(d),
              start: slot.time,
              end: `${slot.time.split(':')[0]}:${String(Number(slot.time.split(':')[1]) + slot.durationMin).padStart(2, '0')}`,
              label: `Class — ${s.name} ${f.surname}`,
            });
          }
        }
      });
    }),
  );

  const counts = { raw: 12, intake: 8, qualified: 7, trial: 6, trial_dead: 8 };
  const leads = [];
  Object.entries(counts).forEach(([stage, n]) => {
    for (let i = 0; i < n; i++) leads.push(makeLead(stage));
  });

  const trials = leads.filter((l) => l.stage === 'trial').map((l) => makeTrialFor(l, tutors));

  const tickets = makeTickets(families);

  return { tutors, families, leads, trials, tickets };
}
