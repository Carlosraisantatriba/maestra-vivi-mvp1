"use client";

import { useEffect, useState } from "react";
import { TopNav } from "@/components/top-nav";
import { TutorCard } from "@/components/tutor-card";
import type { TutorResponse } from "@/lib/tutor/schema";
import type { LibraryListItem } from "@/lib/library/types";
import { LibraryPicker } from "@/components/library/library-picker";

const childItems = [
  { href: "/child/home", label: "Inicio" },
  { href: "/child/task", label: "Tarea" },
  { href: "/child/practice", label: "Práctica" },
  { href: "/child/reading", label: "Lectura" },
  { href: "/child/dictation", label: "Dictado" }
];

export default function ChildTaskPage() {
  const [statement, setStatement] = useState("");
  const [result, setResult] = useState("");
  const [participants, setParticipants] = useState<"child" | "parent" | "both">("child");
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [tutorData, setTutorData] = useState<TutorResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [selectedMaterial, setSelectedMaterial] = useState<LibraryListItem | null>(null);

  useEffect(() => {
    const materialId = new URLSearchParams(window.location.search).get("material_id");
    if (!materialId) return;

    void fetch(`/api/library/item/${materialId}`)
      .then((r) => r.json())
      .then((data) => {
        const item = data?.item;
        if (!item) return;
        setSelectedMaterial({
          id: item.id,
          title: item.title,
          subject: item.subject,
          week_number: item.week_number,
          type: item.type,
          file_type: item.file_type,
          ingestion_status: item.ingestion_status,
          created_at: item.created_at || new Date().toISOString()
        });
        setStatement((prev) => prev || `Material: ${item.title} (Semana ${item.week_number})`);
      });
  }, []);

  const submitAnswer = async () => {
    setLoading(true);
    setErrorText(null);
    const res = await fetch("/api/tutor/task/answer-check", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ statement, answer: result, participants, session_id: sessionId, subject: "math" })
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorText(data?.error || "No pudimos validar la respuesta.");
      setLoading(false);
      return;
    }
    setTutorData(data.tutor);
    if (data.session_id) setSessionId(data.session_id);
    setLoading(false);
  };

  const submitProcedure = async () => {
    setLoading(true);
    setErrorText(null);
    const res = await fetch("/api/tutor/task/procedure-check", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ procedure_text: result, participants, session_id: sessionId, subject: "math" })
    });
    const data = await res.json();
    if (!res.ok) {
      setErrorText(data?.error || "No pudimos revisar el procedimiento.");
      setLoading(false);
      return;
    }
    setTutorData(data.tutor);
    setLoading(false);
  };

  const testTutorMessage = async () => {
    setLoading(true);
    setErrorText(null);
    try {
      const res = await fetch("/api/tutor/message", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          mode: "task",
          participants,
          subject: "math",
          message: `Consigna: ${statement || "2 + 3"} | Respuesta: ${result || "5"}`
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorText(data?.error || "No pudimos conectar con el tutor.");
        return;
      }
      if (!data?.tutor) {
        setErrorText("La API respondió sin contenido de tutora.");
        return;
      }
      setTutorData(data.tutor);
    } catch {
      setErrorText("Error de conexión con la API del tutor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      <TopNav items={childItems} />
      <h1 className="page-title">Modo Tarea</h1>
      <LibraryPicker
        defaultType="tarea"
        title="Biblioteca del colegio (Tarea)"
        onSelect={(item) => {
          setSelectedMaterial(item);
          setStatement((prev) => prev || `Material: ${item.title} (Semana ${item.week_number})`);
        }}
      />
      <div className="grid" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
        <section className="card">
          {selectedMaterial ? (
            <p className="small" style={{ marginBottom: 10 }}>
              Material seleccionado: <strong>{selectedMaterial.title}</strong> · Semana {selectedMaterial.week_number}
            </p>
          ) : null}
          <div className="field">
            <label htmlFor="participants">Quiénes están en la sesión</label>
            <select
              id="participants"
              value={participants}
              onChange={(e) => setParticipants(e.target.value as "child" | "parent" | "both")}
            >
              <option value="child">Solo niño/a</option>
              <option value="parent">Solo adulto</option>
              <option value="both">Ambos</option>
            </select>
          </div>
          <div className="field" style={{ marginTop: 10 }}>
            <label htmlFor="statement">Enunciado</label>
            <textarea
              id="statement"
              rows={4}
              placeholder="Pegá acá la consigna o escribila"
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
            />
          </div>
          <div className="field" style={{ marginTop: 10 }}>
            <label htmlFor="result">Tu resultado</label>
            <input
              id="result"
              placeholder="Escribí el resultado"
              value={result}
              onChange={(e) => setResult(e.target.value)}
            />
          </div>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="big-btn big-btn-primary" onClick={submitAnswer} disabled={loading}>
              {loading ? "Validando..." : "Validar resultado"}
            </button>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <button className="big-btn big-btn-secondary" onClick={submitAnswer} disabled={loading}>
              Intentar de nuevo
            </button>
            <button className="big-btn big-btn-secondary" onClick={submitProcedure} disabled={loading}>
              Subir procedimiento
            </button>
          </div>
          <div className="row" style={{ marginTop: 10 }}>
            <button className="big-btn big-btn-primary" onClick={testTutorMessage} disabled={loading}>
              Probar conexión OpenAI
            </button>
          </div>
          {errorText ? (
            <p className="status-bad small" style={{ marginTop: 10 }}>
              {errorText}
            </p>
          ) : null}
        </section>
        <TutorCard data={tutorData} />
      </div>
    </main>
  );
}
