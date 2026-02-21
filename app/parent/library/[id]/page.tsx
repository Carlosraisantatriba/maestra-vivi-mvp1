"use client";

import { useEffect, useState } from "react";
import { TopNav } from "@/components/top-nav";

const parentItems = [
  { href: "/parent/home", label: "Inicio" },
  { href: "/parent/library", label: "Biblioteca" },
  { href: "/parent/reports", label: "Reportes" }
];

type SkillRow = { code: string; confidence: number };
type Item = {
  title: string;
  subject: string;
  week_label: string;
  ingestion_status: string;
  skills: SkillRow[];
};

export default function LibraryItemPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    void fetch(`/api/library/item/${params.id}`)
      .then((r) => r.json())
      .then((data) => setItem(data.item ?? null));
  }, [params.id]);

  return (
    <main>
      <TopNav items={parentItems} />
      <h1 className="page-title">Detalle de material</h1>
      <section className="card">
        <h2>{item?.title ?? "Cargando..."}</h2>
        <p className="small" style={{ marginTop: 8 }}>
          Materia: {item?.subject ?? "-"} · Semana: {item?.week_label ?? "-"}
        </p>
        <p className="small" style={{ marginTop: 8 }}>
          Estado de ingesta: {item?.ingestion_status ?? "-"}
        </p>
        <p style={{ marginTop: 12 }}>Skills sugeridas</p>
        <div className="row" style={{ marginTop: 8 }}>
          {(item?.skills ?? []).map((skill) => (
            <span className="pill" key={skill.code}>
              {skill.code} ({Math.round(skill.confidence * 100)}%)
            </span>
          ))}
        </div>
        <button className="btn btn-primary" style={{ marginTop: 14 }}>
          Usar en...
        </button>
      </section>
    </main>
  );
}
