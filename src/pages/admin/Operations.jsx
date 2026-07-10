import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Field from '../../components/ui/Field';
import Icon from '../../components/ui/Icons';
import Modal from '../../components/ui/Modal';
import StatCard from '../../components/ui/StatCard';
import { Card, CardBody, CardHead } from '../../components/ui/Card';
import BarChart from '../../components/charts/BarChart';
import DonutChart from '../../components/charts/DonutChart';
import { DIARY_CATEGORIES, SUPPORT_AGENTS } from '../../data/seed';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { fmtDate, fmtDateTime, fmtTime, DAY_LABELS, todayISO } from '../../utils/date';
import Pagination, { pageItems } from '../../components/ui/Pagination';

const FAMILY_STATUS_LABEL = { active: 'Active', on_leave: 'On Leave', dead: 'Dead' };
const FAMILY_STATUS_TONE = { active: 'success', on_leave: 'warning', dead: 'danger' };

function allStudents(families) {
  return families.flatMap((family) =>
    family.students.map((student) => ({ family, student })),
  );
}

function FamilyStatusModal({ family, targetStatus, onClose }) {
  const { actions } = useApp();
  const toast = useToast();
  const [form, setForm] = useState({
    reason: '',
    notes: '',
    requestedBy: 'Hafiz Mariam',
    leaveStartDate: todayISO(),
    expectedReturnDate: todayISO(),
  });
  const [errors, setErrors] = useState({});
  if (!family) return null;

  const submit = () => {
    const nextErrors = {};
    if (!form.reason.trim()) nextErrors.reason = 'Reason is required.';
    if (!form.requestedBy.trim()) nextErrors.requestedBy = 'Requested by is required.';
    if (targetStatus === 'on_leave') {
      if (!form.leaveStartDate) nextErrors.leaveStartDate = 'Leave start date is required.';
      if (!form.expectedReturnDate) nextErrors.expectedReturnDate = 'Expected return date is required.';
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;
    actions.changeFamilyStatus(family.id, { status: targetStatus, ...form });
    if (targetStatus === 'dead' || targetStatus === 'active') {
      actions.submitApprovalRequest(family.id, {
        actionLabel: targetStatus === 'dead' ? 'Mark Family as Dead' : 'Reactivate Family',
        requestedBy: form.requestedBy,
        reason: form.reason,
        comments: form.notes,
      });
    }
    toast(`${family.surname} Family status updated.`);
    onClose();
  };

  return (
    <Modal open title={`${FAMILY_STATUS_LABEL[targetStatus]} request`} onClose={onClose}>
      <div className="form-grid-2">
        <Field label="Reason" required error={errors.reason}>
          <input value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </Field>
        <Field label="Requested by" required error={errors.requestedBy}>
          <input value={form.requestedBy} onChange={(e) => setForm({ ...form, requestedBy: e.target.value })} />
        </Field>
        {targetStatus === 'on_leave' && (
          <>
            <Field label="Leave start date" required error={errors.leaveStartDate}>
              <input type="date" value={form.leaveStartDate} onChange={(e) => setForm({ ...form, leaveStartDate: e.target.value })} />
            </Field>
            <Field label="Expected return date" required error={errors.expectedReturnDate}>
              <input type="date" value={form.expectedReturnDate} onChange={(e) => setForm({ ...form, expectedReturnDate: e.target.value })} />
            </Field>
          </>
        )}
      </div>
      <Field label="Additional notes" style={{ marginTop: 14 }}>
        <textarea rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
      </Field>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={submit}>Submit</Button>
      </div>
    </Modal>
  );
}

function FamilyTable({ families, mode }) {
  const navigate = useNavigate();
  const [statusTarget, setStatusTarget] = useState(null);
  return (
    <>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Family</th><th>Country</th><th>Time zone</th><th>Students</th><th>Support officer</th><th>Billing</th><th>Status detail</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {families.length ? families.map((family) => (
              <tr key={family.id}>
                <td>
                  <div className="name-cell">
                    <Avatar name={`${family.surname} Family`} />
                    <div><b>{family.surname} Family</b><span className="mono">{family.id} · {family.parent.name}</span></div>
                  </div>
                </td>
                <td>{family.parent.country}</td>
                <td>{family.parent.timezone}</td>
                <td>{family.students.length}</td>
                <td>{family.supportOfficer || 'Hafiz Mariam'}</td>
                <td><Badge tone={family.billingStatus === 'Overdue' ? 'danger' : family.billingStatus === 'Due' ? 'warning' : 'success'}>{family.billingStatus || 'Paid'}</Badge></td>
                <td>
                  {mode === 'leave' && <span>{fmtDate(family.leaveStartDate)} to {fmtDate(family.expectedReturnDate)}</span>}
                  {mode === 'dead' && <span>{fmtDate(family.closureDate)} · {family.statusReason}</span>}
                  {mode === 'active' && <Badge tone="success">Active</Badge>}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/families/${family.id}`)}>Profile</Button>
                    {mode === 'active' && <Button size="sm" variant="ghost" onClick={() => setStatusTarget({ family, status: 'on_leave' })}>On Leave</Button>}
                    {mode === 'active' && <Button size="sm" variant="danger-ghost" onClick={() => setStatusTarget({ family, status: 'dead' })}>Dead</Button>}
                    {mode !== 'active' && <Button size="sm" onClick={() => setStatusTarget({ family, status: 'active' })}>Reactivate</Button>}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={8}><EmptyState icon="family" title="No families found">This section is clear.</EmptyState></td></tr>
            )}
          </tbody>
        </table>
      </div>
      {statusTarget && <FamilyStatusModal family={statusTarget.family} targetStatus={statusTarget.status} onClose={() => setStatusTarget(null)} />}
    </>
  );
}

export function FamiliesOnLeave() {
  const { families } = useApp();
  const list = families.filter((family) => family.status === 'on_leave');
  return (
    <>
      <PageHeader title="Families on Leave" subtitle="Leave windows, reasons, resume requests and parent contact actions" />
      <FamilyTable families={list} mode="leave" />
    </>
  );
}

export function DeadFamilies() {
  const { families } = useApp();
  const list = families.filter((family) => family.status === 'dead');
  return (
    <>
      <PageHeader title="Dead Families" subtitle="Closed families with reactivation request workflow" />
      <FamilyTable families={list} mode="dead" />
    </>
  );
}

export function ActiveStudents() {
  const { families, search } = useApp();
  const q = search.toLowerCase();
  const rows = allStudents(families.filter((family) => family.status === 'active')).filter(({ family, student }) =>
    !q || student.name.toLowerCase().includes(q) || family.surname.toLowerCase().includes(q) || student.teacher.toLowerCase().includes(q),
  );
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const paged = pageItems(rows, page);
  return (
    <>
      <PageHeader title="Active Students" subtitle="Students remain grouped under their family profile" />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Student</th><th>Family</th><th>Course</th><th>Teacher</th><th>Schedule</th><th>Attendance</th><th>Progress</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.items.map(({ family, student }) => {
              const present = student.attendance.filter((a) => a.status === 'present').length;
              const rate = student.attendance.length ? Math.round((present / student.attendance.length) * 100) : 0;
              return (
                <tr key={student.id}>
                  <td><div className="name-cell"><Avatar name={student.name} /><div><b>{student.name} {family.surname}</b><span>{student.grade} · age {student.age}</span></div></div></td>
                  <td>{family.surname} Family</td>
                  <td>{student.course}</td>
                  <td>{student.teacher}</td>
                  <td>{student.schedule.map((slot) => `${DAY_LABELS[slot.day]} ${fmtTime(slot.time)}`).join(', ')}</td>
                  <td><Badge tone={rate >= 80 ? 'success' : rate >= 60 ? 'warning' : 'danger'}>{rate}%</Badge></td>
                  <td>{student.progress || 68}%</td>
                  <td><Button size="sm" variant="ghost" onClick={() => navigate(`/admin/families/${family.id}?student=${student.id}`)}>Student profile</Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Pagination totalItems={rows.length} page={paged.page} onPageChange={setPage} />
    </>
  );
}

export function StudentProfiles() {
  return <ActiveStudents />;
}

export function TeacherSchedule() {
  const { tutors } = useApp();
  return (
    <>
      <PageHeader title="Teacher Schedule" subtitle="Teacher allocation, bookings and availability windows" />
      <div className="grid grid-3">
        {tutors.map((tutor) => (
          <Card key={tutor.id}>
            <CardHead title={tutor.name} sub={`${tutor.languages.join(', ')} · ${tutor.courses.length} courses`} right={<Badge tone="teal">{tutor.timezone}</Badge>} />
            <CardBody>
              <div className="summary-row"><label>Duty</label><b>{fmtTime(tutor.dutyStart)} to {fmtTime(tutor.dutyEnd)}</b></div>
              <div className="summary-row"><label>Days</label><b>{tutor.dutyDays.map((day) => DAY_LABELS[day]).join(', ')}</b></div>
              <div className="summary-row" style={{ borderBottom: 0 }}><label>Bookings</label><b>{tutor.bookings.length}</b></div>
            </CardBody>
          </Card>
        ))}
      </div>
    </>
  );
}

export function ClassSchedule() {
  const { families } = useApp();
  const rows = allStudents(families).flatMap(({ family, student }) =>
    student.schedule.map((slot, index) => ({ family, student, slot, id: `${student.id}-${index}` })),
  );
  return (
    <>
      <PageHeader title="Class Schedule" subtitle="Manual classes, reschedules, substitutes and class timing changes" />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Class</th><th>Family</th><th>Teacher</th><th>Day</th><th>Time</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map(({ family, student, slot, id }) => (
              <tr key={id}>
                <td><b>{student.name}</b><div style={{ color: 'var(--text-2)', fontSize: 12 }}>{student.course}</div></td>
                <td>{family.surname} Family</td>
                <td>{student.teacher}</td>
                <td>{DAY_LABELS[slot.day]}</td>
                <td>{fmtTime(slot.time)} · {slot.durationMin} min</td>
                <td><Badge tone="success">Scheduled</Badge></td>
                <td><Button size="sm" variant="ghost">Request change</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function Attendance() {
  const { families, actions } = useApp();
  const toast = useToast();
  const rows = allStudents(families);
  const [draft, setDraft] = useState({ familyId: rows[0]?.family.id || '', studentId: rows[0]?.student.id || '', status: 'present', reason: '' });
  const selectedFamily = families.find((family) => family.id === draft.familyId) || rows[0]?.family;
  const students = selectedFamily?.students || [];
  const submit = () => {
    if (!draft.reason.trim() || !draft.studentId || !selectedFamily) return;
    actions.updateAttendance(selectedFamily.id, draft.studentId, { date: todayISO(), status: draft.status, reason: draft.reason, staff: 'Hafiz Mariam' });
    setDraft({ ...draft, reason: '' });
    toast('Attendance adjustment recorded.');
  };
  return (
    <>
      <PageHeader title="Attendance" subtitle="Mark, correct and audit attendance adjustments" />
      <Card style={{ marginBottom: 14 }}>
        <CardHead title="Record adjustment" sub="Every correction stores staff, reason and timestamp" />
        <CardBody>
          <div className="form-grid">
            <Field label="Family">
              <select value={draft.familyId} onChange={(e) => setDraft({ ...draft, familyId: e.target.value, studentId: families.find((f) => f.id === e.target.value)?.students[0]?.id || '' })}>
                {families.map((family) => <option key={family.id} value={family.id}>{family.surname} Family</option>)}
              </select>
            </Field>
            <Field label="Student">
              <select value={draft.studentId} onChange={(e) => setDraft({ ...draft, studentId: e.target.value })}>
                {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })}>
                <option value="present">Present</option><option value="late">Late</option><option value="absent">Absent</option><option value="excused">Excused Leave</option><option value="compensated">Compensated</option>
              </select>
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input style={{ flex: 1 }} value={draft.reason} onChange={(e) => setDraft({ ...draft, reason: e.target.value })} placeholder="Mandatory reason" />
            <Button onClick={submit}>Record</Button>
          </div>
        </CardBody>
      </Card>
      <ClassSchedule />
    </>
  );
}

export function FamilyDiary() {
  const { families, actions } = useApp();
  const toast = useToast();
  const [familyId, setFamilyId] = useState(families[0]?.id || '');
  const [form, setForm] = useState({ category: 'General Note', note: '', followUpRequired: false });
  const family = families.find((f) => f.id === familyId) || families[0];
  const entries = [...(family?.familyDiary || [])].sort((a, b) => new Date(b.time) - new Date(a.time));
  const submit = () => {
    if (!form.note.trim() || !family) return;
    actions.addFamilyDiaryEntry(family.id, form.note.trim(), form.category, 'Hafiz Mariam', form.followUpRequired);
    setForm({ ...form, note: '', followUpRequired: false });
    toast('Family diary entry saved.');
  };
  return (
    <>
      <PageHeader title="Family Diary" subtitle="Permanent cross-department family notes and unified timeline" />
      <Card style={{ marginBottom: 14 }}>
        <CardBody>
          <div className="form-grid">
            <Field label="Family">
              <select value={family?.id || ''} onChange={(e) => setFamilyId(e.target.value)}>
                {families.map((f) => <option key={f.id} value={f.id}>{f.surname} Family</option>)}
              </select>
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {DIARY_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
              </select>
            </Field>
            <Field label="Follow-up">
              <select value={form.followUpRequired ? 'yes' : 'no'} onChange={(e) => setForm({ ...form, followUpRequired: e.target.value === 'yes' })}>
                <option value="no">No</option><option value="yes">Yes</option>
              </select>
            </Field>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <input style={{ flex: 1 }} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Permanent diary note" />
            <Button onClick={submit}>Add note</Button>
          </div>
        </CardBody>
      </Card>
      <Card>
        <CardHead title={`${family?.surname || 'Family'} timeline`} sub="Diary, approval and audit history" />
        <CardBody>
          {entries.map((entry) => (
            <div key={entry.id} className="timeline-item">
              <span className="timeline-dot" />
              <div>
                <b>{entry.category}</b>
                <div>{entry.note}</div>
                <div style={{ color: 'var(--text-3)', fontSize: 11.5 }}>{entry.staff} · {entry.department} · {fmtDateTime(entry.time)}</div>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>
    </>
  );
}

export function StudentNotes() {
  const { families } = useApp();
  const rows = allStudents(families).flatMap(({ family, student }) =>
    (student.notes || []).map((note) => ({ family, student, note })),
  );
  return (
    <>
      <PageHeader title="Student Notes" subtitle="Tutor, QC and support notes connected to students" />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Student</th><th>Family</th><th>Note</th><th>Staff</th><th>Date</th></tr></thead>
          <tbody>
            {rows.length ? rows.map(({ family, student, note }, index) => (
              <tr key={`${student.id}-${index}`}>
                <td>{student.name} {family.surname}</td><td>{family.surname} Family</td><td>{note.text}</td><td>{note.author}</td><td>{fmtDateTime(note.time)}</td>
              </tr>
            )) : <tr><td colSpan={5}><EmptyState icon="note" title="No student notes">Student notes will appear here.</EmptyState></td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function ParentCommunication() {
  const { families } = useApp();
  const rows = families.flatMap((family) => (family.communications || []).map((message) => ({ family, message })));
  return (
    <>
      <PageHeader title="Parent Communication" subtitle="Searchable WhatsApp, email, phone and internal note history" />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Family</th><th>Parent</th><th>Channel</th><th>Message</th><th>Staff/member</th><th>Date</th></tr></thead>
          <tbody>
            {rows.map(({ family, message }) => (
              <tr key={message.id}>
                <td>{family.surname} Family</td><td>{family.parent.name}</td><td><Badge tone="teal">{message.channel}</Badge></td><td>{message.text}</td><td>{message.who}</td><td>{fmtDateTime(message.time)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function BillingInvoices() {
  const { families, actions } = useApp();
  const toast = useToast();
  const rows = allStudents(families).flatMap(({ family, student }) => student.payments.map((payment) => ({ family, student, payment })));
  return (
    <>
      <PageHeader title="Billing & Invoices" subtitle="Invoice history, due payments and finance approval requests" />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Invoice</th><th>Family</th><th>Student</th><th>Amount</th><th>Status</th><th>Cycle</th><th>Due/paid date</th><th>Actions</th></tr></thead>
          <tbody>
            {rows.map(({ family, student, payment }) => (
              <tr key={`${student.id}-${payment.id}`}>
                <td className="mono">{payment.id}</td><td>{family.surname} Family</td><td>{student.name}</td><td>{family.currency || 'USD'} {payment.amount}</td>
                <td><Badge tone={payment.status === 'paid' ? 'success' : 'danger'}>{payment.status}</Badge></td><td>{family.billingCycle || 'Monthly'}</td><td>{fmtDate(payment.date)}</td>
                <td><Button size="sm" variant="ghost" onClick={() => { actions.submitApprovalRequest(family.id, { actionLabel: 'Edit Invoice Amount', requestedBy: 'Hafiz Mariam', reason: `Invoice ${payment.id}`, comments: 'Finance review requested' }); toast('Approval request submitted.'); }}>Request edit</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export function AdminReports() {
  const { families, tickets } = useApp();
  const students = allStudents(families);
  const activeFamilies = families.filter((family) => family.status === 'active').length;
  const leaveFamilies = families.filter((family) => family.status === 'on_leave').length;
  const deadFamilies = families.filter((family) => family.status === 'dead').length;
  const due = students.flatMap(({ student }) => student.payments).filter((payment) => payment.status === 'due').length;
  const courseData = Object.entries(students.reduce((acc, { student }) => ({ ...acc, [student.course]: (acc[student.course] || 0) + 1 }), {}))
    .map(([label, value], index) => ({ label, value, color: ['var(--teal-500)', 'var(--gold-400)', 'var(--info)', 'var(--success)', 'var(--warning)'][index % 5] }));
  const familyData = [
    { label: 'Active', value: activeFamilies, color: 'var(--success)' },
    { label: 'On Leave', value: leaveFamilies, color: 'var(--warning)' },
    { label: 'Dead', value: deadFamilies, color: 'var(--danger)' },
  ].filter((item) => item.value);
  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Family, student, support, scheduling, billing and teacher reports"
        actions={<><Button variant="ghost" icon={<Icon name="card" size={15} />}>CSV</Button><Button variant="ghost" icon={<Icon name="card" size={15} />}>Excel</Button><Button variant="gold" icon={<Icon name="card" size={15} />}>PDF</Button></>}
      />
      <div className="grid grid-4">
        <StatCard label="Active families" value={activeFamilies} delta={`${leaveFamilies} on leave`} />
        <StatCard label="Active students" value={students.length} delta="Across all families" tone="var(--teal-600)" />
        <StatCard label="Open tickets" value={tickets.filter((t) => t.status !== 'Closed').length} delta="Support workload" tone="var(--warning)" />
        <StatCard label="Due invoices" value={due} delta="Billing follow-ups" tone="var(--danger)" />
      </div>
      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <Card><CardHead title="Family status" sub="Active, leave and dead families" /><CardBody><DonutChart data={familyData} /></CardBody></Card>
        <Card><CardHead title="Students by course" sub="Course distribution" /><CardBody><BarChart data={courseData} /></CardBody></Card>
      </div>
    </>
  );
}

export function ApprovalCenter() {
  const { families, actions } = useApp();
  const toast = useToast();
  const requests = families.flatMap((family) => (family.approvalRequests || []).map((request) => ({ family, request })));
  return (
    <>
      <PageHeader title="Super Admin Approvals" subtitle="Requests requiring review before sensitive actions are finalized" />
      <div className="table-wrap">
        <table>
          <thead><tr><th>Request</th><th>Family</th><th>Requested by</th><th>Reason</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {requests.length ? requests.map(({ family, request }) => (
              <tr key={request.id}>
                <td>{request.actionLabel}</td><td>{family.surname} Family</td><td>{request.requestedBy}</td><td>{request.reason}</td><td><Badge tone={request.status === 'Pending' ? 'warning' : request.status === 'Approved' ? 'success' : 'danger'}>{request.status}</Badge></td><td>{fmtDateTime(request.requestedAt)}</td>
                <td>{request.status === 'Pending' && <div style={{ display: 'flex', gap: 6 }}><Button size="sm" onClick={() => { actions.reviewApprovalRequest(family.id, request.id, 'Approved', 'Super Admin', 'Approved'); toast('Request approved.'); }}>Approve</Button><Button size="sm" variant="danger-ghost" onClick={() => { actions.reviewApprovalRequest(family.id, request.id, 'Rejected', 'Super Admin', 'Rejected'); toast('Request rejected.', 'info'); }}>Reject</Button></div>}</td>
              </tr>
            )) : <tr><td colSpan={7}><EmptyState icon="check" title="No approval requests">Sensitive action requests will appear here.</EmptyState></td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}
