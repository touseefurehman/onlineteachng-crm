export default function Button({ variant = 'primary', size, icon, children, ...rest }) {
  const cls = ['btn', `btn-${variant}`, size === 'sm' && 'btn-sm'].filter(Boolean).join(' ');
  return (
    <button type="button" className={cls} {...rest}>
      {icon}
      {children}
    </button>
  );
}
