import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Field from '../../components/ui/Field';
import Icon from '../../components/ui/Icons';
import EmptyState from '../../components/ui/EmptyState';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { fmtDate } from '../../utils/date';
import { useDebounce } from '../../hooks/useDebounce';

const STATUS_TONE = { Open: 'danger', 'In Progress': 'warning', Resolved: 'success', Closed: 'muted' };
const PRIORITY_TONE = { High: 'danger', Medium: 'warning', Low: 'muted' };

export default function Tickets() {
  const { tickets, families, search, actions } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const q = useDebounce(search.toLowerCase());
  const [filter, setFilter] = useState('All');
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ familyId: '', subject: '', priority: 'Medium' });
  const [errors, setErrors] = useState({});

  const list = useMemo(() => {
    let l = [...tickets].sort((a, b) => new Date(b.created) - new Date(a.created));
    if (filter !== 'All') l = l.filter((t) => t.status === filter);
    if (q) l = l.filter((t) => t.subject.toLowerCase().includes(q) || t.familyName.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
    return l;
  }, [tickets, filter, q]);

  const submit = () => {
    const e = {};
    if (!form.familyId) e.familyId = 'Choose a family.';
    if (!form.subject.trim()) e.subject = 'Describe the issue.';
    setErrors(e);
    if (Object.keys(e).length) return;
    const fam = families.find((f) => f.id === form.familyId);
    actions.addTicket({
      id: 'TCK-' + Math.floor(Math.random() * 9000 + 1000),
      familyId: fam.id,
      familyName: `${fam.surname} Family`,
      parentName: fam.parent.name,
      subject: form.subject.trim(),
      status: 'Open',
      priority: form.priority,
      agent: 'Hafiz Mariam',
      channel: fam.parent.preferredContact,
      created: new Date(),
    });
    toast('Ticket created.');
    setOpen(false);
    setForm({ familyId: '', subject: '', priority: 'Medium' });
  };

  return (
    <>
      <PageHeader
        title="Support Tickets"
        subtitle="Issues raised by active families, tracked to resolution"
        actions={<Button icon={<Icon name="plus" size={15} />} onClick={() => setOpen(true)}>New ticket</Button>}
      />
      <div className="grid grid-3">
        <StatCard label="Open" value={tickets.filter((t) => t.status === 'Open').length} tone="var(--danger)" delta="Needs a first response" />
        <StatCard label="In progress" value={tickets.filter((t) => t.status === 'In Progress').length} tone="var(--warning)" delta="Being worked on" />
        <StatCard label="Resolved this week" value={tickets.filter((t) => t.status === 'Resolved').length} delta="Awaiting close-out" />
      </div>

      <div className="chip-row" style={{ margin: '16px 0 14px' }}>
        {['All', 'Open', 'In Progress', 'Resolved', 'Closed'].map((s) => (
          <button key={s} className={`filter-chip ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>{s}</button>
        ))}
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Ticket</th><th>Family</th><th>Subject</th><th>Priority</th><th>Status</th><th>Agent</th><th>Created</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {list.length ? list.map((t) => (
              <tr key={t.id}>
                <td className="mono" style={{ fontSize: 12 }}>{t.id}</td>
                <td>
                  <div className="name-cell">
                    <Avatar name={t.familyName} size={30} />
                    <div>
                      <b>{t.familyName}</b>
                      <span>{t.parentName}</span>
                    </div>
                  </div>
                </td>
                <td style={{ maxWidth: 260 }}>{t.subject}</td>
                <td><Badge tone={PRIORITY_TONE[t.priority]} dot={false}>{t.priority}</Badge></td>
                <td><Badge tone={STATUS_TONE[t.status]}>{t.status}</Badge></td>
                <td>{t.agent}</td>
                <td>{fmtDate(t.created)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {t.status === 'Open' && (
                      <Button size="sm" onClick={() => { actions.setTicketStatus(t.id, 'In Progress'); toast(`${t.id} picked up.`); }}>Pick up</Button>
                    )}
                    {t.status === 'In Progress' && (
                      <Button size="sm" onClick={() => { actions.setTicketStatus(t.id, 'Resolved'); toast(`${t.id} resolved.`); }}>Resolve</Button>
                    )}
                    {t.status === 'Resolved' && (
                      <Button size="sm" variant="ghost" onClick={() => { actions.setTicketStatus(t.id, 'Closed'); toast(`${t.id} closed.`, 'info'); }}>Close</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/support?familyId=${t.familyId}`)}>Chat</Button>
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={8}><EmptyState icon="ticket" title="No tickets here">Nothing matches this filter — the queue is clear.</EmptyState></td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={open} title="New support ticket" onClose={() => setOpen(false)}>
        <div style={{ display: 'grid', gap: 14 }}>
          <Field label="Family" required error={errors.familyId}>
            <select value={form.familyId} onChange={(e) => setForm({ ...form, familyId: e.target.value })}>
              <option value="">Select family</option>
              {families.map((f) => <option key={f.id} value={f.id}>{f.surname} Family — {f.id}</option>)}
            </select>
          </Field>
          <Field label="Subject" required error={errors.subject}>
            <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Zoom link not working" />
          </Field>
          <Field label="Priority">
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
              <option>Low</option><option>Medium</option><option>High</option>
            </select>
          </Field>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Create ticket</Button>
        </div>
      </Modal>
    </>
  );
}
