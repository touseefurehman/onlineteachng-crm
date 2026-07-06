export function Card({ children, className = '', style }) {
  return <div className={`card ${className}`} style={style}>{children}</div>;
}

export function CardHead({ title, sub, right }) {
  return (
    <div className="card-head">
      <div>
        <div className="card-title">{title}</div>
        {sub && <div className="card-sub">{sub}</div>}
      </div>
      {right}
    </div>
  );
}

export function CardBody({ children, className = '', style }) {
  return <div className={`card-pad ${className}`} style={style}>{children}</div>;
}
