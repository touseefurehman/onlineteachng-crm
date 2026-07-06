import { useEffect, useMemo, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { Card, CardBody, CardHead } from '../../components/ui/Card';
import Icon from '../../components/ui/Icons';

const channelSeed = [
  { id: 'all', label: 'All Channels', icon: 'chat', total: 48, unread: 12, active: true },
  { id: 'whatsapp-api', label: 'WhatsApp API', icon: 'chat', total: 21, unread: 6 },
  { id: 'whatsapp-linked', label: 'WhatsApp Linked Device', icon: 'chat', total: 14, unread: 3 },
  { id: 'whatsapp-business', label: 'WhatsApp Business', icon: 'chat', total: 19, unread: 5 },
  { id: 'zoom-phone', label: 'Zoom Phone', icon: 'phone', total: 8, unread: 2 },
  { id: 'zoom-chat', label: 'Zoom Chat', icon: 'video', total: 11, unread: 1 },
  { id: 'email', label: 'Email', icon: 'mail', total: 16, unread: 4 },
];

const conversationSeed = [
  {
    id: 1,
    name: 'Amina Malik',
    email: 'amina@brightpath.org',
    phone: '+971 50 112 3344',
    channel: 'WhatsApp API',
    status: 'Qualified',
    assigned: 'Nadia',
    priority: true,
    unread: true,
    starred: true,
    preview: 'We can start the trial module this week if you confirm the booking.',
    time: '2m',
    avatar: 'AM',
    tag: 'Arabic',
    source: 'Website',
    course: 'IELTS Prep',
    teacher: 'Ms. Hana',
    leadScore: 91,
    statusTone: 'success',
  },
  {
    id: 2,
    name: 'Bilal Haddad',
    email: 'bilal@northschool.com',
    phone: '+971 55 221 1100',
    channel: 'Email',
    status: 'Intake',
    assigned: 'Saeed',
    priority: false,
    unread: false,
    starred: false,
    preview: 'Please share the parent consent form before tomorrow’s meeting.',
    time: '18m',
    avatar: 'BH',
    tag: 'English',
    source: 'Referral',
    course: 'Academic Writing',
    teacher: 'Mr. Khalid',
    leadScore: 76,
    statusTone: 'info',
  },
  {
    id: 3,
    name: 'Lina Qureshi',
    email: 'lina@learnerstudio.net',
    phone: '+971 56 443 2211',
    channel: 'Zoom Chat',
    status: 'Trial',
    assigned: 'Mariam',
    priority: true,
    unread: true,
    starred: true,
    preview: 'The student joined the trial room and asked for a second session.',
    time: '42m',
    avatar: 'LQ',
    tag: 'Urdu',
    source: 'Organic',
    course: 'Math Foundations',
    teacher: 'Ms. Noor',
    leadScore: 88,
    statusTone: 'warning',
  },
  {
    id: 4,
    name: 'Omar El-Tayeb',
    email: 'omar@consultme.io',
    phone: '+971 50 998 8811',
    channel: 'WhatsApp Business',
    status: 'Active',
    assigned: 'Jamal',
    priority: false,
    unread: false,
    starred: false,
    preview: 'The family confirmed the monthly package and wants a reminder.',
    time: '1h',
    avatar: 'OE',
    tag: 'Arabic',
    source: 'Ad',
    course: 'Conversation Club',
    teacher: 'Mr. Adeel',
    leadScore: 84,
    statusTone: 'success',
  },
  {
    id: 5,
    name: 'Sara Hassan',
    email: 'sara@cityprep.ai',
    phone: '+971 54 222 7788',
    channel: 'Zoom Phone',
    status: 'Raw Lead',
    assigned: 'Rania',
    priority: false,
    unread: true,
    starred: false,
    preview: 'Can you share your fee structure for 4-week intensive classes?',
    time: '3h',
    avatar: 'SH',
    tag: 'English',
    source: 'Instagram',
    course: 'SAT Prep',
    teacher: 'Ms. Layla',
    leadScore: 63,
    statusTone: 'muted',
  },
  {
    id: 6,
    name: 'Yousef Noor',
    email: 'yousef@inspireedu.edu',
    phone: '+971 52 556 1144',
    channel: 'WhatsApp Linked Device',
    status: 'Active Dead',
    assigned: 'Hina',
    priority: true,
    unread: false,
    starred: true,
    preview: 'The student missed the last two lessons, but the parent is still interested.',
    time: '4h',
    avatar: 'YN',
    tag: 'Arabic',
    source: 'Website',
    course: 'Science Support',
    teacher: 'Ms. Fariha',
    leadScore: 71,
    statusTone: 'danger',
  },
  {
    id: 7,
    name: 'Noor Al-Sayed',
    email: 'noor@brightlearn.me',
    phone: '+971 50 776 9812',
    channel: 'Email',
    status: 'Trial Dead',
    assigned: 'Ali',
    priority: false,
    unread: true,
    starred: false,
    preview: 'Thanks, but the trial did not convert. We will revisit later.',
    time: '5h',
    avatar: 'NA',
    tag: 'Arabic',
    source: 'Email',
    course: 'Reading Club',
    teacher: 'Mr. Salim',
    leadScore: 58,
    statusTone: 'warning',
  },
];

const initialThreads = {
  1: [
    { id: 11, dir: 'in', type: 'text', text: 'Hello! I would love to start the IELTS prep course next week.', time: '09:12', status: 'Seen', meta: 'Incoming' },
    { id: 12, dir: 'out', type: 'text', text: 'Perfect — I can confirm the intake and share the trial link.', time: '09:18', status: 'Delivered', meta: 'Sent' },
    { id: 13, dir: 'in', type: 'image', text: 'Here is the student profile screenshot from the parent.', time: '09:24', status: 'Read', meta: 'Image' },
  ],
  2: [
    { id: 21, dir: 'in', type: 'pdf', text: 'Please review the parent consent form before tomorrow’s session.', time: '08:32', status: 'Delivered', meta: 'PDF' },
    { id: 22, dir: 'out', type: 'text', text: 'I will send a reminder and attach the latest version.', time: '08:38', status: 'Seen', meta: 'Sent' },
  ],
  3: [
    { id: 31, dir: 'in', type: 'voice', text: 'I joined the room but had a small delay connecting.', time: '07:05', status: 'Read', meta: 'Voice note' },
    { id: 32, dir: 'out', type: 'text', text: 'No problem — I can open a second trial slot on Thursday.', time: '07:09', status: 'Seen', meta: 'Sent' },
  ],
  4: [
    { id: 41, dir: 'in', type: 'text', text: 'The family confirmed the full package and wants a reminder for the next lesson.', time: '06:11', status: 'Seen', meta: 'Incoming' },
    { id: 42, dir: 'out', type: 'text', text: 'Understood. I have scheduled the reminder for tomorrow morning.', time: '06:16', status: 'Delivered', meta: 'Sent' },
  ],
  5: [
    { id: 51, dir: 'in', type: 'text', text: 'Can you share a quick fee overview and the next available class?', time: '05:40', status: 'Delivered', meta: 'Incoming' },
  ],
  6: [
    { id: 61, dir: 'in', type: 'text', text: 'The progress report is ready and the parent wants an update.', time: '04:56', status: 'Seen', meta: 'Incoming' },
  ],
  7: [
    { id: 71, dir: 'in', type: 'text', text: 'We may revisit the program later, but the trial was not a fit.', time: '03:20', status: 'Seen', meta: 'Incoming' },
  ],
};

const toneMap = {
  success: 'success',
  warning: 'warning',
  danger: 'danger',
  info: 'info',
  muted: 'muted',
};

export default function UnifiedInbox() {
  const [activeChannel, setActiveChannel] = useState('all');
  const [channelQuery, setChannelQuery] = useState('');
  const [conversationQuery, setConversationQuery] = useState('');
  const [mode, setMode] = useState('all');
  const [selectedId, setSelectedId] = useState(conversationSeed[0].id);
  const [visibleCount, setVisibleCount] = useState(6);
  const [showProfile, setShowProfile] = useState(false);
  const [draft, setDraft] = useState('');
  const [threadMap, setThreadMap] = useState(initialThreads);

  const filteredChannels = useMemo(() => {
    const normalized = channelQuery.toLowerCase();
    return channelSeed.filter((channel) => !normalized || channel.label.toLowerCase().includes(normalized));
  }, [channelQuery]);

  const filteredConversations = useMemo(() => {
    const normalized = conversationQuery.toLowerCase();
    return conversationSeed.filter((conversation) => {
      const channelOk = activeChannel === 'all' || conversation.channel.toLowerCase().includes(activeChannel.replace(/-/g, ' '));
      const textOk = !normalized || [conversation.name, conversation.preview, conversation.email, conversation.channel, conversation.tag, conversation.course].some((value) => value.toLowerCase().includes(normalized));
      const modeOk = mode === 'all' || (mode === 'unread' && conversation.unread) || (mode === 'starred' && conversation.starred);
      return channelOk && textOk && modeOk;
    });
  }, [activeChannel, mode, conversationQuery]);

  useEffect(() => {
    setVisibleCount(6);
  }, [activeChannel, mode, conversationQuery]);

  useEffect(() => {
    if (!filteredConversations.some((item) => item.id === selectedId)) {
      setSelectedId(filteredConversations[0]?.id || null);
    }
  }, [filteredConversations, selectedId]);

  const selectedConversation = filteredConversations.find((item) => item.id === selectedId) || filteredConversations[0] || null;
  const stream = selectedConversation ? threadMap[selectedConversation.id] || [] : [];
  const visibleConversations = filteredConversations.slice(0, visibleCount);
  const unreadCount = filteredConversations.filter((item) => item.unread).length;
  const priorityCount = filteredConversations.filter((item) => item.priority).length;
  const waitingCount = filteredConversations.filter((item) => ['Raw Lead', 'Intake'].includes(item.status)).length;

  const handleScroll = (event) => {
    const target = event.currentTarget;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight - 60) {
      setVisibleCount((value) => Math.min(value + 4, filteredConversations.length));
    }
  };

  const sendMessage = () => {
    if (!draft.trim() || !selectedConversation) return;
    const nextMessage = {
      id: Date.now(),
      dir: 'out',
      type: 'text',
      text: draft.trim(),
      time: 'Now',
      status: 'Sending',
      meta: 'Sent now',
    };
    setThreadMap((current) => ({
      ...current,
      [selectedConversation.id]: [...(current[selectedConversation.id] || []), nextMessage],
    }));
    setDraft('');
  };

  return (
    <>
      <PageHeader
        title="Unified Inbox"
        subtitle="Omnichannel conversations, AI assist, automation and CRM context in one workspace"
        actions={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Button variant="ghost" size="sm">Automation</Button>
            <Button variant="gold" size="sm">AI Copilot</Button>
            <Button size="sm">Create task</Button>
          </div>
        }
      />

      <div className="grid inbox-shell">
        <Card className="inbox-sidebar-card">
          <CardBody style={{ padding: 12 }}>
            <div className="inbox-sidebar-actions">
              <Button size="sm">Compose</Button>
              <Button variant="ghost" size="sm">New</Button>
            </div>

            <div className="field" style={{ marginBottom: 10 }}>
              <label htmlFor="channel-search">Channels</label>
              <input id="channel-search" value={channelQuery} onChange={(event) => setChannelQuery(event.target.value)} placeholder="Search inbox" />
            </div>

            <div className="field" style={{ marginBottom: 10 }}>
              <label htmlFor="channel-filter">Filter</label>
              <select id="channel-filter" value={activeChannel} onChange={(event) => setActiveChannel(event.target.value)}>
                <option value="all">All channels</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="zoom">Zoom</option>
                <option value="email">Email</option>
              </select>
            </div>

            <div className="inbox-channel-list">
              {filteredChannels.map((channel) => (
                <button key={channel.id} type="button" className={`inbox-channel-item ${activeChannel === channel.id ? 'active' : ''}`} onClick={() => setActiveChannel(channel.id)}>
                  <div className="inbox-channel-icon">
                    <Icon name={channel.icon} size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <span>{channel.label}</span>
                      {channel.unread > 0 && <Badge tone="danger">{channel.unread}</Badge>}
                    </div>
                    <div className="inbox-channel-meta">{channel.total} conversations</div>
                  </div>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="inbox-list-card">
          <CardHead
            title="Conversations"
            sub="Live enrollment queue with channel routing, AI assist and task-ready context"
            right={
              <div className="inbox-list-actions">
                <Button variant="ghost" size="sm">Bulk</Button>
                <Button variant="ghost" size="sm">Sort</Button>
              </div>
            }
          />
          <CardBody style={{ paddingTop: 8 }}>
            <div className="inbox-queue-summary">
              <div className="inbox-queue-pill"><strong>{unreadCount}</strong><span>Unread</span></div>
              <div className="inbox-queue-pill"><strong>{priorityCount}</strong><span>Priority</span></div>
              <div className="inbox-queue-pill"><strong>{waitingCount}</strong><span>Waiting</span></div>
            </div>

            <div className="inbox-toolbar">
              <div className="search-wrap" style={{ maxWidth: '100%' }}>
                <Icon name="search" size={15} />
                <input value={conversationQuery} onChange={(event) => setConversationQuery(event.target.value)} placeholder="Search conversations" />
              </div>
              <div className="chip-row">
                <button type="button" className={`filter-chip ${mode === 'all' ? 'active' : ''}`} onClick={() => setMode('all')}>All</button>
                <button type="button" className={`filter-chip ${mode === 'unread' ? 'active' : ''}`} onClick={() => setMode('unread')}>Unread</button>
                <button type="button" className={`filter-chip ${mode === 'starred' ? 'active' : ''}`} onClick={() => setMode('starred')}>Starred</button>
              </div>
            </div>

            <div className="inbox-conversation-list" onScroll={handleScroll}>
              {visibleConversations.map((conversation) => (
                <button key={conversation.id} type="button" className={`inbox-conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`} onClick={() => setSelectedId(conversation.id)}>
                  <div className="inbox-conversation-top">
                    <div className="inbox-avatar-shell">
                      <Avatar name={conversation.name} size={40} />
                      <span className="inbox-channel-dot">
                        <Icon name={conversation.channel.includes('WhatsApp') ? 'chat' : conversation.channel.includes('Zoom') ? 'video' : 'mail'} size={11} />
                      </span>
                    </div>
                    <div className="inbox-conversation-body">
                      <div className="inbox-item-name-row">
                        <strong>{conversation.name}</strong>
                        <span className="inbox-item-time">{conversation.time}</span>
                      </div>
                      <div className="inbox-item-preview">{conversation.preview}</div>
                      <div className="inbox-item-meta-row">
                        <span>{conversation.channel}</span>
                        <span>•</span>
                        <span>{conversation.assigned}</span>
                      </div>
                    </div>
                  </div>
                  <div className="inbox-conversation-bottom">
                    <Badge tone={toneMap[conversation.statusTone] || 'muted'}>{conversation.status}</Badge>
                    {conversation.priority && <Badge tone="warning">Priority</Badge>}
                    {conversation.unread && <Badge tone="danger">Unread</Badge>}
                    {conversation.starred && <Icon name="star" size={14} style={{ color: 'var(--gold-400)' }} />}
                  </div>
                </button>
              ))}
              {!filteredConversations.length && <div className="empty-state" style={{ padding: 20 }}><h4>No conversations match</h4><p>Adjust the filter or try another search.</p></div>}
              {visibleCount < filteredConversations.length && <div className="inbox-load-more">Scroll for more conversations</div>}
            </div>
          </CardBody>
        </Card>

        <Card className="inbox-thread-card">
          <CardHead
            title={selectedConversation ? selectedConversation.name : 'No conversation'}
            sub={selectedConversation ? `${selectedConversation.email} · ${selectedConversation.phone}` : 'Select a conversation'}
            right={
              <div className="inbox-list-actions">
                <Button variant="ghost" size="sm" onClick={() => setShowProfile(true)}>Profile</Button>
                <Button variant="ghost" size="sm">Assign</Button>
              </div>
            }
          />
          <CardBody style={{ paddingTop: 8 }}>
            {selectedConversation && (
              <>
                <div className="inbox-thread-summary">
                  <div className="inbox-thread-contact">
                    <Avatar name={selectedConversation.name} size={42} />
                    <div>
                      <div style={{ fontWeight: 700 }}>{selectedConversation.name}</div>
                      <div className="inbox-thread-contact-meta">{selectedConversation.channel} • {selectedConversation.source}</div>
                    </div>
                  </div>
                  <div className="inbox-thread-tags">
                    <Badge tone="info">{selectedConversation.course}</Badge>
                    <Badge tone="teal">Lead score {selectedConversation.leadScore}</Badge>
                    <Badge tone="muted">{selectedConversation.tag}</Badge>
                    <Badge tone="success">Assigned: {selectedConversation.assigned}</Badge>
                  </div>
                </div>

                <div className="inbox-aux-grid">
                  <div className="inbox-aux-card">
                    <div className="inbox-aux-title">CRM links</div>
                    <div className="chip-row">
                      <span className="filter-chip">Contact</span>
                      <span className="filter-chip">Lead</span>
                      <span className="filter-chip">Opportunity</span>
                      <span className="filter-chip">Student</span>
                      <span className="filter-chip">Task</span>
                      <span className="filter-chip">Note</span>
                    </div>
                  </div>
                  <div className="inbox-aux-card">
                    <div className="inbox-aux-title">AI assist</div>
                    <div className="chip-row">
                      <span className="filter-chip active">Suggest reply</span>
                      <span className="filter-chip">Rewrite</span>
                      <span className="filter-chip">Translate</span>
                      <span className="filter-chip">Summarize</span>
                    </div>
                  </div>
                </div>

                <div className="inbox-thread-messages">
                  {stream.map((message) => (
                    <div key={message.id} className={`inbox-bubble ${message.dir === 'out' ? 'out' : 'in'}`}>
                      <div className="inbox-bubble-title">
                        <strong>{message.dir === 'out' ? 'You' : selectedConversation.name}</strong>
                        <span>{message.time}</span>
                      </div>
                      <div className="inbox-bubble-body">{message.text}</div>
                      <div className="inbox-bubble-meta">{message.meta} • {message.status}</div>
                    </div>
                  ))}
                </div>

                <div className="inbox-composer">
                  <div className="inbox-composer-actions">
                    <Button variant="ghost" size="sm" icon={<Icon name="bolt" size={14} />}>AI Reply</Button>
                    <Button variant="ghost" size="sm" icon={<Icon name="edit" size={14} />}>Rewrite</Button>
                    <Button variant="ghost" size="sm" icon={<Icon name="paperclip" size={14} />}>Attach</Button>
                    <Button variant="ghost" size="sm" icon={<Icon name="mic" size={14} />}>Voice</Button>
                    <Button variant="ghost" size="sm" icon={<Icon name="note" size={14} />}>Note</Button>
                  </div>
                  <textarea value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Reply with a polished message, template, or note…" rows={4} />
                  <div className="inbox-compose-footer">
                    <div className="chip-row">
                      <span className="filter-chip">😊 Emoji</span>
                      <span className="filter-chip">Template</span>
                      <span className="filter-chip">Schedule</span>
                      <span className="filter-chip">Internal note</span>
                    </div>
                    <Button onClick={sendMessage}>Send</Button>
                  </div>
                </div>
              </>
            )}
          </CardBody>
        </Card>
      </div>

      <div className={`inbox-drawer ${showProfile ? 'open' : ''}`}>
        <div className="inbox-drawer-backdrop" onClick={() => setShowProfile(false)} />
        <div className="inbox-drawer-panel">
          <div className="inbox-drawer-head">
            <div>
              <div className="card-title">Customer profile</div>
              <div className="card-sub">Context, activity timeline and next best actions</div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowProfile(false)}>Close</Button>
          </div>
          {selectedConversation && (
            <div className="inbox-drawer-body">
              <div className="inbox-profile-card">
                <Avatar name={selectedConversation.name} size={46} />
                <div>
                  <div style={{ fontWeight: 700 }}>{selectedConversation.name}</div>
                  <div className="inbox-thread-contact-meta">{selectedConversation.email}</div>
                  <div className="inbox-thread-contact-meta">{selectedConversation.phone}</div>
                </div>
              </div>

              <div className="inbox-profile-grid">
                <div>
                  <label>Country</label>
                  <div>United Arab Emirates</div>
                </div>
                <div>
                  <label>Timezone</label>
                  <div>GMT+4</div>
                </div>
                <div>
                  <label>Preferred Language</label>
                  <div>{selectedConversation.tag}</div>
                </div>
                <div>
                  <label>Current Course</label>
                  <div>{selectedConversation.course}</div>
                </div>
                <div>
                  <label>Assigned Teacher</label>
                  <div>{selectedConversation.teacher}</div>
                </div>
                <div>
                  <label>Last Contact</label>
                  <div>Today • 09:18</div>
                </div>
              </div>

              <div className="inbox-aux-card">
                <div className="inbox-aux-title">Timeline</div>
                <div className="timeline-item"><span className="timeline-dot" /> <div><strong>Call</strong><div className="inbox-thread-contact-meta">09:00 • Follow-up with parent on trial schedule</div></div></div>
                <div className="timeline-item"><span className="timeline-dot" /> <div><strong>WhatsApp</strong><div className="inbox-thread-contact-meta">08:40 • Shared a course outline and pricing</div></div></div>
                <div className="timeline-item"><span className="timeline-dot" /> <div><strong>Notes</strong><div className="inbox-thread-contact-meta">08:17 • Interested in a 4-week intensive plan</div></div></div>
              </div>

              <div className="inbox-profile-actions">
                <Button variant="ghost">Call</Button>
                <Button variant="ghost">WhatsApp</Button>
                <Button variant="ghost">Email</Button>
                <Button variant="gold">Schedule</Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
