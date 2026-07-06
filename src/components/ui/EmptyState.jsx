import Icon from './Icons';

export default function EmptyState({ icon = 'search', title, children }) {
  return (
    <div className="empty-state">
      <Icon name={icon} size={38} />
      <h4>{title}</h4>
      <p>{children}</p>
    </div>
  );
}
