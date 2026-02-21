import { TopNav } from "@/components/top-nav";
import { StatCard } from "@/components/stat-card";

const parentItems = [
  { href: "/parent/home", label: "Inicio" },
  { href: "/parent/library", label: "Biblioteca" },
  { href: "/parent/reports", label: "Reportes" }
];

export default function ParentHomePage() {
  return (
    <main>
      <TopNav items={parentItems} />
      <h1 className="page-title">Panel de familia</h1>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <StatCard title="Tiempo semanal" value="2h 10m" subtitle="+18% vs semana pasada" />
        <StatCard title="Sesiones" value="7" subtitle="Math 3 | Lengua 3 | Inglés 1" />
        <StatCard title="Aciertos" value="79%" subtitle="Promedio total" />
      </div>
      <section className="card" style={{ marginTop: 14 }}>
        <h3>Recomendación de la semana</h3>
        <p className="small" style={{ marginTop: 8 }}>
          Reforzar ortografía b/v con dictado de 10 minutos y una lectura inferencial breve.
        </p>
      </section>
    </main>
  );
}
