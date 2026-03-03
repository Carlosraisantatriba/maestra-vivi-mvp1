"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { TopNav } from "@/components/top-nav";
import type { LibraryTypeValue, SubjectValue } from "@/lib/library/types";
import { LIBRARY_TYPE_OPTIONS, SUBJECT_OPTIONS } from "@/lib/library/types";

const parentItems = [
  { href: "/parent/home", label: "Inicio" },
  { href: "/parent/library", label: "Biblioteca" },
  { href: "/parent/reports", label: "Reportes" }
];

const allowedExtensions = [".pdf", ".jpg", ".jpeg", ".png", ".docx"];

export default function ParentLibraryUploadPage() {
  const router = useRouter();

  const [subject, setSubject] = useState<"" | SubjectValue>("");
  const [weekNumber, setWeekNumber] = useState<number | "">("");
  const [type, setType] = useState<"" | LibraryTypeValue>("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const weekOptions = useMemo(() => Array.from({ length: 40 }, (_, i) => i + 1), []);

  const onSubmit = async () => {
    setErrorText(null);

    if (!subject) return setErrorText("Elegí una materia.");
    if (!weekNumber) return setErrorText("Elegí una semana del 1 al 40.");
    if (!type) return setErrorText("Elegí un tipo de material.");
    if (!file) return setErrorText("Adjuntá un archivo PDF, JPG, PNG o DOCX.");

    const fileName = file.name.toLowerCase();
    if (!allowedExtensions.some((ext) => fileName.endsWith(ext))) {
      return setErrorText("Formato no válido. Usá PDF, JPG, PNG o DOCX.");
    }

    setLoading(true);
    const formData = new FormData();
    formData.set("subject", subject);
    formData.set("week_number", String(weekNumber));
    formData.set("type", type);
    formData.set("title", title);
    formData.set("file", file);

    const upload = await fetch("/api/library/upload", { method: "POST", body: formData });
    const payload = await upload.json();

    if (!upload.ok || !payload.id) {
      setErrorText(payload?.message || payload?.error || "No se pudo subir el material.");
      setLoading(false);
      return;
    }

    await fetch("/api/library/ingest", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ library_item_id: payload.id })
    });

    setLoading(false);
    router.push(`/parent/library/${payload.id}`);
  };

  return (
    <main>
      <TopNav items={parentItems} />
      <h1 className="page-title">Subir material</h1>
      <section className="card" style={{ maxWidth: 760 }}>
        <div className="row">
          <div className="field">
            <label htmlFor="subject">Materia *</label>
            <select id="subject" value={subject} onChange={(e) => setSubject(e.target.value as "" | SubjectValue)}>
              <option value="">Seleccionar</option>
              {SUBJECT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="week">Semana *</label>
            <select
              id="week"
              value={weekNumber}
              onChange={(e) => setWeekNumber(e.target.value ? Number(e.target.value) : "")}
            >
              <option value="">Seleccionar</option>
              {weekOptions.map((week) => (
                <option key={week} value={week}>
                  Semana {week}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label htmlFor="type">Tipo *</label>
            <select id="type" value={type} onChange={(e) => setType(e.target.value as "" | LibraryTypeValue)}>
              <option value="">Seleccionar</option>
              {LIBRARY_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field" style={{ marginTop: 10 }}>
          <label htmlFor="title">Título (opcional)</label>
          <input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Guía de fracciones" />
        </div>

        <div className="field" style={{ marginTop: 10 }}>
          <label htmlFor="file">Archivo *</label>
          <input
            id="file"
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.docx,application/pdf,image/jpeg,image/png,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <p className="small">Formatos soportados: PDF, JPG, PNG, DOCX.</p>
        </div>

        {errorText ? (
          <p className="status-bad small" style={{ marginTop: 10 }}>
            {errorText}
          </p>
        ) : null}

        <div className="row" style={{ marginTop: 12 }}>
          <button className="btn btn-primary" onClick={onSubmit} disabled={loading}>
            {loading ? "Subiendo..." : "Subir material"}
          </button>
        </div>
      </section>
    </main>
  );
}
