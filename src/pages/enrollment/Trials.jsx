import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Badge, { trialStatusLabel, trialStatusTone } from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import Icon from '../../components/ui/Icons';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../hooks/useToast';
import { fmtDate, fmtTime } from '../../utils/date';
import { useDebounce } from '../../hooks/useDebounce';

export default function Trials() {
  const { trials, search, actions } = useApp();
  const toast = useToast();
  const navigate = useNavigate();
  const q = useDebounce(search.toLowerCase());

  const list = useMemo(() => {
    let l = [...trials].sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start));
    if (q) l = l.filter((t) => t.studentName.toLowerCase().includes(q) || t.parentName.toLowerCase().includes(q) || t.tutorName.toLowerCase().includes(q));
    return l;
  }, [trials, q]);

  const scheduled = trials.filter((t) => t.status === 'scheduled');
  const today = new Date().toISOString().slice(0, 10);

  return (
    <>
      <PageHeader
        title="Trials"
        subtitle="Every trial class, its tutor and its outcome"
        actions={
          <Button variant="gold" icon={<Icon name="calendar" size={15} />} onClick={() => navigate('/enrollment/schedule-trial')}>
            Schedule a Trial
          </Button>
        }
      />
      <div className="grid grid-3">
        <StatCard label="Scheduled" value={scheduled.length} delta="Upcoming trial classes" tone="var(--info)" />
        <StatCard label="Happening today" value={scheduled.filter((t) => t.date === today).length} delta="Confirm Zoom links are sent" tone="var(--warning)" />
        <StatCard label="Converted" value={trials.filter((t) => t.status === 'converted').length} delta="Now active families" />
      </div>

      <div className="table-wrap" style={{ marginTop: 16 }}>
        <table>
          <thead>
            <tr>
              <th>Student</th><th>Parent</th><th>Course</th><th>Date &amp; time</th><th>Tutor</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length ? list.map((t) => (
              <tr key={t.id}>
                <td>
                  <div className="name-cell">
                    <Avatar name={t.studentName} />
                    <div><b>{t.studentName}</b><span className="mono" style={{ fontSize: 11 }}>{t.id}</span></div>
                  </div>
                </td>
                <td>{t.parentName}</td>
                <td>{t.course}</td>
                <td>
                  <b>{fmtDate(t.date)}</b>
                  <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{fmtTime(t.start)} – {fmtTime(t.end)} ({t.timezone})</div>
                </td>
                <td>{t.tutorName}</td>
                <td><Badge tone={trialStatusTone[t.status]}>{trialStatusLabel[t.status]}</Badge></td>
                <td>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {t.status === 'scheduled' && (
                      <>
                        <Button size="sm" onClick={() => { actions.convertTrial(t.id); toast(`${t.studentName} converted — family created.`); }}>
                          Convert
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/enrollment/schedule-trial?rescheduleId=${t.id}`)}>
                          Reschedule
                        </Button>
                        <Button size="sm" variant="danger-ghost" onClick={() => { actions.setTrialStatus(t.id, 'no_show'); toast('Marked as no-show.', 'info'); }}>
                          No-show
                        </Button>
                      </>
                    )}
                    {t.status !== 'scheduled' && t.status !== 'converted' && (
                      <Button size="sm" variant="ghost" onClick={() => navigate(`/enrollment/schedule-trial?rescheduleId=${t.id}`)}>
                        Rebook
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7}>
                  <EmptyState icon="clock" title="No trials yet">Schedule the first trial from the Qualified Leads page.</EmptyState>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
