// web/src/components/common/Modal.jsx
export default function Modal({
  open,
  onClose,
  onConfirm,             // if provided, shows Confirm button; otherwise it's an alert
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  tone = 'primary',      // primary | warning | error | neutral
  children,              // optional custom body instead of simple message
}) {
  if (!open) return null;

  const toneClass = {
    primary: 'btn-primary',
    warning: 'btn-warning',
    error: 'btn-error',
    neutral: 'btn-neutral',
  }[tone] || 'btn-primary';

  return (
    <div className="modal modal-open">
      <div className="modal-box bg-base-100 text-base-content">
        {title && <h3 className="font-bold text-lg">{title}</h3>}
        {message && <p className="py-4">{message}</p>}
        {children}
        <div className="modal-action">
          <button className="btn" onClick={onClose}>{cancelText}</button>
          {onConfirm && (
            <button className={`btn ${toneClass}`} onClick={onConfirm}>
              {confirmText}
            </button>
          )}
        </div>
      </div>
      <div className="modal-backdrop bg-black/40" onClick={onClose} />
    </div>
  );
}