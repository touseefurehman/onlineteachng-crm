import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icons';
import { Card, CardBody, CardHead } from '../../components/ui/Card';
import BarChart from '../../components/charts/BarChart';
import DonutChart from '../../components/charts/DonutChart';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { useApp } from '../../context/AppContext';
import { timeAgo } from '../../utils/date';
import { SOURCES, stageLabel } from '../../data/seed';

export default function EnrollmentDashboard() {
  const { leads, trials } = useApp();
  const navigate = useNavigate();

  const byStage = (s) => leads.filter((l) => l.stage === s).length;
  const scheduled = trials.filter((t) => t.status === 'scheduled').length;
  const converted = trials.filter((t) => t.status === 'converted').length;
  const convRate = trials.length ? Math.round((converted / trials.length) * 100) : 0;

  const pipelineData = [
    { label: 'New', value: byStage('raw'), color: 'var(--teal-500)' },
    { label: 'Intake', value: byStage('intake'), color: 'var(--teal-600)' },
    { label: 'Qualified', value: byStage('qualified'), color: 'var(--gold-400)' },
    { label: 'Trial', value: byStage('trial'), color: 'var(--info)' },
    { label: 'Dead', value: byStage('trial_dead'), color: 'var(--danger)' },
  ];

  const sourceColors = ['var(--teal-500)', 'var(--gold-400)', 'var(--info)', 'var(--success)', 'var(--warning)', 'var(--danger)'];
  const donut = SOURCES.map((s, i) => ({
    label: s,
    value: leads.filter((l) => l.source === s).length,
    color: sourceColors[i % sourceColors.length],
  })).filter((d) => d.value > 0);

  const recent = [...leads].sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)).slice(0, 6);

  return (
    <>
      <PageHeader
        title="Enrollment Dashboard"
        subtitle="Pipeline health from first contact to trial conversion"
        actions={
          <Button variant="gold" icon={<Icon name="calendar" size={15} />} onClick={() => navigate('/enrollment/schedule-trial')}>
            Schedule a Trial
          </Button>
        }
      />
      <div className="grid grid-4">
        <StatCard label="New leads" value={byStage('raw')} delta="Awaiting first contact" tone="var(--text-3)" />
        <StatCard label="Qualified" value={byStage('qualified')} delta="Ready for trial" tone="var(--teal-600)" />
        <StatCard label="Trials scheduled" value={scheduled} delta={`${trials.length} total trials`} tone="var(--info)" />
        <StatCard label="Trial conversion" value={`${convRate}%`} delta={`${converted} converted to active`} />
      </div>

      <div className="grid grid-2" style={{ marginTop: 14, alignItems: 'stretch' }}>
        <Card>
          <CardHead title="Pipeline by stage" sub="Live counts across the enrollment funnel" />
          <CardBody><BarChart data={pipelineData} /></CardBody>
        </Card>
        <Card>
          <CardHead title="Lead sources" sub="Where new families come from" />
          <CardBody><DonutChart data={donut} /></CardBody>
        </Card>
      </div>

      <Card style={{ marginTop: 14 }}>
        <CardHead
          title="Recent activity"
          sub="Latest movement across the pipeline"
          right={<Button variant="ghost" size="sm" onClick={() => navigate('/enrollment/new-leads')}>View all leads</Button>}
        />
        <CardBody style={{ paddingTop: 8 }}>
          {recent.map((l) => (
            <div key={l.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-soft)' }}>
              <Avatar name={l.parent.name} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: 13.5 }}>{l.parent.name}</b>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>{l.course} · {l.parent.country}</div>
              </div>
              <Badge tone={l.stage === 'trial_dead' ? 'danger' : l.stage === 'qualified' ? 'gold' : 'teal'}>{stageLabel(l.stage)}</Badge>
              <span style={{ fontSize: 12, color: 'var(--text-3)', width: 60, textAlign: 'right' }}>{timeAgo(l.lastActivity)}</span>
            </div>
          ))}
        </CardBody>
      </Card>
    </>
  );
}
