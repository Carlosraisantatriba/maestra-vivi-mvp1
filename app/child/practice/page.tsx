"use client";

import { useEffect, useState } from "react";
import { TopNav } from "@/components/top-nav";
import { EmptyState } from "@/components/empty-state";
import { LibraryPicker } from "@/components/library/library-picker";

type PracticeQuestion = {
  question: string;
  expected_answer: string;
  hint: string;
};

const childItems = [
  { href: "/child/home", label: "Inicio" },
  { href: "/child/task", label: "Tarea" },
  { href: "/child/practice", label: "Práctica" },
  { href: "/child/reading", label: "Lectura" },
  { href: "/child/dictation", label: "Dictado" }
];

export default function PracticePage() {
  const [tab, setTab] = useState<"adaptive" | "school">("adaptive");
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);

  useEffect(() => {
    const run = async () => {
      const adaptive = await fetch("/api/tutor/practice/start", { method: "POST" }).then((r) => r.json());
      setQuestions(adaptive.practice || []);
    };
    void run();
  }, []);

  return (
    <main>
      <TopNav items={childItems} />
      <h1 className="page-title">Práctica</h1>
      <div className="row" style={{ marginBottom: 14 }}>
        <button className={`btn ${tab === "adaptive" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab("adaptive")}>
          Adaptativa
        </button>
        <button className={`btn ${tab === "school" ? "btn-primary" : "btn-secondary"}`} onClick={() => setTab("school")}>
          Del colegio
        </button>
      </div>

      {tab === "adaptive" ? (
        <section className="grid">
          {questions.map((item, i) => (
            <article className="card" key={`${item.question}-${i}`}>
              <h3>{item.question}</h3>
              <p className="small" style={{ marginTop: 8 }}>
                Pista: {item.hint}
              </p>
            </article>
          ))}
          {questions.length === 0 ? (
            <EmptyState title="Sin preguntas por ahora" body="Cuando arranque una sesión, acá vas a ver la práctica adaptativa." />
          ) : null}
        </section>
      ) : (
        <section className="grid">
          <LibraryPicker defaultType="practica" title="Biblioteca del colegio (Práctica)" />
          <article className="card-soft">
            <h3>Dictado semanal</h3>
            <p className="small" style={{ marginTop: 8 }}>
              Disponible en la pestaña Dictado para practicar con cuaderno + foto.
            </p>
          </article>
        </section>
      )}
    </main>
  );
}
