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

export default function ReadingPage() {
  const [text, setText] = useState("");
  const [data, setData] = useState<TutorResponse | null>(null);

  const run = async () => {
    const response = await fetch("/api/tutor/reading/start", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ text, participants: "child" })
    });
    const payload = await response.json();
    setData(payload.tutor ?? null);
  };

  return (
    <main>
      <TopNav items={childItems} />
      <h1 className="page-title">Modo Lectura</h1>
      <div className="grid" style={{ gridTemplateColumns: "1.2fr 1fr" }}>
        <section className="card">
          <div className="field">
            <label htmlFor="text">Texto para trabajar</label>
            <textarea id="text" rows={8} value={text} onChange={(e) => setText(e.target.value)} />
          </div>
          <button className="big-btn big-btn-primary" style={{ marginTop: 14 }} onClick={run}>
            Generar preguntas
          </button>
        </section>
        <TutorCard data={data} />
      </div>
    </main>
  );
}
