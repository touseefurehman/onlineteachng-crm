import { useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Field from '../../components/ui/Field';
import Tabs from '../../components/ui/Tabs';
import EmptyState from '../../components/ui/EmptyState';
import { Card, CardBody, CardHead } from '../../components/ui/Card';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { fmtDate, fmtDateTime, fmtTime, DAY_LABELS } from '../../utils/date';

const STUDENT_TABS = [
  { key: 'schedule', label: 'Schedule' },
  { key: 'attendance', label: 'Attendance' },
  { key: 'teachers', label: 'Teachers' },
  { key: 'courses', label: 'Courses' },
  { key: 'payments', label: 'Payments' },
  { key: 'notes', label: 'Notes' },
];

export default function FamilyProfile() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { families, tutors, actions } = useApp();

  const family = families.find((f) => f.id === id);
  const [studentId, setStudentId] = useState(params.get('student') || family?.students[0]?.id);
  const [tab, setTab] = useState('schedule');
  const [noteDraft, setNoteDraft] = useState('');

  const student = useMemo(
    () => family?.students.find((s) => s.id === studentId) || family?.students[0],
    [family, studentId],
  );

  if (!family) {
    return (
      <Card><EmptyState icon="family" title="Family not found">
        This family code doesn't exist. <Button variant="ghost" size="sm" onClick={() => navigate('/admin/families')}>Back to families</Button>
      </EmptyState></Card>
    );
  }

  const tutor = tutors.find((t) => t.name === student?.teacher);

  const addNote = () => {
    if (!noteDraft.trim()) return;
    actions.addStudentNote(family.id, student.id, noteDraft.trim());
    setNoteDraft('');
    toast(`Note added for ${student.name}.`);
  };

  return (
    <>
      <PageHeader
        title={`${family.surname} Family`}
        subtitle={<span><span className="mono">{family.id}</span> · active since {fmtDate(family.createdAt)}</span>}
        actions={<Button variant="ghost" onClick={() => navigate('/admin/families')}>Back to families</Button>}
      />

      <div className="grid" style={{ gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>
        {/* Parent profile — shared across the family */}
        <Card>
          <CardHead title="Parent profile" sub="Contact details shared across the family" />
          <CardBody style={{ paddingTop: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <Avatar name={family.parent.name} size={44} />
              <div>
                <b>{family.parent.name}</b>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{family.parent.country}</div>
              </div>
            </div>
            <div className="summary-row"><label>Phone</label><b>{family.parent.phone}</b></div>
            <div className="summary-row"><label>Email</label><b style={{ wordBreak: 'break-all' }}>{family.parent.email}</b></div>
            <div className="summary-row"><label>Preferred contact</label><b>{family.parent.preferredContact}</b></div>
            <div className="summary-row" style={{ borderBottom: 0 }}><label>Time zone</label><b>{family.parent.timezone}</b></div>
            <Button
              size="sm"
              variant="ghost"
              style={{ marginTop: 10, width: '100%' }}
              onClick={() => navigate(`/admin/support?familyId=${family.id}`)}
            >
              Open support conversation
            </Button>
          </CardBody>
        </Card>

        {/* Students */}
        <div style={{ display: 'grid', gap: 14 }}>
          <Card>
            <CardBody style={{ paddingBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.07em', textTransform: 'uppercase', color: 'var(--text-2)', marginBottom: 10 }}>
                Students in this family
              </div>
              <div className="chip-row">
                {family.students.map((s) => (
                  <button
                    key={s.id}
                    className={`filter-chip ${student?.id === s.id ? 'active' : ''}`}
                    onClick={() => setStudentId(s.id)}
                  >
                    {s.name} {family.surname}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          {student && (
            <Card>
              <CardHead
                title={`${student.name} ${family.surname}`}
                sub={`${student.grade} · age ${student.age} · ${student.course}`}
                right={<Badge tone="success">Active student</Badge>}
              />
              <CardBody>
                <Tabs tabs={STUDENT_TABS} active={tab} onChange={setTab} />
                <div style={{ paddingTop: 16 }}>
                  {tab === 'schedule' && (
                    student.schedule.length ? (
                      <table style={{ minWidth: 0 }}>
                        <thead><tr><th>Day</th><th>Time</th><th>Duration</th><th>Teacher</th></tr></thead>
                        <tbody>
                          {student.schedule.map((sl, i) => (
                            <tr key={i}>
                              <td><b>{DAY_LABELS[sl.day]}</b></td>
                              <td>{fmtTime(sl.time)}</td>
                              <td>{sl.durationMin} min</td>
                              <td>{student.teacher}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : <EmptyState icon="calendar" title="No schedule yet">Classes will appear once the first session is booked.</EmptyState>
                  )}

                  {tab === 'attendance' && (
                    student.attendance.length ? (
                      <>
                        {(() => {
                          const present = student.attendance.filter((a) => a.status === 'present').length;
                          const rate = Math.round((present / student.attendance.length) * 100);
                          return (
                            <div style={{ marginBottom: 14 }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 6 }}>
                                <span style={{ color: 'var(--text-2)' }}>Attendance rate (last {student.attendance.length} classes)</span>
                                <b>{rate}%</b>
                              </div>
                              <div className="progress-track"><div className="progress-fill" style={{ width: `${rate}%` }} /></div>
                            </div>
                          );
                        })()}
                        <table style={{ minWidth: 0 }}>
                          <thead><tr><th>Date</th><th>Status</th></tr></thead>
                          <tbody>
                            {student.attendance.map((a, i) => (
                              <tr key={i}>
                                <td>{fmtDate(a.date)}</td>
                                <td><Badge tone={a.status === 'present' ? 'success' : a.status === 'late' ? 'warning' : 'danger'}>{a.status}</Badge></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </>
                    ) : <EmptyState icon="check" title="No attendance yet">Attendance is recorded after each class.</EmptyState>
                  )}

                  {tab === 'teachers' && (
                    tutor ? (
                      <div className="tutor-card" style={{ cursor: 'default' }}>
                        <Avatar name={tutor.name} size={40} />
                        <div style={{ flex: 1 }}>
                          <b>{tutor.name}</b>
                          <div className="tutor-meta">
                            <span>★ {tutor.rating}</span>
                            <span>{tutor.gender === 'female' ? 'Female' : 'Male'}</span>
                            <span>{tutor.mode === 'remote' ? 'Remote' : 'On-site'}</span>
                            <span>{tutor.languages.join(' · ')}</span>
                            <span>Duty {fmtTime(tutor.dutyStart)}–{fmtTime(tutor.dutyEnd)}</span>
                          </div>
                        </div>
                        <Badge tone="teal" dot={false}>Assigned</Badge>
                      </div>
                    ) : <EmptyState icon="user" title="No teacher assigned">Assign a teacher from the scheduling flow.</EmptyState>
                  )}

                  {tab === 'courses' && (
                    <div className="tutor-card" style={{ cursor: 'default' }}>
                      <div className="brand-mark" aria-hidden="true">ق</div>
                      <div style={{ flex: 1 }}>
                        <b>{student.course}</b>
                        <div style={{ fontSize: 12, color: 'var(--text-2)' }}>Taught by {student.teacher} · {student.schedule.length} classes / week</div>
                      </div>
                      <Badge tone="success">In progress</Badge>
                    </div>
                  )}

                  {tab === 'payments' && (
                    student.payments.length ? (
                      <table style={{ minWidth: 0 }}>
                        <thead><tr><th>Invoice</th><th>Month</th><th>Amount</th><th>Status</th><th>Date</th></tr></thead>
                        <tbody>
                          {student.payments.map((p) => (
                            <tr key={p.id}>
                              <td className="mono" style={{ fontSize: 12 }}>{p.id}</td>
                              <td>{p.month}</td>
                              <td><b>${p.amount}</b></td>
                              <td><Badge tone={p.status === 'paid' ? 'success' : 'danger'}>{p.status}</Badge></td>
                              <td>{fmtDate(p.date)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : <EmptyState icon="card" title="No invoices yet">The first invoice is raised after the trial converts.</EmptyState>
                  )}

                  {tab === 'notes' && (
                    <>
                      {student.notes.length ? (
                        student.notes.map((n, i) => (
                          <div key={i} className="timeline-item">
                            <span className="timeline-dot" />
                            <div>
                              <div style={{ fontSize: 13.5 }}>{n.text}</div>
                              <div style={{ fontSize: 11.5, color: 'var(--text-3)' }}>{n.author} · {fmtDateTime(n.time)}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <EmptyState icon="note" title="No notes yet">Add the first note for this student below.</EmptyState>
                      )}
                      <Field style={{ marginTop: 12 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            value={noteDraft}
                            onChange={(e) => setNoteDraft(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addNote()}
                            placeholder={`Add a note about ${student.name}…`}
                          />
                          <Button onClick={addNote}>Add note</Button>
                        </div>
                      </Field>
                    </>
                  )}
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
