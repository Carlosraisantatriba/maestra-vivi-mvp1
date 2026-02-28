"use client";

import { useEffect, useMemo, useState } from "react";
import { TopNav } from "@/components/top-nav";
import { StatCard } from "@/components/stat-card";

type OverviewResponse = {
  overview: {
    total_sessions: number;
    total_time_minutes: number;
    accuracy_by_subject: Record<string, number>;
  };
  weak_skills: Array<{ code: string; name: string; score: number }>;
  recommendation: string;
};

const parentItems = [
  { href: "/parent/home", label: "Inicio" },
  { href: "/parent/library", label: "Biblioteca" },
  { href: "/parent/reports", label: "Reportes" }
];

function formatMinutes(totalMinutes: number): string {
  if (totalMinutes < 60) return `${totalMinutes}m`;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m`;
}

export default function ParentHomePage() {
  const [report, setReport] = useState<OverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await fetch("/api/reports/parent/overview?child_id=demo-child", { cache: "no-store" });
        const data = (await res.json()) as OverviewResponse;
        setReport(data);
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, []);

  const avgAccuracy = useMemo(() => {
    if (!report) return 0;
    const values = Object.values(report.overview.accuracy_by_subject);
    if (values.length === 0) return 0;
    return Math.round(values.reduce((acc, value) => acc + value, 0) / values.length);
  }, [report]);

  const bySubject = useMemo(() => {
    if (!report) return "Sin datos";
    return Object.entries(report.overview.accuracy_by_subject)
      .map(([subject, value]) => `${subject} ${value}%`)
      .join(" | ");
  }, [report]);

  return (
    <main>
      <TopNav items={parentItems} />
      <h1 className="page-title">Panel de familia</h1>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
        <StatCard
          title="Tiempo semanal"
          value={loading ? "..." : formatMinutes(report?.overview.total_time_minutes ?? 0)}
          subtitle={loading ? "Cargando" : "Datos reales del uso"}
        />
        <StatCard
          title="Sesiones"
          value={loading ? "..." : String(report?.overview.total_sessions ?? 0)}
          subtitle={loading ? "Cargando" : bySubject}
        />
        <StatCard
          title="Aciertos"
          value={loading ? "..." : `${avgAccuracy}%`}
          subtitle={loading ? "Cargando" : "Promedio total"}
        />
      </div>
      <section className="card" style={{ marginTop: 14 }}>
        <h3>Recomendación de la semana</h3>
        <p className="small" style={{ marginTop: 8 }}>
          {loading ? "Generando recomendación..." : report?.recommendation || "Sin recomendación disponible."}
        </p>
      </section>
    </main>
  );
}
