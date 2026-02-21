import Link from "next/link";
import { TopNav } from "@/components/top-nav";

const childItems = [
  { href: "/child/home", label: "Inicio" },
  { href: "/child/task", label: "Tarea" },
  { href: "/child/practice", label: "Práctica" },
  { href: "/child/reading", label: "Lectura" },
  { href: "/child/dictation", label: "Dictado" }
];

export default function ChildHomePage() {
  return (
    <main>
      <TopNav items={childItems} />
      <h1 className="page-title">Hola, ¿qué hacemos hoy?</h1>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
        <Link className="card kid-card" href="/child/task">
          <span className="pill">Tarea</span>
          <h2>Resolver tarea</h2>
          <p className="small">Traé una consigna y la resolvemos juntos.</p>
        </Link>
        <Link className="card kid-card" href="/child/practice">
          <span className="pill">Práctica</span>
          <h2>Entrenar skills</h2>
          <p className="small">10-15 min adaptativos + práctica del colegio.</p>
        </Link>
        <Link className="card kid-card" href="/child/reading">
          <span className="pill">Lectura</span>
          <h2>Comprender textos</h2>
          <p className="small">Literal, inferencial y vocabulario.</p>
        </Link>
      </div>
      <section className="card" style={{ marginTop: 14 }}>
        <p className="small">Racha actual</p>
        <h3 style={{ marginTop: 6 }}>5 días seguidos</h3>
        <p className="small" style={{ marginTop: 6 }}>Puntos: 120</p>
      </section>
    </main>
  );
}
