import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useApp } from '../../context/AppContext';
import { fmtDateTime } from '../../utils/date';
import { useDebounce } from '../../hooks/useDebounce';

const CHANNELS = ['All', 'WhatsApp', 'Email', 'Zoom Chat'];

/** Communication History — every message across every active family. */
export default function Communications() {
  const { families, search } = useApp();
  const navigate = useNavigate();
  const q = useDebounce(search.toLowerCase());
  const [channel, setChannel] = useState('All');

  const rows = useMemo(() => {
    let all = families.flatMap((f) =>
      f.communications.map((m) => ({ ...m, familyId: f.id, familyName: `${f.surname} Family`, parent: f.parent.name })),
    );
    if (channel !== 'All') all = all.filter((m) => m.channel === channel);
    if (q) all = all.filter((m) => m.familyName.toLowerCase().includes(q) || m.text.toLowerCase().includes(q) || m.parent.toLowerCase().includes(q));
    return all.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 60);
  }, [families, channel, q]);

  return (
    <>
      <PageHeader title="Communication History" subtitle="Every inbound and outbound message with active families" />
      <div className="chip-row" style={{ marginBottom: 14 }}>
        {CHANNELS.map((c) => (
          <button key={c} className={`filter-chip ${channel === c ? 'active' : ''}`} onClick={() => setChannel(c)}>{c}</button>
        ))}
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>Family</th><th>Direction</th><th>Channel</th><th>Message</th><th>By</th><th>When</th><th></th></tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((m) => (
              <tr key={m.id + m.familyId}>
                <td>
                  <div className="name-cell">
                    <Avatar name={m.familyName} size={30} />
                    <div><b>{m.familyName}</b><span className="mono" style={{ fontSize: 11 }}>{m.familyId}</span></div>
                  </div>
                </td>
                <td><Badge tone={m.dir === 'in' ? 'info' : 'teal'} dot={false}>{m.dir === 'in' ? 'Inbound' : 'Outbound'}</Badge></td>
                <td>{m.channel}</td>
                <td style={{ maxWidth: 340 }}>{m.text}</td>
                <td>{m.who}</td>
                <td style={{ whiteSpace: 'nowrap' }}>{fmtDateTime(m.time)}</td>
                <td><Button size="sm" variant="ghost" onClick={() => navigate(`/admin/support?familyId=${m.familyId}`)}>Open</Button></td>
              </tr>
            )) : (
              <tr><td colSpan={7}><EmptyState icon="mail" title="No messages">No communication matches these filters.</EmptyState></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
