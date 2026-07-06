import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import LeadTable from '../../components/LeadTable';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Field from '../../components/ui/Field';
import Icon from '../../components/ui/Icons';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { COURSES, SOURCES } from '../../data/seed';

/* ----------------------- New Leads ----------------------- */

export function NewLeads() {
  const { actions } = useApp();
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
      createdAt: new Date(),
      lastActivity: new Date(),
      notes: [],
    });
    toast(`Lead created for ${form.name}.`);
    setOpen(false);
    setForm({ name: '', phone: '', email: '', course: COURSES[0], source: SOURCES[0], student: '' });
  };

  const actionsFor = (lead) => {
    if (lead.stage === 'raw') {
      return (
        <Button size="sm" onClick={() => { actions.moveLeadStage(lead.id, 'intake'); toast(`${lead.parent.name} moved to Intake.`); }}>
          Move to Intake
        </Button>
      );
    }

    return (
      <>
        <Button size="sm" onClick={() => { actions.moveLeadStage(lead.id, 'qualified'); toast(`${lead.parent.name} marked as qualified.`); }}>
          Mark Qualified
        </Button>
        <Button size="sm" variant="danger-ghost" onClick={() => { actions.moveLeadStage(lead.id, 'trial_dead'); toast(`${lead.parent.name} closed as lost.`, 'info'); }}>
          Close Lost
        </Button>
      </>
    );
  };

  return (
    <>
      <PageHeader
        title="New Leads"
        subtitle="New leads and intake conversations in one place"
        actions={<Button icon={<Icon name="plus" size={15} />} onClick={() => setOpen(true)}>Add lead</Button>}
      />
      <LeadTable
        stage={['raw', 'intake']}
        emptyTitle="No new leads"
        emptyBody="New enquiries and intake conversations will appear here."
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

/* ----------------------- Qualified ----------------------- */

export function Qualified() {
  const navigate = useNavigate();
  return (
    <>
      <PageHeader title="Qualified Leads" subtitle="Confirmed as genuine and ready to book a trial class" />
      <LeadTable
        stage="qualified"
        emptyTitle="No qualified leads"
        emptyBody="Qualify leads from the New Leads page to see them here."
        actionsFor={(l) => (
          <Button size="sm" variant="gold" onClick={() => navigate(`/enrollment/schedule-trial?leadId=${l.id}`)}>
            Schedule Trial
          </Button>
        )}
      />
    </>
  );
}

/* ----------------------- Trial Dead ----------------------- */

export function TrialDead() {
  const { actions } = useApp();
  const toast = useToast();
  return (
    <>
      <PageHeader title="Trial Dead" subtitle="Leads whose trial did not convert — kept for future re-engagement" />
      <LeadTable
        stage="trial_dead"
        emptyTitle="No lost trials"
        emptyBody="Leads that don't convert after a trial move here automatically."
        actionsFor={(l) => (
          <Button size="sm" variant="ghost" onClick={() => { actions.moveLeadStage(l.id, 'qualified'); toast(`${l.parent.name} re-opened as qualified.`); }}>
            Re-engage
          </Button>
        )}
      />
    </>
  );
}
