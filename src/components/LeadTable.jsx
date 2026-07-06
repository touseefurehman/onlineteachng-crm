import { useMemo, useState } from 'react';
import Avatar from './ui/Avatar';
import Badge from './ui/Badge';
import Button from './ui/Button';
import EmptyState from './ui/EmptyState';
import { SkeletonRow } from './ui/Skeleton';
import { fmtDate, timeAgo } from '../utils/date';
import { useApp } from '../context/AppContext';
import { useDebounce } from '../hooks/useDebounce';
import { useSimulatedLoading } from '../hooks/useSimulatedLoading';

const PER_PAGE = 8;

/**
 * Reusable pipeline-stage table with search, pagination,
 * loading skeletons and an empty state.
 */
export default function LeadTable({ stage, actionsFor, emptyTitle, emptyBody }) {
  const { leads, search } = useApp();
  const q = useDebounce(search.toLowerCase());
  const [page, setPage] = useState(1);
  const loading = useSimulatedLoading([stage]);

  const list = useMemo(() => {
    let l = leads.filter((x) => x.stage === stage);
    if (q) {
      l = l.filter(
        (x) =>
          x.parent.name.toLowerCase().includes(q) ||
          x.parent.email.includes(q) ||
          x.students.some((s) => s.name.toLowerCase().includes(q)),
      );
    }
    return l;
  }, [leads, stage, q]);

  const totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const rows = list.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Parent / Lead</th>
              <th>Students</th>
              <th>Course interest</th>
              <th>Source</th>
              <th>Counselor</th>
              <th>Created</th>
              <th>Last activity</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={8} />)
            ) : rows.length ? (
              rows.map((l) => (
                <tr key={l.id}>
                  <td>
                    <div className="name-cell">
                      <Avatar name={l.parent.name} />
                      <div>
                        <b>{l.parent.name}</b>
                        <span>{l.parent.country} · {l.parent.preferredContact}</span>
                      </div>
                    </div>
                  </td>
                  <td>{l.students.map((s) => s.name).join(', ')}</td>
                  <td>{l.course}</td>
                  <td><Badge tone="muted" dot={false}>{l.source}</Badge></td>
                  <td>{l.agent}</td>
                  <td>{fmtDate(l.createdAt)}</td>
                  <td>{timeAgo(l.lastActivity)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{actionsFor(l)}</div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>
                  <EmptyState icon="users" title={emptyTitle}>{emptyBody}</EmptyState>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 12 }}>
          <Button variant="ghost" size="sm" disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>Prev</Button>
          <span style={{ alignSelf: 'center', fontSize: 12.5, color: 'var(--text-2)' }}>
            Page {safePage} of {totalPages}
          </span>
          <Button variant="ghost" size="sm" disabled={safePage === totalPages} onClick={() => setPage(safePage + 1)}>Next</Button>
        </div>
      )}
    </>
  );
}
