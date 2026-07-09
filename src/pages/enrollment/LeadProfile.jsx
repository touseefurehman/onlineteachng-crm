import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import Field from '../../components/ui/Field';
import Icon from '../../components/ui/Icons';
import { Card, CardBody, CardHead } from '../../components/ui/Card';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { AGENTS } from '../../data/seed';
import { fmtExactDateTime } from '../../utils/date';

const CHANNELS = ['WhatsApp', 'Email', 'Phone', 'Zoom Chat'];

export default function LeadProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { leads, actions } = useApp();
  const lead = leads.find((l) => l.id === id);
  const [channel, setChannel] = useState(lead?.parent.preferredContact || 'WhatsApp');
  const [staff, setStaff] = useState(lead?.agent || AGENTS[0]);
  const [draft, setDraft] = useState('');

  const history = useMemo(() => {
    if (!lead) return [];
    const communications = (lead.communications || []).map((m) => ({
      id: m.id,
      time: m.time,
      staff: m.who,
      action: m.dir === 'out' ? `${m.channel} Conversation Started` : 'Parent Replied',
      detail: m.text,
      type: 'message',
    }));
    return [...(lead.timeline || []), ...communications]
      .sort((a, b) => new Date(a.time) - new Date(b.time));
  }, [lead]);

  if (!lead) {
    return (
      <Card>
        <EmptyState icon="users" title="Lead not found">
          <Button size="sm" variant="ghost" onClick={() => navigate('/enrollment/new-leads')}>Back to leads</Button>
        </EmptyState>
      </Card>
    );
  }

  const send = (dir = 'out') => {
    const text = draft.trim();
    if (!text) return;
    actions.addLeadMessage(lead.id, {
      dir,
      channel,
      text,
      who: dir === 'out' ? staff : lead.parent.name,
    });
    setDraft('');
    toast(dir === 'out' ? `${channel} conversation recorded.` : 'Parent reply recorded.');
  };

  return (
    <>
      <PageHeader
        title={lead.parent.name}
        subtitle={<span><span className="mono">{lead.id}</span> · {lead.course} · {lead.parent.timezone}</span>}
        actions={<Button variant="ghost" onClick={() => navigate('/enrollment/new-leads')}>Back to leads</Button>}
      />

      <div className="grid" style={{ gridTemplateColumns: '320px 1fr', gap: 16, alignItems: 'start' }}>
        <Card>
          <CardHead title="Lead profile" sub="Enrollment contact details" />
          <CardBody>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <Avatar name={lead.parent.name} size={44} />
              <div>
                <b>{lead.parent.name}</b>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{lead.source}</div>
              </div>
            </div>
            <div className="summary-row"><label>Phone</label><b>{lead.parent.phone || '—'}</b></div>
            <div className="summary-row"><label>Email</label><b style={{ wordBreak: 'break-all' }}>{lead.parent.email || '—'}</b></div>
            <div className="summary-row"><label>Preferred</label><b>{lead.parent.preferredContact}</b></div>
            <div className="summary-row"><label>Staff</label><b>{lead.agent}</b></div>
            <div className="summary-row" style={{ borderBottom: 0 }}><label>Status</label><Badge tone="teal">{lead.stage}</Badge></div>
            <Button
              style={{ width: '100%', marginTop: 12 }}
              icon={<Icon name="chat" size={15} />}
              onClick={() => {
                setDraft(`Assalamualaikum ${lead.parent.name}, thank you for your interest in ${lead.course}.`);
              }}
            >
              Start Conversation
            </Button>
          </CardBody>
        </Card>

        <div style={{ display: 'grid', gap: 14 }}>
          <Card>
            <CardHead title="Lead conversation" sub="All integrated channels in one chronological thread" />
            <CardBody>
              <div className="form-grid-3">
                <Field label="Channel">
                  <select value={channel} onChange={(e) => setChannel(e.target.value)}>
                    {CHANNELS.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </Field>
                <Field label="Staff member">
                  <select value={staff} onChange={(e) => setStaff(e.target.value)}>
                    {AGENTS.map((a) => <option key={a}>{a}</option>)}
                  </select>
                </Field>
                <Field label="Timezone">
                  <input value={lead.parent.timezone} readOnly />
                </Field>
              </div>

              <div style={{ display: 'grid', gap: 10, margin: '12px 0', maxHeight: 260, overflowY: 'auto' }}>
                {(lead.communications || []).length ? lead.communications.map((m) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: m.dir === 'out' ? 'flex-end' : 'flex-start' }}>
                    <div className={`inbox-bubble ${m.dir}`}>
                      <div className="inbox-bubble-body">{m.text}</div>
                      <div className="inbox-bubble-meta">{m.who} · {m.channel} · {fmtExactDateTime(m.time, lead.parent.timezone)}</div>
                    </div>
                  </div>
                )) : <EmptyState icon="chat" title="No conversation yet">Use Start Conversation or write the first message below.</EmptyState>}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 9, padding: '10px 12px', fontSize: 13.5 }}
                  placeholder={`Message ${lead.parent.name} via ${channel}`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send('out')}
                />
                <Button onClick={() => send('out')}>Send</Button>
                <Button variant="ghost" onClick={() => send('in')}>Record parent reply</Button>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHead title="Exact timeline" sub="Date, exact time, timezone, staff member and action" />
            <CardBody>
              {history.length ? history.map((item) => (
                <div key={`${item.id}-${item.action}`} className="timeline-item">
                  <span className="timeline-dot" />
                  <div>
                    <div style={{ fontSize: 13.5 }}>
                      <b>{fmtExactDateTime(item.time, lead.parent.timezone)}</b> — {item.staff} — {item.action}
                    </div>
                    {item.detail && <div style={{ fontSize: 12, color: 'var(--text-2)', marginTop: 2 }}>{item.detail}</div>}
                  </div>
                </div>
              )) : <EmptyState icon="clock" title="No timeline yet">Activity will record automatically.</EmptyState>}
            </CardBody>
          </Card>
        </div>
      </div>
    </>
  );
}
