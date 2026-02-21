"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { TopNav } from "@/components/top-nav";

type Item = {
  id: string;
  title: string;
  subject: string;
  week_label: string;
  ingestion_status: string;
};

const parentItems = [
  { href: "/parent/home", label: "Inicio" },
  { href: "/parent/library", label: "Biblioteca" },
  { href: "/parent/reports", label: "Reportes" }
];

export default function ParentLibraryPage() {
  const [subject, setSubject] = useState("");
  const [week, setWeek] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [dictationText, setDictationText] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    const query = new URLSearchParams();
    if (subject) query.set("subject", subject);
    if (week) query.set("week", week);
    const data = await fetch(`/api/library/list?${query}`).then((r) => r.json());
    setItems(data.items || []);
  };

  useEffect(() => {
    void load();
  }, []);

  const onUpload = async () => {
    if (!file || !title) return;
    setLoading(true);
    const form = new FormData();
    form.set("file", file);
    form.set("title", title);
    form.set("subject", (subject || "language") as string);
    form.set("week_label", week || "Semana 1");
    const res = await fetch("/api/library/upload", { method: "POST", body: form });
    const payload = await res.json();
    if (payload.id) {
      await fetch("/api/library/ingest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ library_item_id: payload.id })
      });
    }
    setFile(null);
    setTitle("");
    await load();
    setLoading(false);
  };

  const onCreateDictation = async () => {
    if (!dictationText.trim()) return;
    setLoading(true);
    const form = new FormData();
    form.set("title", title || "Dictado semanal");
    form.set("subject", (subject || "language") as string);
    form.set("week_label", week || "Semana 1");
    form.set("text_content", dictationText);
    const res = await fetch("/api/library/upload", { method: "POST", body: form });
    const payload = await res.json();
    if (payload.id) {
      await fetch("/api/library/ingest", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ library_item_id: payload.id })
      });
    }
    setDictationText("");
    await load();
    setLoading(false);
  };

  return (
    <main>
      <TopNav items={parentItems} />
      <h1 className="page-title">Biblioteca del colegio</h1>
      <section className="card">
        <div className="row">
          <div className="field">
            <label htmlFor="title">Título</label>
            <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="subject">Materia</label>
            <select id="subject" value={subject} onChange={(e) => setSubject(e.target.value)}>
              <option value="">Todas</option>
              <option value="math">Matemática</option>
              <option value="language">Lengua</option>
              <option value="english">Inglés</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="week">Semana</label>
            <input id="week" value={week} onChange={(e) => setWeek(e.target.value)} placeholder="Semana 1" />
          </div>
        </div>
        <div className="field" style={{ marginTop: 10 }}>
          <label htmlFor="file">Archivo</label>
          <input id="file" type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btn-primary" onClick={onUpload} disabled={loading}>
            {loading ? "Subiendo..." : "Subir material"}
          </button>
          <button className="btn btn-secondary" onClick={load}>
            Aplicar filtros
          </button>
        </div>
      </section>
      <section className="card" style={{ marginTop: 14 }}>
        <h3>Dictado semanal (crear por texto)</h3>
        <div className="field" style={{ marginTop: 10 }}>
          <label htmlFor="dictation">Texto del dictado</label>
          <textarea
            id="dictation"
            rows={5}
            value={dictationText}
            onChange={(e) => setDictationText(e.target.value)}
            placeholder="Pegá el dictado para que el niño lo practique."
          />
        </div>
        <button className="btn btn-primary" style={{ marginTop: 12 }} onClick={onCreateDictation} disabled={loading}>
          Crear dictado
        </button>
      </section>

      <section className="grid" style={{ marginTop: 14 }}>
        {items.map((item) => (
          <Link className="card" key={item.id} href={`/parent/library/${item.id}`}>
            <span className="pill">{item.week_label}</span>
            <h3 style={{ marginTop: 8 }}>{item.title}</h3>
            <p className="small" style={{ marginTop: 6 }}>
              {item.subject} · ingest: {item.ingestion_status}
            </p>
          </Link>
        ))}
      </section>
    </main>
  );
}
