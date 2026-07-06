import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icons';
import { Card, CardBody } from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const teamMembers = [
  { name: 'Sana Malik', role: 'Enrollment Agent', team: 'Enrollment', status: 'Active', lastLogin: 'just now', initials: 'SM' },
  { name: 'Bilal Ahmed', role: 'Enrollment Agent', team: 'Enrollment', status: 'Active', lastLogin: 'just now', initials: 'BA' },
  { name: 'Sohail Sales22', role: 'Enrollment Agent', team: 'Enrollment', status: 'Active', lastLogin: 'just now', initials: 'SS' },
  { name: 'Fatima Noor', role: 'Enrollment Agent', team: 'Enrollment', status: 'Active', lastLogin: '2d ago', initials: 'FN' },
  { name: 'Usman Tariq', role: 'Enrollment Agent', team: 'Enrollment', status: 'Active', lastLogin: '3d ago', initials: 'UT' },
  { name: 'Ayesha Raza', role: 'Enrollment Agent', team: 'Enrollment', status: 'Active', lastLogin: '1d ago', initials: 'AR' },
  { name: 'Mariam QC', role: 'Support Agent', team: 'Support', status: 'Active', lastLogin: '1d ago', initials: 'MQ' },
  { name: 'Danish Support', role: 'Support Agent', team: 'Support', status: 'Active', lastLogin: '1d ago', initials: 'DS' },
  { name: 'Rabia Care', role: 'Support Agent', team: 'Support', status: 'Active', lastLogin: '2d ago', initials: 'RC' },
  { name: 'Hamid Response', role: 'Support Agent', team: 'Support', status: 'Active', lastLogin: '1d ago', initials: 'HR' },
  { name: 'Hafiz', role: 'Super Admin', team: 'Admin', status: 'Active', lastLogin: 'just now', initials: 'H' },
];

export default function UserManagement() {
  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Team access, workspace controls and communication settings for the enrollment operation"
        actions={
          <Button variant="gold" size="sm" icon={<Icon name="plus" size={14} />}>
            Invite User
          </Button>
        }
      />

      <div className="grid grid-4">
        <Card>
          <CardBody>
            <div className="stat-label">Team members</div>
            <div className="stat-value">11</div>
            <div className="stat-delta">Across Sales & Support</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="stat-label">Active channels</div>
            <div className="stat-value">6</div>
            <div className="stat-delta">Connected and syncing</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="stat-label">Automation rules</div>
            <div className="stat-value">5</div>
            <div className="stat-delta">Configured for the workspace</div>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <div className="stat-label">Notifications</div>
            <div className="stat-value">6</div>
            <div className="stat-delta">Enabled alert types</div>
          </CardBody>
        </Card>
      </div>

      <div className="grid" style={{ marginTop: 14, gap: 14 }}>
        <Card>
          <CardBody style={{ paddingTop: 10 }}>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Team</th>
                    <th>Status</th>
                    <th>Last Login</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {teamMembers.map((member) => (
                    <tr key={member.name}>
                      <td>
                        <div className="name-cell">
                          <div className="avatar" style={{ width: 34, height: 34 }}>{member.initials}</div>
                          <div>
                            <b>{member.name}</b>
                            <span>{member.role}</span>
                          </div>
                        </div>
                      </td>
                      <td>{member.role}</td>
                      <td>{member.team}</td>
                      <td><Badge tone="success">{member.status}</Badge></td>
                      <td>{member.lastLogin}</td>
                      <td><Button variant="ghost" size="sm">Edit</Button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </div>
    </>
  );
}
