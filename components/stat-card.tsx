export function StatCard({ title, value, subtitle }: { title: string; value: string; subtitle?: string }) {
  return (
    <article className="card">
      <p className="small">{title}</p>
      <h3 style={{ fontSize: "1.8rem", marginTop: 6 }}>{value}</h3>
      {subtitle ? (
        <p className="small" style={{ marginTop: 4 }}>
          {subtitle}
        </p>
      ) : null}
    </article>
  );
}
