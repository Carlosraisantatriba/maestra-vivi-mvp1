"use client";

import { useEffect, useState } from "react";
import { TopNav } from "@/components/top-nav";

type ReportData = {
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

export default function ParentReportsPage() {
  const [report, setReport] = useState<ReportData | null>(null);

  useEffect(() => {
    void fetch("/api/reports/parent/overview?child_id=demo-child")
      .then((r) => r.json())
      .then(setReport);
  }, []);

  return (
    <main>
      <TopNav items={parentItems} />
      <h1 className="page-title">Reportes</h1>
      <section className="card">
        <h3>Resumen semanal</h3>
        {!report ? (
          <div className="skeleton" style={{ marginTop: 10 }} />
        ) : (
          <>
            <p className="small" style={{ marginTop: 8 }}>
              Sesiones: {report.overview.total_sessions} · Tiempo: {report.overview.total_time_minutes} min
            </p>
            <div className="row" style={{ marginTop: 10 }}>
              {Object.entries(report.overview.accuracy_by_subject).map(([subject, value]) => (
                <div className="card-soft" key={subject}>
                  <p className="small">{subject}</p>
                  <h3>{value}%</h3>
                </div>
              ))}
            </div>
            <h3 style={{ marginTop: 14 }}>Skills débiles</h3>
            {report.weak_skills.map((skill) => (
              <p className="small" key={skill.code}>
                {skill.name} ({skill.code}): {skill.score}
              </p>
            ))}
            <div className="card-soft" style={{ marginTop: 12 }}>
              <h3>Recomendación</h3>
              <p className="small" style={{ marginTop: 8 }}>
                {report.recommendation}
              </p>
            </div>
          </>
        )}
      </section>
    </main>
  );
}
