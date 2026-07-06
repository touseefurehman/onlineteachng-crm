import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { Card, CardBody, CardHead } from '../../components/ui/Card';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { fmtDateTime, timeAgo } from '../../utils/date';
import { useDebounce } from '../../hooks/useDebounce';

/** Customer Support — conversations with active families only. */
export default function Support() {
  const { families, search, actions } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const toast = useToast();
  const q = useDebounce(search.toLowerCase());

  const [activeId, setActiveId] = useState(params.get('familyId') || families[0]?.id);
  const [draft, setDraft] = useState('');

  const list = useMemo(() => {
    let l = [...families].sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity));
    if (q) l = l.filter((f) => f.surname.toLowerCase().includes(q) || f.parent.name.toLowerCase().includes(q) || f.id.toLowerCase().includes(q));
    return l;
  }, [families, q]);

  const family = families.find((f) => f.id === activeId) || list[0];

  const send = () => {
    if (!draft.trim() || !family) return;
    actions.addFamilyMessage(family.id, {
      id: 'MSG-' + Date.now(),
      dir: 'out',
      channel: family.parent.preferredContact === 'Email' ? 'Email' : 'WhatsApp',
      text: draft.trim(),
      who: 'Hafiz Mariam',
      time: new Date(),
    });
    setDraft('');
    toast(`Reply sent to ${family.parent.name}.`);
  };

  return (
    <>
      <PageHeader title="Customer Support" subtitle="Conversations with active families across all channels" />
      <div className="grid" style={{ gridTemplateColumns: '290px 1fr', gap: 16, alignItems: 'start' }}>
        <Card>
          <CardBody style={{ padding: 10, maxHeight: '68vh', overflowY: 'auto' }}>
            {list.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveId(f.id)}
                style={{
                  display: 'flex', gap: 10, alignItems: 'center', width: '100%', textAlign: 'left',
                  border: 0, borderRadius: 10, padding: '10px 10px', marginBottom: 2,
                  background: family?.id === f.id ? 'var(--teal-100)' : 'transparent',
                  transition: 'background .15s ease', cursor: 'pointer',
                }}
              >
                <Avatar name={f.surname + ' Family'} size={34} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <b style={{ fontSize: 13 }}>{f.surname} Family</b>
                  <div style={{ fontSize: 11.5, color: 'var(--text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f.communications.at(-1)?.text || 'No messages yet'}
                  </div>
                </div>
                <span style={{ fontSize: 10.5, color: 'var(--text-3)' }}>{timeAgo(f.lastActivity)}</span>
              </button>
            ))}
            {!list.length && <EmptyState icon="chat" title="No conversations">No family matches this search.</EmptyState>}
          </CardBody>
        </Card>

        {family ? (
          <Card>
            <CardHead
              title={`${family.surname} Family`}
              sub={<span><span className="mono">{family.id}</span> · {family.parent.name} · prefers {family.parent.preferredContact}</span>}
              right={<Button size="sm" variant="ghost" onClick={() => navigate(`/admin/families/${family.id}`)}>Family profile</Button>}
            />
            <CardBody>
              <div style={{ maxHeight: '46vh', overflowY: 'auto', display: 'grid', gap: 10, paddingRight: 4 }}>
                {family.communications.length ? family.communications.map((m) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: m.dir === 'out' ? 'flex-end' : 'flex-start' }}>
                    <div
                      style={{
                        maxWidth: '72%',
                        background: m.dir === 'out' ? 'var(--teal-600)' : 'var(--border-soft)',
                        color: m.dir === 'out' ? '#fff' : 'var(--text-1)',
                        borderRadius: 14, padding: '9px 13px', fontSize: 13.5,
                      }}
                    >
                      {m.text}
                      <div style={{ fontSize: 10.5, opacity: 0.75, marginTop: 4 }}>
                        {m.who} · {m.channel} · {fmtDateTime(m.time)}
                      </div>
                    </div>
                  </div>
                )) : <EmptyState icon="chat" title="No messages yet">Start the conversation below.</EmptyState>}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <input
                  style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 9, padding: '10px 12px', fontSize: 13.5 }}
                  placeholder={`Reply to ${family.parent.name}…`}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && send()}
                />
                <Button onClick={send}>Send</Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          <Card><EmptyState icon="chat" title="Select a conversation">Pick a family from the list.</EmptyState></Card>
        )}
      </div>
    </>
  );
}
