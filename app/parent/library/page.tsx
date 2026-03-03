"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TopNav } from "@/components/top-nav";
import type { LibraryListItem, LibraryTypeValue, SubjectValue } from "@/lib/library/types";
import { LIBRARY_TYPE_OPTIONS, SUBJECT_OPTIONS } from "@/lib/library/types";

const parentItems = [
  { href: "/parent/home", label: "Inicio" },
  { href: "/parent/library", label: "Biblioteca" },
  { href: "/parent/reports", label: "Reportes" }
];

function formatDate(value: string): string {
  try {
    return new Intl.DateTimeFormat("es-AR", { dateStyle: "medium" }).format(new Date(value));
  } catch {
    return value;
  }
}

export default function ParentLibraryPage() {
  const [subject, setSubject] = useState<"" | SubjectValue>("");
  const [weekNumber, setWeekNumber] = useState<number | "">("");
  const [type, setType] = useState<"" | LibraryTypeValue>("");
  const [items, setItems] = useState<LibraryListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const weekOptions = useMemo(() => Array.from({ length: 40 }, (_, i) => i + 1), []);

  const load = useCallback(async () => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (subject) qs.set("subject", subject);
    if (weekNumber) qs.set("week_number", String(weekNumber));
    if (type) qs.set("type", type);

    const response = await fetch(`/api/library/list?${qs.toString()}`);
    const data = await response.json();
    setItems(data.items ?? []);
    setLoading(false);
  }, [subject, weekNumber, type]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <main>
      <TopNav items={parentItems} />
      <h1 className="page-title">Biblioteca del colegio</h1>
      <section className="card">
        <div className="row">
          <div className="field">
            <label htmlFor="subject">Materia</label>
            <select id="subject" value={subject} onChange={(e) => setSubject(e.target.value as "" | SubjectValue)}>
              <option value="">Todas</option>
              {SUBJECT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="week">Semana</label>
            <select id="week" value={weekNumber} onChange={(e) => setWeekNumber(e.target.value ? Number(e.target.value) : "") }>
              <option value="">Todas</option>
              {weekOptions.map((week) => (
                <option key={week} value={week}>
                  Semana {week}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="type">Tipo</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value as "" | LibraryTypeValue)}>
              <option value="">Todos</option>
              {LIBRARY_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btn-secondary" onClick={load} disabled={loading}>
            {loading ? "Filtrando..." : "Aplicar filtros"}
          </button>
          <Link className="btn btn-primary" href="/parent/library/upload">
            Subir material
          </Link>
        </div>
      </section>

      <section className="grid" style={{ marginTop: 14 }}>
        {items.map((item) => (
          <Link className="card" key={item.id} href={`/parent/library/${item.id}`}>
            <span className="pill">Semana {item.week_number}</span>
            <h3 style={{ marginTop: 8 }}>{item.title}</h3>
            <p className="small" style={{ marginTop: 6 }}>
              {item.subject} · {item.type}
            </p>
            <p className="small" style={{ marginTop: 6 }}>
              {formatDate(item.created_at)} · ingest: {item.ingestion_status}
            </p>
          </Link>
        ))}

        {!loading && items.length === 0 ? (
          <article className="card-soft">
            <h3>Tu biblioteca está vacía</h3>
            <p className="small" style={{ marginTop: 8 }}>
              Subí materiales por materia, semana y tipo para que luego el niño los use en Tarea, Lectura y Práctica.
            </p>
            <Link className="btn btn-primary" href="/parent/library/upload" style={{ marginTop: 12, display: "inline-block" }}>
              Subir material
            </Link>
          </article>
        ) : null}
      </section>
    </main>
  );
}
