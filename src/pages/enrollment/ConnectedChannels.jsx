import PageHeader from '../../components/layout/PageHeader';
import { Card, CardBody, CardHead } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const channels = [
  { name: 'WhatsApp API', detail: 'Connected · Auto-sync enabled', status: 'Active' },
  { name: 'WhatsApp Linked Device', detail: 'Connected · Auto-sync enabled', status: 'Active' },
  { name: 'WhatsApp Business', detail: 'Connected · Auto-sync enabled', status: 'Active' },
  { name: 'Zoom Phone', detail: 'Connected · Auto-sync enabled', status: 'Active' },
  { name: 'Zoom Chat', detail: 'Connected · Auto-sync enabled', status: 'Active' },
  { name: 'Email', detail: 'Connected · Auto-sync enabled', status: 'Active' },
];

export default function ConnectedChannels() {
  return (
    <>
      <PageHeader
        title="Connected Channels"
        subtitle="Workspace integrations and sync state for enrollment communications"
      />

      <Card>
        <CardHead title="Connected channels" sub="Live integrations and sync status" />
        <CardBody style={{ display: 'grid', gap: 10 }}>
          {channels.map((channel) => (
            <div key={channel.name} className="user-setting-row">
              <div>
                <b>{channel.name}</b>
                <div className="card-sub">{channel.detail}</div>
              </div>
              <Badge tone="success">{channel.status}</Badge>
            </div>
          ))}
        </CardBody>
      </Card>
    </>
  );
}
