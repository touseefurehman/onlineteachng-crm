import PageHeader from '../../components/layout/PageHeader';
import { Card, CardBody } from '../../components/ui/Card';
import Icon from '../../components/ui/Icons';

const channels = [
  { name: 'WhatsApp API', detail: 'Connected · Auto-sync enabled', icon: 'chat', tone: 'whatsapp' },
  { name: 'WhatsApp Linked Device', detail: 'Connected · Auto-sync enabled', icon: 'chat', tone: 'whatsapp' },
  { name: 'WhatsApp Business', detail: 'Connected · Auto-sync enabled', icon: 'chat', tone: 'whatsapp' },
  { name: 'Zoom Phone', detail: 'Connected · Auto-sync enabled', icon: 'phone', tone: 'phone' },
  { name: 'Zoom Chat', detail: 'Connected · Auto-sync enabled', icon: 'chat', tone: 'zoom' },
  { name: 'Email', detail: 'Connected · Auto-sync enabled', icon: 'mail', tone: 'email' },
];

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

export default function ConnectedChannels() {
  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Workspace, channel and notification configuration"
      />

      <div className="settings-grid">
        <Card className="settings-card">
          <CardBody className="settings-card-body">
            <h2 className="settings-section-title">Connected Channels</h2>
            <div className="connected-channel-list">
              {channels.map((channel) => (
                <div key={channel.name} className="connected-channel-row">
                  <span className={`connected-channel-icon ${channel.tone}`}>
                    <Icon name={channel.icon} size={17} />
                  </span>
                  <div className="connected-channel-copy">
                    <b>{channel.name}</b>
                    <span>{channel.detail}</span>
                  </div>
                  <span className="connected-channel-status">Active</span>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="settings-card">
          <CardBody className="settings-card-body">
            <h2 className="settings-section-title">Business Rules</h2>
            <div className="settings-rule-list">
              {rules.map((rule) => (
                <div key={rule.label} className="settings-rule-row">
                  <span>{rule.label}</span>
                  <b>{rule.value}</b>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      </div>

      <section className="settings-notifications">
        <h2 className="settings-section-title">Notification Preferences</h2>
        <Card className="settings-card">
          <CardBody className="settings-card-body">
            <div className="settings-notification-grid">
              {notifications.map((item) => (
                <label key={item} className="settings-notification-row">
                  <span>{item}</span>
                  <input type="checkbox" defaultChecked />
                </label>
              ))}
            </div>
          </CardBody>
        </Card>
      </section>
    </>
  );
}
