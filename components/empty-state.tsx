export function EmptyState({ title, body }: { title: string; body: string }) {
  return (
    <section className="card-soft">
      <h3>{title}</h3>
      <p className="small" style={{ marginTop: 8 }}>
        {body}
      </p>
    </section>
  );
}
