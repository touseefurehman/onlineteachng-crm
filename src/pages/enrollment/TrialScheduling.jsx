import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import Icon from '../../components/ui/Icons';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import { Card, CardBody, CardHead } from '../../components/ui/Card';
import { SkeletonBlock } from '../../components/ui/Skeleton';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { COURSES, COUNTRIES, TIMEZONES, PLATFORMS, TRIAL_STATUSES } from '../../data/seed';
import {
  availableTutors, recommendTutor, scoreTutor, tutorLocalPreview,
} from '../../services/tutorService';
import { addMinutes, fmtTime, todayISO, DAY_LABELS } from '../../utils/date';

const DURATIONS = [30, 45, 60];
const NATIONALITIES = ['any', 'Pakistan', 'Egypt', 'Jordan'];

const emptyStudent = () => ({ name: '', age: '', gender: '', grade: '', notes: '' });

export default function TrialScheduling() {
  const { leads, trials, tutors, actions } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const leadId = params.get('leadId');
  const rescheduleId = params.get('rescheduleId');
  const lead = leads.find((l) => l.id === leadId) || null;
  const rescheduleTrial = trials.find((t) => t.id === rescheduleId) || null;
  const rescheduleLead = rescheduleTrial ? leads.find((l) => l.id === rescheduleTrial.leadId) : null;

  const sourceLead = lead || rescheduleLead;

  /* ------------------------------ form state ------------------------------ */
  const [parent, setParent] = useState({
    name: '', email: '', phone: '', country: 'Pakistan',
    timezone: 'Asia/Karachi', preferredContact: 'WhatsApp',
  });
  const [students, setStudents] = useState([emptyStudent()]);
  const [slot, setSlot] = useState({ date: todayISO(), start: '18:00', duration: 30 });
  const [studyDays, setStudyDays] = useState([1, 3]);
  const [filters, setFilters] = useState({
    femaleOnly: false, remoteOnly: false, arabicOnly: false,
    gender: 'any', mode: 'any', nationality: 'any', course: '',
  });
  const [tutorId, setTutorId] = useState('');
  const [platform, setPlatform] = useState('Zoom');
  const [trialStatus, setTrialStatus] = useState('scheduled');
  const [notes, setNotes] = useState('');
  const [language, setLanguage] = useState('English / Urdu / Arabic');
  const [errors, setErrors] = useState({});
  const [refreshing, setRefreshing] = useState(false);
  const [refreshedAt, setRefreshedAt] = useState(new Date());

  /* Prefill from lead or trial being rescheduled */
  useEffect(() => {
    if (sourceLead) {
      setParent({ ...sourceLead.parent });
      setStudents(sourceLead.students.map((s) => ({ ...emptyStudent(), ...s })));
      setFilters((f) => ({ ...f, course: sourceLead.course }));
    }
    if (rescheduleTrial) {
      setSlot({ date: rescheduleTrial.date, start: rescheduleTrial.start, duration: 30 });
      setStudyDays(rescheduleTrial.studyDays?.length ? rescheduleTrial.studyDays : [1, 3]);
      setFilters((f) => ({ ...f, course: rescheduleTrial.course }));
      setNotes(rescheduleTrial.notes || '');
      setPlatform(rescheduleTrial.platform || 'Zoom');
      if (!sourceLead) {
        setParent((p) => ({ ...p, name: rescheduleTrial.parentName, timezone: rescheduleTrial.timezone }));
        setStudents([{ ...emptyStudent(), name: rescheduleTrial.studentName }]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId, rescheduleId]);

  const end = addMinutes(slot.start, Number(slot.duration));
  const fullSlot = { date: slot.date, start: slot.start, end };

  /* ------------------- live availability + recommendation ------------------- */
  const available = useMemo(
    () => availableTutors(tutors, fullSlot, filters, rescheduleId),
    // refreshedAt forces re-evaluation on "Refresh Available Tutors"
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tutors, fullSlot.date, fullSlot.start, fullSlot.end, filters, rescheduleId, refreshedAt],
  );
  const recommended = useMemo(
    () => recommendTutor(tutors, fullSlot, filters, rescheduleId),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tutors, fullSlot.date, fullSlot.start, fullSlot.end, filters, rescheduleId, refreshedAt],
  );

  /* Auto-recommend: keep the best tutor selected until the user picks manually */
  const [manualPick, setManualPick] = useState(false);
  useEffect(() => {
    if (!manualPick) setTutorId(recommended?.id || '');
    else if (tutorId && !available.some((t) => t.id === tutorId)) {
      // manual pick became unavailable → fall back to recommendation
      setTutorId(recommended?.id || '');
      setManualPick(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recommended?.id, available.length]);

  const selectedTutor = tutors.find((t) => t.id === tutorId) || null;
  const tutorTimePreview = selectedTutor
    ? tutorLocalPreview(parent.timezone, selectedTutor.timezone, slot.start)
    : null;

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
      setRefreshedAt(new Date());
      toast(`Availability refreshed — ${available.length} tutor${available.length === 1 ? '' : 's'} free for this slot.`, 'info');
    }, 550);
  };

  /* ------------------------------- submit ------------------------------- */
  const submit = () => {
    const e = {};
    if (!parent.name.trim()) e.parentName = 'Parent name is required.';
    if (!parent.phone.trim()) e.phone = 'Contact number is required.';
    if (!students[0]?.name.trim()) e.student = 'Add at least one student name.';
    if (!filters.course) e.course = 'Select a course.';
    if (!slot.date) e.date = 'Pick a date.';
    if (!tutorId) e.tutor = 'Select an available tutor.';
    setErrors(e);
    if (Object.keys(e).length) {
      toast('Fix the highlighted fields to continue.', 'error');
      return;
    }

    if (rescheduleTrial) {
      const res = actions.rescheduleTrial(rescheduleTrial.id, fullSlot, selectedTutor, tutors);
      if (!res.ok) return toast(res.error, 'error');
      toast(`Trial rescheduled — ${students[0].name} with ${selectedTutor.name} on ${slot.date} at ${fmtTime(slot.start)}.`);
      navigate('/enrollment/trials');
      return;
    }

    const res = actions.scheduleTrial(
      {
        leadId: sourceLead?.id || null,
        parentName: parent.name,
        studentName: students[0].name,
        course: filters.course,
        ...fullSlot,
        timezone: parent.timezone,
        tutorId,
        platform,
        status: trialStatus,
        notes,
        studyDays,
      },
      tutors,
    );
    if (!res.ok) return toast(res.error, 'error');
    toast(`Trial scheduled — ${students[0].name} with ${selectedTutor.name}.`);
    navigate('/enrollment/trials');
  };

  /* ------------------------------ render ------------------------------ */
  const chip = (key, label) => (
    <button
      type="button"
      className={`filter-chip ${filters[key] ? 'active' : ''}`}
      aria-pressed={filters[key]}
      onClick={() => setFilters({ ...filters, [key]: !filters[key] })}
    >
      {label}
    </button>
  );

  return (
    <>
      {/* Hero banner mirroring the "Direct Trial Scheduling" screenshot */}
      <div
        style={{
          background: 'linear-gradient(120deg, var(--teal-900), var(--teal-700))',
          borderRadius: 'var(--radius-lg)', color: '#fff', padding: '22px 26px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16,
          flexWrap: 'wrap', marginBottom: 18, boxShadow: 'var(--shadow-md)',
        }}
      >
        <div>
          <div className="font-display" style={{ fontSize: 24, fontWeight: 600 }}>
            {rescheduleTrial ? 'Reschedule Trial' : 'Direct Trial Scheduling'}
          </div>
          <div style={{ color: '#c8ddda', fontSize: 13, marginTop: 4, maxWidth: 620 }}>
            {rescheduleTrial
              ? `Move ${rescheduleTrial.studentName}'s trial to a new slot. Only tutors free in the new slot can be chosen.`
              : 'Add the family and student, pick the student\u2019s time first, then choose only tutors who are free in that exact slot. No admin queue step.'}
          </div>
        </div>
        <span
          style={{
            background: 'linear-gradient(140deg, var(--gold-400), var(--gold-600))',
            color: 'var(--teal-950)', fontWeight: 700, fontSize: 12,
            borderRadius: 20, padding: '7px 14px', whiteSpace: 'nowrap',
          }}
        >
          ✓ Direct to Tutor
        </span>
      </div>

      <div className="sched-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
        {/* ---------------- LEFT column: the form ---------------- */}
        <div style={{ display: 'grid', gap: 16 }}>
          {/* Parent information */}
          <Card>
            <CardHead
              title="Parent Information"
              sub="Family contact details — shared across every student in the family."
              right={sourceLead && <Badge tone="teal" dot={false}>Lead {sourceLead.id}</Badge>}
            />
            <CardBody>
              <div className="form-grid">
                <Field label="Parent name" required error={errors.parentName}>
                  <input value={parent.name} onChange={(e) => setParent({ ...parent, name: e.target.value })} placeholder="e.g. Talat Soban" />
                </Field>
                <Field label="Email">
                  <input value={parent.email} onChange={(e) => setParent({ ...parent, email: e.target.value })} placeholder="parent@mail.com" />
                </Field>
                <Field label="Preferred contact">
                  <select value={parent.preferredContact} onChange={(e) => setParent({ ...parent, preferredContact: e.target.value })}>
                    <option>WhatsApp</option><option>Email</option><option>Phone</option>
                  </select>
                </Field>
                <Field label="Contact number" required error={errors.phone}>
                  <input value={parent.phone} onChange={(e) => setParent({ ...parent, phone: e.target.value })} placeholder="+92 316 5406991" />
                </Field>
                <Field label="Student country">
                  <select value={parent.country} onChange={(e) => setParent({ ...parent, country: e.target.value })}>
                    {COUNTRIES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Time zone" required hint="Time zone list follows the selected country.">
                  <select value={parent.timezone} onChange={(e) => setParent({ ...parent, timezone: e.target.value })}>
                    {TIMEZONES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </Field>
              </div>
            </CardBody>
          </Card>

          {/* Student information */}
          <Card>
            <CardHead
              title="Student Information"
              sub="Creates the student account(s) and links them to the family."
              right={<Badge tone="success" dot={false}>{students.length} student{students.length > 1 ? 's' : ''}</Badge>}
            />
            <CardBody>
              {errors.student && <div className="error-msg" style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 8 }}>{errors.student}</div>}
              <div style={{ display: 'grid', gap: 10 }}>
                {students.map((s, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.6fr 0.8fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}>
                    <Field label={i === 0 ? 'Student name' : undefined} required={i === 0}>
                      <input value={s.name} placeholder="Student name" onChange={(e) => setStudents(students.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />
                    </Field>
                    <Field label={i === 0 ? 'Age' : undefined}>
                      <input value={s.age} placeholder="Age" inputMode="numeric" onChange={(e) => setStudents(students.map((x, j) => (j === i ? { ...x, age: e.target.value } : x)))} />
                    </Field>
                    <Field label={i === 0 ? 'Gender' : undefined}>
                      <select value={s.gender} onChange={(e) => setStudents(students.map((x, j) => (j === i ? { ...x, gender: e.target.value } : x)))}>
                        <option value="">—</option><option value="male">Male</option><option value="female">Female</option>
                      </select>
                    </Field>
                    <Field label={i === 0 ? 'Grade / level' : undefined}>
                      <input value={s.grade} placeholder="e.g. Grade 5" onChange={(e) => setStudents(students.map((x, j) => (j === i ? { ...x, grade: e.target.value } : x)))} />
                    </Field>
                    <Field label={i === 0 ? 'Notes' : undefined}>
                      <input value={s.notes} placeholder="Optional" onChange={(e) => setStudents(students.map((x, j) => (j === i ? { ...x, notes: e.target.value } : x)))} />
                    </Field>
                    <Button variant="danger-ghost" size="sm" disabled={students.length === 1} onClick={() => setStudents(students.filter((_, j) => j !== i))} aria-label="Remove student">✕</Button>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <Button variant="ghost" size="sm" icon={<Icon name="plus" size={14} />} onClick={() => setStudents([...students, emptyStudent()])}>
                  Add student
                </Button>
              </div>
            </CardBody>
          </Card>

          {/* Direct trial slot */}
          <Card>
            <CardHead
              title="Preferred Date & Time"
              sub="Pick the student's slot first — the tutor list updates to only show tutors free in this exact slot."
              right={
                <Badge tone={available.length ? 'success' : 'warning'} dot={false}>
                  {available.length} tutor{available.length === 1 ? '' : 's'} available
                </Badge>
              }
            />
            <CardBody>
              <div className="form-grid-2">
                <div style={{ border: '1px solid var(--border-soft)', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Student time</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 10 }}>
                    <Field label="Date" required error={errors.date}>
                      <input type="date" min={todayISO()} value={slot.date} onChange={(e) => setSlot({ ...slot, date: e.target.value })} />
                    </Field>
                    <Field label="Start" required>
                      <input type="time" value={slot.start} onChange={(e) => setSlot({ ...slot, start: e.target.value })} />
                    </Field>
                    <Field label="Duration">
                      <select value={slot.duration} onChange={(e) => setSlot({ ...slot, duration: e.target.value })}>
                        {DURATIONS.map((d) => <option key={d} value={d}>{d} minutes</option>)}
                      </select>
                    </Field>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 8 }}>
                    Ends at <b>{fmtTime(end)}</b> ({parent.timezone})
                  </div>
                </div>
                <div style={{ border: '1px solid var(--border-soft)', borderRadius: 12, padding: 14 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Preferred study days</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {DAY_LABELS.map((d, i) => (
                      <button
                        key={d}
                        type="button"
                        className={`day-pill ${studyDays.includes(i) ? 'active' : ''}`}
                        aria-pressed={studyDays.includes(i)}
                        onClick={() => setStudyDays(studyDays.includes(i) ? studyDays.filter((x) => x !== i) : [...studyDays, i])}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 10 }}>
                    These days are saved for the family. The trial itself uses the exact date and time on the left.
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Tutor filters + intelligent list */}
          <Card>
            <CardHead
              title="Tutor Filters & Trial Settings"
              sub="Filters are applied before showing available tutors. Only tutors with duty hours covering the slot and no conflicting booking appear."
              right={<Badge tone="success" dot={false}>No admin queue</Badge>}
            />
            <CardBody>
              <div className="chip-row" style={{ marginBottom: 14 }}>
                {chip('femaleOnly', 'Female tutors')}
                {chip('remoteOnly', 'Remote tutors')}
                {chip('arabicOnly', 'Arabic-speaking tutors')}
              </div>
              <div className="form-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <Field label="Tutor gender">
                  <select value={filters.gender} onChange={(e) => setFilters({ ...filters, gender: e.target.value })}>
                    <option value="any">Any gender</option><option value="female">Female</option><option value="male">Male</option>
                  </select>
                </Field>
                <Field label="On-site / remote">
                  <select value={filters.mode} onChange={(e) => setFilters({ ...filters, mode: e.target.value })}>
                    <option value="any">Any mode</option><option value="remote">Remote / Online</option><option value="onsite">On-site</option>
                  </select>
                </Field>
                <Field label="Nationality">
                  <select value={filters.nationality} onChange={(e) => setFilters({ ...filters, nationality: e.target.value })}>
                    {NATIONALITIES.map((n) => <option key={n} value={n}>{n === 'any' ? 'Any nationality' : n}</option>)}
                  </select>
                </Field>
                <Field label="Course" required error={errors.course}>
                  <select value={filters.course} onChange={(e) => setFilters({ ...filters, course: e.target.value })}>
                    <option value="">Select course</option>
                    {COURSES.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '18px 0 10px', flexWrap: 'wrap', gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13.5 }}>Available tutors <span style={{ color: 'var(--danger)' }}>*</span></div>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                    Live for {slot.date} · {fmtTime(slot.start)}–{fmtTime(end)} · best match is picked automatically.
                  </div>
                </div>
                <Button variant="gold" icon={<Icon name="refresh" size={15} />} onClick={refresh} disabled={refreshing}>
                  {refreshing ? 'Refreshing…' : 'Refresh Available Tutors'}
                </Button>
              </div>
              {errors.tutor && <div style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 8 }}>{errors.tutor}</div>}

              {refreshing ? (
                <div style={{ display: 'grid', gap: 10 }}>
                  <SkeletonBlock height={64} /><SkeletonBlock height={64} /><SkeletonBlock height={64} />
                </div>
              ) : available.length ? (
                <div style={{ display: 'grid', gap: 10, paddingTop: 6 }}>
                  {available
                    .map((t) => ({ t, score: scoreTutor(t, fullSlot, filters) }))
                    .sort((a, b) => b.score - a.score)
                    .map(({ t, score }) => {
                      const isRec = recommended?.id === t.id;
                      return (
                        <button
                          key={t.id}
                          type="button"
                          className={`tutor-card ${tutorId === t.id ? 'selected' : ''} ${isRec ? 'recommended' : ''}`}
                          onClick={() => { setTutorId(t.id); setManualPick(true); }}
                        >
                          {isRec && <span className="rec-flag">Best match</span>}
                          <Avatar name={t.name} size={38} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <b style={{ fontSize: 13.5 }}>{t.name}</b>
                            <div className="tutor-meta">
                              <span>★ {t.rating}</span>
                              <span>{t.gender === 'female' ? 'Female' : 'Male'}</span>
                              <span>{t.mode === 'remote' ? 'Remote' : 'On-site'}</span>
                              <span>{t.nationality}</span>
                              <span>{t.languages.join(' · ')}</span>
                              <span>Duty {fmtTime(t.dutyStart)}–{fmtTime(t.dutyEnd)}</span>
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, letterSpacing: '.06em' }}>MATCH</div>
                            <b style={{ color: 'var(--teal-600)', fontSize: 15 }}>{score}</b>
                          </div>
                        </button>
                      );
                    })}
                </div>
              ) : (
                <EmptyState icon="clock" title="No available tutor for this slot">
                  Every tutor matching the filters is either off duty or already booked. Change the time, date or filters, then refresh.
                </EmptyState>
              )}

              <div className="form-grid" style={{ marginTop: 18 }}>
                <Field label="Platform">
                  <select value={platform} onChange={(e) => setPlatform(e.target.value)}>
                    {PLATFORMS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </Field>
                <Field label="Trial status">
                  <select value={trialStatus} onChange={(e) => setTrialStatus(e.target.value)}>
                    {TRIAL_STATUSES.filter((s) => s !== 'converted').map((s) => (
                      <option key={s} value={s}>{s.replace('_', '-')}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Tutor time preview">
                  <input
                    readOnly
                    value={tutorTimePreview || 'Select a tutor to see converted tutor time.'}
                    style={{ background: 'var(--bg)', color: tutorTimePreview ? 'var(--text-1)' : 'var(--text-3)' }}
                  />
                </Field>
              </div>
            </CardBody>
          </Card>

          {/* Preferences & notes */}
          <Card>
            <CardHead title="Preferences & Trial Notes" sub="Saved against the family and trial for reuse." />
            <CardBody>
              <div className="form-grid">
                <Field label="Preferred language">
                  <input value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="English / Urdu / Arabic" />
                </Field>
                <Field label="Mother tongue">
                  <input defaultValue="Urdu" />
                </Field>
                <Field label="Enrollment owner">
                  <input readOnly value="SohailSales22" style={{ background: 'var(--bg)' }} />
                </Field>
              </div>
              <Field label="Trial notes" style={{ marginTop: 14 }}>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Anything the tutor or enrollment team should know before the trial…"
                />
              </Field>
            </CardBody>
          </Card>

          {/* Footer actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, flexWrap: 'wrap' }}>
            <Button variant="ghost" onClick={() => navigate(rescheduleTrial ? '/enrollment/trials' : '/enrollment/qualified')}>
              {rescheduleTrial ? 'Back to Trials' : 'Back to Leads'}
            </Button>
            <Button variant="gold" icon={<Icon name="refresh" size={15} />} onClick={refresh} disabled={refreshing}>
              Refresh Available Tutors
            </Button>
            <Button onClick={submit} icon={<Icon name="calendar" size={15} />}>
              {rescheduleTrial ? 'Confirm Reschedule' : 'Create Student + Schedule Trial'}
            </Button>
          </div>
        </div>

        {/* ---------------- RIGHT column: live schedule summary ---------------- */}
        <Card className="summary-panel">
          <CardHead title="Schedule Summary" sub="Live preview before save." />
          <CardBody style={{ paddingTop: 6 }}>
            <div className="summary-row"><label>Parent / lead</label><b>{parent.name || '—'}</b></div>
            <div className="summary-row">
              <label>Students</label>
              <b>{students.filter((s) => s.name).length || 0} student{students.filter((s) => s.name).length === 1 ? '' : 's'}</b>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{students.filter((s) => s.name).map((s) => s.name).join(', ') || 'Add student details'}</div>
            </div>
            <div className="summary-row"><label>Course</label><b>{filters.course || 'Select course'}</b></div>
            <div className="summary-row">
              <label>Tutor</label>
              <b>{selectedTutor ? selectedTutor.name : available.length ? 'Select available tutor' : 'No available tutor for this slot'}</b>
              {selectedTutor && !manualPick && <div style={{ fontSize: 11.5, color: 'var(--gold-600)', fontWeight: 600 }}>Auto-recommended</div>}
            </div>
            <div className="summary-row">
              <label>Student time</label>
              <b>{slot.date} {fmtTime(slot.start)}</b>
              <div style={{ fontSize: 12, color: 'var(--text-2)' }}>({parent.timezone})</div>
            </div>
            <div className="summary-row"><label>Tutor time</label><b>{tutorTimePreview || '—'}</b></div>
            <div className="summary-row"><label>Platform · status</label><b>{platform} · {trialStatus.replace('_', '-')}</b></div>
            <div className="summary-row" style={{ borderBottom: 0 }}>
              <label>Saved for reuse</label>
              <div style={{ fontSize: 12.5, color: 'var(--text-2)' }}>Family contact, platform, time zone, language, study days, notes</div>
            </div>
            <div
              style={{
                marginTop: 10, background: 'var(--gold-100)', border: '1px solid #eadfb8',
                borderRadius: 10, padding: '10px 12px', fontSize: 12, color: '#6b5514', lineHeight: 1.5,
              }}
            >
              This page creates the student account(s), the class session and a trial request
              with status <b>{trialStatus.replace('_', '-')}</b>, and notifies the tutor immediately.
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
