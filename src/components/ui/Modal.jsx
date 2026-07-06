import { useEffect } from 'react';
import Icon from './Icons';

export default function Modal({ open, title, onClose, children, width = 560 }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: width }} role="dialog" aria-modal="true" aria-label={title}>
        <div className="modal-head">
          <div className="card-title font-display" style={{ fontSize: 18 }}>{title}</div>
          <button className="btn btn-ghost btn-sm" onClick={onClose} aria-label="Close dialog">
            <Icon name="x" size={16} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
