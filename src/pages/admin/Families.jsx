import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Field from '../../components/ui/Field';
import Modal from '../../components/ui/Modal';
import Pagination, { PAGE_SIZE, pageItems } from '../../components/ui/Pagination';
import { useApp } from '../../context/AppContext';
import { useDebounce } from '../../hooks/useDebounce';
import { useToast } from '../../hooks/useToast';
import { fmtDate, todayISO } from '../../utils/date';

const STATUS = ['all', 'active', 'on_leave', 'dead'];
const STATUS_LABEL = { all: 'All families', active: 'Active', on_leave: 'On leave', dead: 'Dead' };
const STATUS_TONE = { active: 'success', on_leave: 'warning', dead: 'danger' };

function StatusModal({ target, onClose }) {
  const { actions } = useApp();
  const toast = useToast();
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [returnDate, setReturnDate] = useState(todayISO());
  if (!target) return null;
  const { family, status } = target;
  const submit = () => {
    if (!reason.trim()) return toast('Please add a reason for this status change.', 'error');
    actions.changeFamilyStatus(family.id, {
      status, reason: reason.trim(), notes, requestedBy: 'Hafiz Mariam',
      leaveStartDate: status === 'on_leave' ? todayISO() : undefined,
      expectedReturnDate: status === 'on_leave' ? returnDate : undefined,
    });
    if (status === 'dead' || status === 'active') {
      actions.submitApprovalRequest(family.id, {
        actionLabel: status === 'dead' ? 'Mark Family as Dead' : 'Reactivate Family',
        requestedBy: 'Hafiz Mariam', reason: reason.trim(), comments: notes,
      });
    }
    toast(`${family.surname} Family updated to ${STATUS_LABEL[status]}.`);
    onClose();
  };
  return (
    <Modal open title={`${STATUS_LABEL[status]} family`} onClose={onClose}>
      <div className="form-info-box soft">This change is recorded in the family history and can be reviewed by the admin team.</div>
      <Field label="Reason" required><input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why is the family status changing?" /></Field>
      {status === 'on_leave' && <Field label="Expected return date" required style={{ marginTop: 14 }}><input type="date" value={returnDate} onChange={(e) => setReturnDate(e.target.value)} /></Field>}
      <Field label="Notes" style={{ marginTop: 14 }}><textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional details for the team" /></Field>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit}>Save status</Button></div>
    </Modal>
  );
}

export default function Families() {
  const { families, search } = useApp();
  const q = useDebounce(search.toLowerCase());
  const navigate = useNavigate();
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [statusTarget, setStatusTarget] = useState(null);

  const list = useMemo(() => families.filter((family) => {
    const matchesStatus = status === 'all' || family.status === status;
    const haystack = `${family.surname} ${family.id} ${family.parent.name} ${family.parent.phone} ${family.parent.country} ${family.students.map((student) => student.name).join(' ')}`.toLowerCase();
    return matchesStatus && (!q || haystack.includes(q));
  }), [families, q, status]);
  const paged = pageItems(list, page);
  useEffect(() => setPage(1), [q, status]);

  return (
    <>
      <PageHeader title="Family Management" subtitle="Manage active, on-leave and closed families from one place" />
      <div className="family-management-toolbar">
        <div className="chip-row">
          {STATUS.map((item) => <button key={item} className={`filter-chip ${status === item ? 'active' : ''}`} onClick={() => setStatus(item)}>{STATUS_LABEL[item]} <span className="filter-count">{item === 'all' ? families.length : families.filter((family) => family.status === item).length}</span></button>)}
        </div>
        <div className="family-filter-note">Use the global search to find a parent, family code, country, phone number, or student.</div>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Family</th><th>Parent</th><th>Country / time zone</th><th>Students</th><th>Billing</th><th>Status</th><th>Status detail</th><th>Actions</th></tr></thead>
          <tbody>
            {paged.items.length ? paged.items.map((family) => (
              <tr key={family.id}>
                <td><div className="name-cell"><Avatar name={`${family.surname} Family`} /><div><b>{family.surname} Family</b><span className="mono">{family.id} · since {fmtDate(family.createdAt)}</span></div></div></td>
                <td><b>{family.parent.name}</b><div className="table-subtext">{family.parent.phone}</div></td>
                <td>{family.parent.country}<div className="table-subtext">{family.parent.timezone}</div></td>
                <td>{family.students.length} student{family.students.length === 1 ? '' : 's'}</td>
                <td><Badge tone={family.billingStatus === 'Overdue' ? 'danger' : family.billingStatus === 'Due' ? 'warning' : 'success'}>{family.billingStatus || 'Paid'}</Badge></td>
                <td><Badge tone={STATUS_TONE[family.status]}>{STATUS_LABEL[family.status]}</Badge></td>
                <td>{family.status === 'on_leave' ? `${fmtDate(family.leaveStartDate)} → ${fmtDate(family.expectedReturnDate)}` : family.status === 'dead' ? (family.statusReason || 'Closed') : 'Enrolled'}</td>
                <td><div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}><Button size="sm" variant="ghost" onClick={() => navigate(`/admin/families/${family.id}`)}>Profile</Button>{family.status === 'active' && <Button size="sm" variant="ghost" onClick={() => setStatusTarget({ family, status: 'on_leave' })}>On leave</Button>}{family.status === 'active' && <Button size="sm" variant="danger-ghost" onClick={() => setStatusTarget({ family, status: 'dead' })}>Close</Button>}{family.status !== 'active' && <Button size="sm" onClick={() => setStatusTarget({ family, status: 'active' })}>Reactivate</Button>}</div></td>
              </tr>
            )) : <tr><td colSpan={8}><EmptyState icon="family" title="No families found">Try a different status or search term.</EmptyState></td></tr>}
          </tbody>
        </table>
      </div>
      <Pagination totalItems={list.length} page={paged.page} onPageChange={setPage} pageSize={PAGE_SIZE} />
      <StatusModal target={statusTarget} onClose={() => setStatusTarget(null)} />
    </>
  );
}
