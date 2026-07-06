import { useMemo, useState } from 'react';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import Icon from '../../components/ui/Icons';

const channels = [
  { id: 'all', label: 'All Channels', count: 22, tone: 'all' },
  { id: 'whatsapp-api', label: 'WhatsApp API', count: 5, tone: 'whatsapp' },
  { id: 'whatsapp-linked', label: 'WhatsApp Linked Device', count: 10, tone: 'whatsapp' },
  { id: 'whatsapp-business', label: 'WhatsApp Business', count: 9, tone: 'whatsapp' },
  { id: 'zoom-phone', label: 'Zoom Phone', count: 5, tone: 'phone' },
  { id: 'zoom-chat', label: 'Zoom Chat', count: 10, tone: 'zoom' },
  { id: 'email', label: 'Email', count: 6, tone: 'email' },
];

const conversations = [
  {
    id: 'iman-ahmed',
    initials: 'IA',
    name: 'Iman Ahmed',
    email: 'iman.ahmed@mail.com',
    phone: '+144 597-4240',
    channel: 'Email',
    channelId: 'email',
    preview: 'You: Here is your updated Zoom link...',
    time: '44m ago',
    active: true,
  },
  {
    id: 'halima-abdullah',
    initials: 'HA',
    name: 'Halima Abdullah',
    email: 'halima.abdullah@mail.com',
    phone: '+144 597-4234',
    channel: 'WhatsApp API',
    channelId: 'whatsapp-api',
    preview: 'My child enjoyed the lesson, can we...',
    time: '44m ago',
    active: true,
  },
  {
    id: 'bilal-qureshi',
    initials: 'BQ',
    name: 'Bilal Qureshi',
    email: 'bilal.qureshi@mail.com',
    phone: '+144 597-5120',
    channel: 'WhatsApp Business',
    channelId: 'whatsapp-business',
    preview: 'You: Walaikumassalam! Yes, we hav...',
    time: '1d ago',
    active: true,
  },
  {
    id: 'sarah-abdullah',
    initials: 'SA',
    name: 'Sarah Abdullah',
    email: 'sarah.abdullah@mail.com',
    phone: '+144 597-6132',
    channel: 'WhatsApp Linked Device',
    channelId: 'whatsapp-linked',
    preview: 'You: Alhamdulillah, glad to hear that!...',
    time: '1d ago',
    active: true,
  },
  {
    id: 'zaid-baig',
    initials: 'ZB',
    name: 'Zaid Baig',
    email: 'zaid.baig@mail.com',
    phone: '+144 597-8140',
    channel: 'WhatsApp Business',
    channelId: 'whatsapp-business',
    preview: 'Do you offer a female tutor for Tajwe...',
    time: '1d ago',
    active: true,
  },
  {
    id: 'fatima-osman',
    initials: 'FO',
    name: 'Fatima Osman',
    email: 'fatima.osman@mail.com',
    phone: '+144 597-7721',
    channel: 'WhatsApp API',
    channelId: 'whatsapp-api',
    preview: 'What are the fee details for Tafsir St...',
    time: '1d ago',
    active: true,
  },
  {
    id: 'iman-sheikh',
    initials: 'IS',
    name: 'Iman Sheikh',
    email: 'iman.sheikh@mail.com',
    phone: '+144 597-9822',
    channel: 'WhatsApp API',
    channelId: 'whatsapp-api',
    preview: 'You: Walaikumassalam! Yes, we hav...',
    time: '1d ago',
    active: true,
  },
  {
    id: 'layla-hashmi',
    initials: 'LH',
    name: 'Layla Hashmi',
    email: 'layla.hashmi@mail.com',
    phone: '+144 597-1088',
    channel: 'WhatsApp Linked Device',
    channelId: 'whatsapp-linked',
    preview: "Can we reschedule tomorrow's clas...",
    time: '2d ago',
    active: true,
  },
  {
    id: 'iman-siddiqui',
    initials: 'IS',
    name: 'Iman Siddiqui',
    email: 'iman.siddiqui@mail.com',
    phone: '+144 597-3920',
    channel: 'Zoom Phone',
    channelId: 'zoom-phone',
    preview: 'Is the tutor available in the evening (...',
    time: '2d ago',
    active: true,
  },
  {
    id: 'karim-rahman',
    initials: 'KR',
    name: 'Karim Rahman',
    email: 'karim.rahman@mail.com',
    phone: '+144 597-4412',
    channel: 'Zoom Chat',
    channelId: 'zoom-chat',
    preview: 'I need the Zoom link again, previous ...',
    time: '2d ago',
    active: true,
  },
];

const messages = [
  {
    id: 1,
    dir: 'in',
    text: 'My child enjoyed the lesson, can we continue?',
    channel: 'Email',
    meta: '03 Jul · 06:42 AM',
  },
  {
    id: 2,
    dir: 'out',
    text: 'Walaikumassalam! Yes, we have flexible timings for Quran Reading (Nazra). Let me share the schedule.',
    channel: 'Email',
    meta: '03 Jul · 09:24 AM',
  },
];

function channelIconName(channel) {
  if (channel.includes('Phone')) return 'phone';
  if (channel.includes('Email')) return 'mail';
  return 'chat';
}

function ChannelBadge({ channel }) {
  return (
    <span className={`active-inbox-message-channel ${channel.toLowerCase().includes('email') ? 'email' : 'whatsapp'}`}>
      <Icon name={channelIconName(channel)} size={12} />
      {channel}
    </span>
  );
}

export default function UnifiedInbox() {
  const [activeChannel, setActiveChannel] = useState('all');
  const [selectedId, setSelectedId] = useState('halima-abdullah');

  const filteredConversations = useMemo(() => {
    if (activeChannel === 'all') return conversations;
    return conversations.filter((conversation) => conversation.channelId === activeChannel);
  }, [activeChannel]);

  const selectedConversation = filteredConversations.find((conversation) => conversation.id === selectedId) || filteredConversations[0] || conversations[1];
  const headerContact = {
    initials: 'ZI',
    name: 'Zainab Iqbal',
    phone: '+144 597-5120',
    email: 'zainab.iqbal@mail.com',
  };

  return (
    <>
      <PageHeader
        title="Active Conversations"
        subtitle="All channels in one place · replies auto-route to the original channel"
        actions={<Button variant="ghost" size="sm" icon={<Icon name="edit" size={14} />}>Compose</Button>}
      />

      <div className="active-inbox-shell">
        <aside className="active-inbox-channels">
          <h2>Channels</h2>
          <div className="active-inbox-channel-list">
            {channels.map((channel) => (
              <button
                key={channel.id}
                type="button"
                className={`active-inbox-channel ${activeChannel === channel.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveChannel(channel.id);
                  const next = channel.id === 'all' ? conversations[1] : conversations.find((conversation) => conversation.channelId === channel.id);
                  setSelectedId(next?.id || conversations[1].id);
                }}
              >
                <span className={`active-inbox-channel-dot ${channel.tone}`} />
                <span>{channel.label}</span>
                <b>{channel.count}</b>
              </button>
            ))}
          </div>
        </aside>

        <section className="active-inbox-list-panel">
          <div className="active-inbox-list-head">
            <h2>Conversations</h2>
            <span>22</span>
          </div>
          <div className="active-inbox-list">
            {filteredConversations.map((conversation) => (
              <button
                key={conversation.id}
                type="button"
                className={`active-inbox-conversation ${selectedConversation.id === conversation.id ? 'active' : ''}`}
                onClick={() => setSelectedId(conversation.id)}
              >
                <div className="active-inbox-avatar-wrap">
                  <Avatar name={conversation.name} size={44} />
                  <span className={`active-inbox-mini-channel ${conversation.channelId}`}>
                    <Icon name={channelIconName(conversation.channel)} size={11} />
                  </span>
                </div>
                <div className="active-inbox-conversation-copy">
                  <div className="active-inbox-conversation-top">
                    <b>{conversation.name}</b>
                    <span>{conversation.time}</span>
                  </div>
                  <p>{conversation.preview}</p>
                  {conversation.active && <span className="active-inbox-status">Active</span>}
                </div>
              </button>
            ))}
          </div>
        </section>

        <section className="active-inbox-thread">
          <div className="active-inbox-thread-head">
            <div className="active-inbox-thread-contact">
              <Avatar name={headerContact.initials} size={38} />
              <div>
                <h2>{headerContact.name}</h2>
                <p>{headerContact.phone} · {headerContact.email}</p>
              </div>
              <Button variant="ghost" size="sm">View Profile</Button>
            </div>
            <Button size="sm" icon={<Icon name="mail" size={14} />}>{selectedConversation?.channel || 'Email'}</Button>
          </div>

          <div className="active-inbox-messages">
            {messages.map((message) => (
              <div key={message.id} className={`active-inbox-message ${message.dir}`}>
                <div className="active-inbox-message-bubble">{message.text}</div>
                <div className="active-inbox-message-meta">
                  <ChannelBadge channel={message.channel} />
                  <span>{message.meta}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
