import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icons';
import EmptyState from '../../components/ui/EmptyState';
import { Card } from '../../components/ui/Card';
import { useApp } from '../../context/AppContext';
import { useDebounce } from '../../hooks/useDebounce';
import { fmtDate } from '../../utils/date';

/**
 * Active Families — students never appear as loose rows.
 * Every student lives under a family code; expanding a family reveals them.
 */
export default function Families() {
  const { families, search } = useApp();
  const q = useDebounce(search.toLowerCase());
  const [expanded, setExpanded] = useState({});
  const navigate = useNavigate();

  const list = useMemo(() => {
    let l = families.filter((family) => family.status === 'active');
    if (q) {
      l = l.filter(
        (f) =>
          f.surname.toLowerCase().includes(q) ||
          f.id.toLowerCase().includes(q) ||
          f.parent.name.toLowerCase().includes(q) ||
          f.students.some((s) => s.name.toLowerCase().includes(q)),
      );
    }
    return l;
  }, [families, q]);

  return (
    <>
      <PageHeader
        title="Active Families"
        subtitle="Every active student is grouped under a family code with a shared parent profile"
      />
      <div style={{ display: 'grid', gap: 12 }}>
        {list.length ? (
          list.map((f) => {
            const open = !!expanded[f.id];
            return (
              <Card key={f.id}>
                <button
                  className="family-row-toggle"
                  onClick={() => setExpanded({ ...expanded, [f.id]: !open })}
                  aria-expanded={open}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '15px 18px', flexWrap: 'wrap' }}>
                    <Avatar name={f.surname + ' Family'} size={40} />
                    <div style={{ minWidth: 180 }}>
                      <b style={{ fontSize: 14.5 }}>{f.surname} Family</b>
                      <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                        <span className="mono">{f.id}</span> · since {fmtDate(f.createdAt)}
                      </div>
                    </div>
                    <div style={{ minWidth: 200 }}>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase' }}>Parent</div>
                      <div style={{ fontSize: 13 }}>{f.parent.name} · {f.parent.phone}</div>
                    </div>
                    <Badge tone="teal" dot={false}>{f.students.length} student{f.students.length > 1 ? 's' : ''}</Badge>
                    <Badge tone="success">Active</Badge>
                    <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/families/${f.id}`); }}
                      >
                        Family profile
                      </Button>
                      <Icon
                        name="chevronDown"
                        size={18}
                        style={{ transition: 'transform .2s ease', transform: open ? 'rotate(180deg)' : 'none', color: 'var(--text-3)' }}
                      />
                    </span>
                  </div>
                </button>

                {open && (
                  <div className="expand-area" style={{ borderTop: '1px solid var(--border-soft)', padding: '6px 18px 16px' }}>
                    <table style={{ minWidth: 560 }}>
                      <thead>
                        <tr><th>Student</th><th>Course</th><th>Teacher</th><th>Attendance</th><th>Next invoice</th><th></th></tr>
                      </thead>
                      <tbody>
                        {f.students.map((s) => {
                          const present = s.attendance.filter((a) => a.status === 'present').length;
                          const rate = s.attendance.length ? Math.round((present / s.attendance.length) * 100) : null;
                          const due = s.payments.find((p) => p.status === 'due');
                          return (
                            <tr key={s.id}>
                              <td>
                                <div className="name-cell">
                                  <Avatar name={s.name} size={30} />
                                  <div><b>{s.name} {f.surname}</b><span>{s.grade} · age {s.age}</span></div>
                                </div>
                              </td>
                              <td>{s.course}</td>
                              <td>{s.teacher}</td>
                              <td>{rate == null ? <Badge dot={false}>New</Badge> : <Badge tone={rate >= 80 ? 'success' : rate >= 60 ? 'warning' : 'danger'} dot={false}>{rate}%</Badge>}</td>
                              <td>{due ? <Badge tone="danger" dot={false}>${due.amount} due</Badge> : <Badge tone="success" dot={false}>Paid up</Badge>}</td>
                              <td style={{ textAlign: 'right' }}>
                                <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/families/${f.id}?student=${s.id}`)}>Open</Button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            );
          })
        ) : (
          <Card>
            <EmptyState icon="family" title="No families match">Try a different name, student or family code.</EmptyState>
          </Card>
        )}
      </div>
    </>
  );
}
