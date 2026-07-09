import { useNavigate } from 'react-router-dom';
import PageHeader from '../../components/layout/PageHeader';
import StatCard from '../../components/ui/StatCard';
import Button from '../../components/ui/Button';
import { Card, CardBody, CardHead } from '../../components/ui/Card';
import BarChart from '../../components/charts/BarChart';
import DonutChart from '../../components/charts/DonutChart';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import { useApp } from '../../context/AppContext';
import { timeAgo } from '../../utils/date';

export default function AdminDashboard() {
  const { families, tickets } = useApp();
  const navigate = useNavigate();

  const activeFamilies = families.filter((f) => f.status === 'active');
  const familiesOnLeave = families.filter((f) => f.status === 'on_leave');
  const deadFamilies = families.filter((f) => f.status === 'dead');
  const students = activeFamilies.flatMap((f) => f.students);
  const openTickets = tickets.filter((t) => t.status === 'Open' || t.status === 'In Progress');
  const dueInvoices = students.flatMap((s) => s.payments).filter((p) => p.status === 'due');

  const sizeDist = [1, 2, 3].map((n) => ({
    label: `${n} student${n > 1 ? 's' : ''}`,
    value: activeFamilies.filter((f) => f.students.length === n).length,
  }));
  const sizeColors = ['var(--teal-500)', 'var(--gold-400)', 'var(--info)'];

  const ticketDonut = ['Open', 'In Progress', 'Resolved', 'Closed'].map((s, i) => ({
    label: s,
    value: tickets.filter((t) => t.status === s).length,
    color: ['var(--danger)', 'var(--warning)', 'var(--success)', 'var(--text-3)'][i],
  })).filter((d) => d.value > 0);

  const recent = [...activeFamilies].sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity)).slice(0, 6);

  return (
    <>
      <PageHeader
        title="Admin & Support Dashboard"
        subtitle="Active families, their students and the support queue"
        actions={<Button variant="gold" onClick={() => navigate('/admin/tickets')}>Open ticket queue</Button>}
      />
      <div className="grid grid-4">
        <StatCard label="Active families" value={activeFamilies.length} delta={`${familiesOnLeave.length} on leave · ${deadFamilies.length} dead`} tone="var(--teal-600)" />
        <StatCard label="Active students" value={students.length} delta={`${(students.length / Math.max(activeFamilies.length, 1)).toFixed(1)} per family avg`} />
        <StatCard label="Open tickets" value={openTickets.length} delta={`${tickets.length} total this month`} tone="var(--warning)" />
        <StatCard label="Invoices due" value={dueInvoices.length} delta="Awaiting payment" tone="var(--danger)" />
      </div>

      <div className="grid grid-2" style={{ marginTop: 14 }}>
        <Card>
          <CardHead title="Family size distribution" sub="Students grouped under each family code" />
          <CardBody><BarChart data={sizeDist.map((d, i) => ({ ...d, color: sizeColors[i] }))} /></CardBody>
        </Card>
        <Card>
          <CardHead title="Ticket status" sub="Support workload right now" />
          <CardBody><DonutChart data={ticketDonut} /></CardBody>
        </Card>
      </div>

      <Card style={{ marginTop: 14 }}>
        <CardHead
          title="Recently active families"
          right={<Button variant="ghost" size="sm" onClick={() => navigate('/admin/families')}>All families</Button>}
        />
        <CardBody style={{ paddingTop: 8 }}>
          {recent.map((f) => (
            <div key={f.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border-soft)' }}>
              <Avatar name={f.surname + ' Family'} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: 13.5 }}>{f.surname} Family</b>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }}>
                  <span className="mono">{f.id}</span> · {f.students.length} student{f.students.length > 1 ? 's' : ''} · {f.parent.name}
                </div>
              </div>
              <Badge tone="success">Active</Badge>
              <span style={{ fontSize: 12, color: 'var(--text-3)', width: 60, textAlign: 'right' }}>{timeAgo(f.lastActivity)}</span>
              <Button size="sm" variant="ghost" onClick={() => navigate(`/admin/families/${f.id}`)}>Open</Button>
            </div>
          ))}
        </CardBody>
      </Card>
    </>
  );
}
