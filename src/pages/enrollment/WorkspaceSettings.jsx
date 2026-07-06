import PageHeader from '../../components/layout/PageHeader';
import { Card, CardBody, CardHead } from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const rules = [
  { label: 'Trial duration (days)', value: '7' },
  { label: 'Auto follow-up on Friday (dead leads)', value: 'Enabled' },
  { label: 'SLA response target', value: '15 min' },
  { label: 'Support sees Sales pipeline', value: 'Disabled' },
  { label: 'Enrollment sees Support tickets', value: 'Disabled' },
];

const notifications = [
  'New lead assigned',
  'Trial ending in 24h',
  'New WhatsApp message',
  'SLA breach warning',
  'Ticket escalation',
  'Weekly performance digest',
];

export default function WorkspaceSettings() {
  return (
    <>
      <PageHeader
        title="Workspace Settings"
        subtitle="Business rules, compliance controls and notification preferences"
        actions={<Button variant="gold" size="sm">Save changes</Button>}
      />

      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        <Card>
          <CardHead title="Business rules" sub="Core operating policies" />
          <CardBody style={{ display: 'grid', gap: 10 }}>
            {rules.map((rule) => (
              <div key={rule.label} className="user-setting-row">
                <div>
                  <b>{rule.label}</b>
                </div>
                <span className="rule-value">{rule.value}</span>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHead title="Notification preferences" sub="Alerts that reach the team" />
          <CardBody style={{ display: 'grid', gap: 8 }}>
            {notifications.map((item) => (
              <label key={item} className="notification-row">
                <span>{item}</span>
                <input type="checkbox" defaultChecked />
              </label>
            ))}
          </CardBody>
        </Card>
      </div>
    </>
  );
}
