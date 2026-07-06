export default function Field({ label, required, error, hint, children, style }) {
  return (
    <div className={`field ${error ? 'invalid' : ''}`} style={style}>
      {label && (
        <label>
          {label} {required && <span className="req">*</span>}
        </label>
      )}
      {children}
      {error && <span className="error-msg">{error}</span>}
      {!error && hint && <span className="hint">{hint}</span>}
    </div>
  );
}
