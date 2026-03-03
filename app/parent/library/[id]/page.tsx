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
  id: string;
  title: string;
  subject: string;
  week_number: number;
  type: string;
  ingestion_status: string;
  file_type: string;
  preview_url: string | null;
  extracted_text: string | null;
  skills: SkillRow[];
  use_in_task_url: string;
};

export default function LibraryItemPage({ params }: { params: { id: string } }) {
  const [item, setItem] = useState<Item | null>(null);

  useEffect(() => {
    void fetch(`/api/library/item/${params.id}`)
      .then((r) => r.json())
      .then((data) => setItem(data.item ?? null));
  }, [params.id]);

  const isPdf = item?.file_type === "application/pdf";
  const isImage = item?.file_type.startsWith("image/");
  const isDocx = item?.file_type.includes("wordprocessingml.document");

  return (
    <main>
      <TopNav items={parentItems} />
      <h1 className="page-title">Detalle de material</h1>
      <section className="card">
        <h2>{item?.title ?? "Cargando..."}</h2>
        <p className="small" style={{ marginTop: 8 }}>
          Materia: {item?.subject ?? "-"} · Semana: {item?.week_number ?? "-"} · Tipo: {item?.type ?? "-"}
        </p>
        <p className="small" style={{ marginTop: 8 }}>
          Estado de ingesta: {item?.ingestion_status ?? "-"}
        </p>

        <section className="card-soft" style={{ marginTop: 14 }}>
          <h3>Vista previa</h3>
          {isPdf && item?.preview_url ? (
            <iframe title="preview-pdf" src={item.preview_url} style={{ width: "100%", height: 420, marginTop: 10 }} />
          ) : null}
          {isImage && item?.preview_url ? (
            <img src={item.preview_url} alt={item.title} style={{ width: "100%", maxHeight: 420, objectFit: "contain", marginTop: 10 }} />
          ) : null}
          {isDocx ? (
            <div style={{ marginTop: 10 }}>
              {item?.extracted_text ? (
                <p className="small" style={{ whiteSpace: "pre-wrap" }}>
                  {item.extracted_text}
                </p>
              ) : (
                <p className="small">Vista previa no disponible.</p>
              )}
            </div>
          ) : null}
          {!isPdf && !isImage && !isDocx ? <p className="small" style={{ marginTop: 10 }}>Vista previa no disponible.</p> : null}
        </section>

        <p style={{ marginTop: 12 }}>Skills sugeridas</p>
        <div className="row" style={{ marginTop: 8 }}>
          {(item?.skills ?? []).map((skill) => (
            <span className="pill" key={skill.code}>
              {skill.code} ({Math.round(skill.confidence * 100)}%)
            </span>
          ))}
        </div>

        <a
          className="btn btn-primary"
          style={{ marginTop: 14, display: "inline-block" }}
          href={item?.use_in_task_url || "/child/task"}
        >
          Usar en Tarea
        </a>
      </section>
    </main>
  );
}
