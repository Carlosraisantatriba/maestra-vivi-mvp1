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

export default function DictationPage() {
  const [dictationText, setDictationText] = useState("");
  const [result, setResult] = useState<TutorResponse | null>(null);

  const run = async () => {
    const response = await fetch("/api/tutor/dictation/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text: dictationText, participants: "child" })
    });
    const payload = await response.json();
    setResult(payload.tutor);
  };

  return (
    <main>
      <TopNav items={childItems} />
      <h1 className="page-title">Dictado semanal</h1>
      <div className="grid" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
        <section className="card">
          <p className="small">Modo recomendado: cuaderno + foto del resultado.</p>
          <div className="field" style={{ marginTop: 10 }}>
            <label htmlFor="dictation">Texto de dictado / transcripción</label>
            <textarea id="dictation" rows={8} value={dictationText} onChange={(e) => setDictationText(e.target.value)} />
          </div>
          <button className="big-btn big-btn-primary" style={{ marginTop: 14 }} onClick={run}>
            Corregir dictado
          </button>
        </section>
        <TutorCard data={result} />
      </div>
    </main>
  );
}
