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

function studentNames(students) {
  return students.map((student) => student.name).join(', ');
}

/**
 * Reusable pipeline-stage table with search, pagination,
 * loading skeletons and an empty state.
 */
export default function LeadTable({ stage, actionsFor, emptyTitle, emptyBody }) {
  const { leads, search } = useApp();
  const q = useDebounce(search.toLowerCase());
  const [page, setPage] = useState(1);
  const stages = useMemo(() => (Array.isArray(stage) ? stage : [stage]), [stage]);
  const stageKey = stages.join('|');
  const loading = useSimulatedLoading([stageKey]);

  const list = useMemo(() => {
    let l = leads.filter((x) => stages.includes(x.stage));
    if (q) {
      l = l.filter(
        (x) =>
          x.parent.name.toLowerCase().includes(q) ||
          x.parent.email?.toLowerCase().includes(q) ||
          x.parent.phone?.toLowerCase().includes(q) ||
          x.parent.country?.toLowerCase().includes(q) ||
          x.parent.timezone?.toLowerCase().includes(q) ||
          x.source?.toLowerCase().includes(q) ||
          x.course?.toLowerCase().includes(q) ||
          x.students.some((s) => s.name.toLowerCase().includes(q)),
      );
    }
    return l;
  }, [leads, stages, q]);

  const totalPages = Math.max(1, Math.ceil(list.length / PER_PAGE));
  const safePage = Math.min(page, totalPages);
  const rows = list.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  return (
    <>
      <div className="table-wrap">
        <table className="lead-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Lead source</th>
              <th>Students</th>
              <th>Contact number</th>
              <th>Email</th>
              <th>Country</th>
              <th>Time zone</th>
              <th>Course interest</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={10} />)
            ) : rows.length ? (
              rows.map((l) => (
                <tr key={l.id}>
                  <td>{fmtDate(l.createdAt)}</td>
                  <td><Badge tone="muted" dot={false}>{l.source}</Badge></td>
                  <td>
                    <div className="name-cell">
                      <Avatar name={l.parent.name} />
                      <div>
                        <b>{studentNames(l.students)}</b>
                        <span>{l.parent.name}</span>
                      </div>
                    </div>
                  </td>
                  <td>{l.parent.phone || '—'}</td>
                  <td className="lead-email-cell">{l.parent.email || '—'}</td>
                  <td>{l.parent.country || '—'}</td>
                  <td className="lead-timezone-cell">{l.parent.timezone || '—'}</td>
                  <td>{l.course}</td>
                  <td>{timeAgo(l.createdAt)}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{actionsFor(l)}</div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={10}>
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
