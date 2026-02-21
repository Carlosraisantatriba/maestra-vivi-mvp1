"use client";

import { useState } from "react";
import { TopNav } from "@/components/top-nav";
import { TutorCard } from "@/components/tutor-card";
import type { TutorResponse } from "@/lib/tutor/schema";

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

  const submitAnswer = async () => {
    setLoading(true);
    const res = await fetch("/api/tutor/task/answer-check", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ statement, answer: result, participants, session_id: sessionId, subject: "math" })
    });
    const data = await res.json();
    setTutorData(data.tutor);
    if (data.session_id) setSessionId(data.session_id);
    setLoading(false);
  };

  const submitProcedure = async () => {
    setLoading(true);
    const res = await fetch("/api/tutor/task/procedure-check", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ procedure_text: result, participants, session_id: sessionId, subject: "math" })
    });
    const data = await res.json();
    setTutorData(data.tutor);
    setLoading(false);
  };

  const testTutorMessage = async () => {
    setLoading(true);
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
    setTutorData(data.tutor ?? null);
    setLoading(false);
  };

  return (
    <main>
      <TopNav items={childItems} />
      <h1 className="page-title">Modo Tarea</h1>
      <div className="grid" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
        <section className="card">
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
        </section>
        <TutorCard data={tutorData} />
      </div>
    </main>
  );
}
