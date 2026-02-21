import Link from "next/link";

export default function LandingPage() {
  return (
    <main>
      <h1 className="page-title">Complemento del Colegio + Tutor IA</h1>
      <p className="small" style={{ marginBottom: 16 }}>
        MVP1 en castellano rioplatense para 3ro (Argentina).
      </p>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
        <Link className="card kid-card" href="/child/home">
          <span className="pill">Niño/a</span>
          <h2>Entrar a Modo Child</h2>
          <p className="small">Tarea, Práctica, Lectura y Dictado semanal.</p>
        </Link>
        <Link className="card kid-card" href="/parent/home">
          <span className="pill">Padre/Madre</span>
          <h2>Entrar a Modo Parent</h2>
          <p className="small">Biblioteca, reportes y recomendaciones.</p>
        </Link>
      </div>
    </main>
  );
}
