import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import LeadTable from '../../components/LeadTable';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Field from '../../components/ui/Field';
import Icon from '../../components/ui/Icons';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { COURSES, FOLLOW_UP_PRIORITIES, SOURCES } from '../../data/seed';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import { Card, CardBody, CardHead } from '../../components/ui/Card';
import BarChart from '../../components/charts/BarChart';
import { fmtDate } from '../../utils/date';

/* ----------------------- New Leads ----------------------- */

export function NewLeads() {
  const { actions } = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', course: COURSES[0], source: SOURCES[0], student: '' });
  const [errors, setErrors] = useState({});

  const submit = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Parent name is required.';
    if (!form.phone.trim()) e.phone = 'A contact number is required.';
    if (!form.student.trim()) e.student = 'At least one student name is required.';
    setErrors(e);
    if (Object.keys(e).length) return;
    actions.addLead({
      id: 'LEAD-' + Math.floor(Math.random() * 90000 + 10000),
      stage: 'raw',
      parent: { name: form.name, email: form.email, phone: form.phone, country: '—', timezone: 'Asia/Karachi', preferredContact: 'WhatsApp' },
      students: [{ name: form.student, age: '', gender: '', grade: '', notes: '' }],
      course: form.course,
      source: form.source,
      agent: 'Sohail Sales22',
      tags: [],
      priority: 'Medium',
      nextFollowUp: new Date(),
      createdAt: new Date(),
      lastActivity: new Date(),
      notes: [],
    });
    toast(`Lead created for ${form.name}.`);
    setOpen(false);
    setForm({ name: '', phone: '', email: '', course: COURSES[0], source: SOURCES[0], student: '' });
  };

  const actionsFor = (lead) => {
    return (
      <>
        <Button size="sm" variant="ghost" icon={<Icon name="chat" size={14} />} onClick={() => navigate(`/enrollment/leads/${lead.id}`)}>
          Start Conversation
        </Button>
        <Button size="sm" onClick={() => { actions.moveLeadStage(lead.id, 'qualified', 'Sohail Sales22'); toast(`${lead.parent.name} marked as qualified.`); }}>
          Mark Qualified
        </Button>
      </>
    );
  };

  return (
    <>
      <PageHeader
        title="New Leads"
        subtitle="New enquiries ready to qualify"
        actions={<Button icon={<Icon name="plus" size={15} />} onClick={() => setOpen(true)}>Add lead</Button>}
      />
      <LeadTable
        stage="raw"
        emptyTitle="No new leads"
        emptyBody="New enquiries from the website, ads and WhatsApp will appear here."
        actionsFor={actionsFor}
      />
      <Modal open={open} title="Add new lead" onClose={() => setOpen(false)}>
        <div className="form-grid-2">
          <Field label="Parent name" required error={errors.name}>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Talat Soban" />
          </Field>
          <Field label="Contact number" required error={errors.phone}>
            <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+92 316 5406991" />
          </Field>
          <Field label="Email">
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="parent@mail.com" />
          </Field>
          <Field label="Student name" required error={errors.student}>
            <input value={form.student} onChange={(e) => setForm({ ...form, student: e.target.value })} placeholder="Child's name" />
          </Field>
          <Field label="Course interest">
            <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })}>
              {COURSES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Source">
            <select value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}>
              {SOURCES.map((s) => <option key={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 18 }}>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={submit}>Create lead</Button>
        </div>
      </Modal>
    </>
  );
}

function dateInputValue(value) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  return value.toISOString().slice(0, 10);
}

/* ----------------------- Qualified ----------------------- */

export function Qualified() {
  const navigate = useNavigate();
  const { actions } = useApp();
  const toast = useToast();
  return (
    <>
      <PageHeader title="Qualified Leads" subtitle="Confirmed as genuine and ready to book a trial class" />
      <LeadTable
        stage="qualified"
        emptyTitle="No qualified leads"
        emptyBody="Qualify leads from the New Leads page to see them here."
        actionsFor={(l) => (
          <>
            <Button size="sm" variant="gold" onClick={() => navigate(`/enrollment/schedule-trial?leadId=${l.id}`)}>
              Schedule Trial
            </Button>
            <Button size="sm" variant="ghost" onClick={() => navigate(`/enrollment/leads/${l.id}`)}>
              Open
            </Button>
            <Button size="sm" variant="danger-ghost" onClick={() => { actions.moveLeadStage(l.id, 'trial_dead', 'Sohail Sales22'); toast(`${l.parent.name} moved to Trial Dead.`, 'info'); }}>
              Trial Dead
            </Button>
          </>
        )}
      />
    </>
  );
}

/* ----------------------- Trial Dead ----------------------- */

export function TrialDead() {
  const { actions } = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  return (
    <>
      <PageHeader title="Trial Dead" subtitle="Leads whose trial did not convert — kept for future re-engagement" />
      <LeadTable
        stage="trial_dead"
        emptyTitle="No lost trials"
        emptyBody="Leads that don't convert after a trial move here automatically."
        actionsFor={(l) => (
          <>
            <Button size="sm" variant="ghost" onClick={() => navigate(`/enrollment/leads/${l.id}`)}>Open</Button>
            <Button size="sm" variant="ghost" onClick={() => { actions.moveLeadStage(l.id, 'qualified', 'Sohail Sales22'); toast(`${l.parent.name} re-opened as qualified.`); }}>
              Re-engage
            </Button>
          </>
        )}
      />
    </>
  );
}

/* ----------------------- Follow-ups ----------------------- */

export function FollowUps() {
  const { leads, actions } = useApp();
  const navigate = useNavigate();
  const toast = useToast();
  const today = new Date().toISOString().slice(0, 10);
  const list = useMemo(
    () => [...leads]
      .filter((lead) => lead.stage !== 'trial_dead')
      .sort((a, b) => new Date(a.nextFollowUp || a.lastActivity) - new Date(b.nextFollowUp || b.lastActivity)),
    [leads],
  );

  return (
    <>
      <PageHeader title="Follow-ups" subtitle="Next actions, reminders and overdue lead callbacks" />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Lead</th><th>Stage</th><th>Priority</th><th>Next follow-up</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.map((lead) => {
              const due = dateInputValue(lead.nextFollowUp);
              const overdue = due && due < today;
              return (
                <tr key={lead.id}>
                  <td>
                    <div className="name-cell">
                      <Icon name="bell" size={18} />
                      <div><b>{lead.parent.name}</b><span>{lead.students.map((s) => s.name).join(', ')}</span></div>
                    </div>
                  </td>
                  <td><Badge tone={lead.stage === 'qualified' ? 'gold' : 'teal'}>{lead.stage.replace('_', ' ')}</Badge></td>
                  <td>
                    <select
                      value={lead.priority || 'Medium'}
                      onChange={(e) => actions.updateLeadFollowUp(lead.id, lead.nextFollowUp || new Date(), e.target.value, 'Sohail Sales22')}
                      aria-label={`Priority for ${lead.parent.name}`}
                    >
                      {FOLLOW_UP_PRIORITIES.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </td>
                  <td>
                    <input
                      type="date"
                      value={due || today}
                      onChange={(e) => {
                        actions.updateLeadFollowUp(lead.id, e.target.value, lead.priority || 'Medium', 'Sohail Sales22');
                        toast('Follow-up reminder updated.');
                      }}
                      aria-label={`Follow-up date for ${lead.parent.name}`}
                    />
                    {overdue && <div style={{ marginTop: 4 }}><Badge tone="danger">Overdue</Badge></div>}
                  </td>
                  <td><Button size="sm" variant="ghost" onClick={() => navigate(`/enrollment/leads/${lead.id}`)}>Open</Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ----------------------- Reports ----------------------- */

export function Reports() {
  const { leads, trials } = useApp();
  const toast = useToast();
  const byStage = (stage) => leads.filter((lead) => lead.stage === stage).length;
  const converted = trials.filter((trial) => trial.status === 'converted').length;
  const dead = byStage('trial_dead') + trials.filter((trial) => trial.status === 'no_show' || trial.status === 'cancelled').length;
  const conversionRate = trials.length ? Math.round((converted / trials.length) * 100) : 0;
  const deadRate = trials.length ? Math.round((dead / (trials.length + dead)) * 100) : 0;
  const today = new Date().toISOString().slice(0, 10);
  const newToday = leads.filter((lead) => lead.createdAt?.toISOString?.().slice(0, 10) === today).length;

  const funnel = [
    { label: 'New', value: byStage('raw'), color: 'var(--teal-500)' },
    { label: 'Qualified', value: byStage('qualified'), color: 'var(--gold-400)' },
    { label: 'Trial', value: byStage('trial'), color: 'var(--info)' },
    { label: 'Dead', value: byStage('trial_dead'), color: 'var(--danger)' },
  ];
  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Enrollment performance, conversion funnel and export-ready summaries"
        actions={
          <>
            <Button variant="ghost" icon={<Icon name="card" size={15} />} onClick={() => toast('CSV export prepared for current date range.', 'info')}>CSV</Button>
            <Button variant="ghost" icon={<Icon name="card" size={15} />} onClick={() => toast('Excel export prepared for current date range.', 'info')}>Excel</Button>
            <Button variant="gold" icon={<Icon name="card" size={15} />} onClick={() => toast('PDF report prepared for current date range.', 'info')}>PDF</Button>
          </>
        }
      />
      <div className="grid grid-4">
        <StatCard label="New today" value={newToday} delta={fmtDate(new Date())} />
        <StatCard label="Qualified leads" value={byStage('qualified')} delta="Ready for scheduling" tone="var(--teal-600)" />
        <StatCard label="Trial conversion" value={`${conversionRate}%`} delta={`${converted} converted`} tone="var(--success)" />
        <StatCard label="Trial dead rate" value={`${deadRate}%`} delta={`${dead} lost or no-show`} tone="var(--danger)" />
      </div>
      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <Card>
          <CardHead title="Conversion funnel" sub="Lead aging and stage movement summary" />
          <CardBody><BarChart data={funnel} /></CardBody>
        </Card>
      </div>
    </>
  );
}
