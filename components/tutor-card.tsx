import type { TutorResponse } from "@/lib/tutor/schema";

export function TutorCard({ data }: { data: TutorResponse | null }) {
  if (!data) {
    return (
      <section className="card">
        <h3>Maestra Vivi</h3>
        <p className="small" style={{ marginTop: 8 }}>
          Cuando envíes tu respuesta, te acompaño paso a paso.
        </p>
      </section>
    );
  }

  return (
    <section className="card">
      <h3>Maestra Vivi</h3>
      <p style={{ marginTop: 8 }}>{data.child_message}</p>
      <p className="small" style={{ marginTop: 8 }}>
        {data.next_question}
      </p>
      {data.parent_note ? (
        <details style={{ marginTop: 12 }} open={!data.parent_note.collapsed}>
          <summary>{data.parent_note.title}</summary>
          <p className="small" style={{ marginTop: 6 }}>
            {data.parent_note.body}
          </p>
        </details>
      ) : null}
    </section>
  );
}
