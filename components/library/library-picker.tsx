"use client";

import { useEffect, useMemo, useState } from "react";
import type { LibraryListItem, LibraryTypeValue, SubjectValue } from "@/lib/library/types";
import { LIBRARY_TYPE_OPTIONS, SUBJECT_OPTIONS } from "@/lib/library/types";

type Props = {
  defaultType?: LibraryTypeValue;
  title?: string;
  onSelect?: (item: LibraryListItem) => void;
};

export function LibraryPicker({ defaultType, title = "Elegir material de Biblioteca", onSelect }: Props) {
  const [subject, setSubject] = useState<"" | SubjectValue>("");
  const [weekNumber, setWeekNumber] = useState<number | "">("");
  const [type, setType] = useState<"" | LibraryTypeValue>(defaultType ?? "");
  const [items, setItems] = useState<LibraryListItem[]>([]);
  const [loading, setLoading] = useState(false);

  const weekOptions = useMemo(() => Array.from({ length: 40 }, (_, i) => i + 1), []);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const qs = new URLSearchParams();
      if (subject) qs.set("subject", subject);
      if (weekNumber) qs.set("week_number", String(weekNumber));
      if (type) qs.set("type", type);

      const response = await fetch(`/api/library/list?${qs.toString()}`);
      const data = await response.json();
      setItems(data.items ?? []);
      setLoading(false);
    };

    void run();
  }, [subject, weekNumber, type]);

  return (
    <section className="card-soft">
      <h3>{title}</h3>
      <div className="row" style={{ marginTop: 10 }}>
        <div className="field">
          <label htmlFor="library-subject">Materia</label>
          <select id="library-subject" value={subject} onChange={(e) => setSubject(e.target.value as "" | SubjectValue)}>
            <option value="">Todas</option>
            {SUBJECT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="library-week">Semana</label>
          <select
            id="library-week"
            value={weekNumber}
            onChange={(e) => setWeekNumber(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Todas</option>
            {weekOptions.map((week) => (
              <option key={week} value={week}>
                Semana {week}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="library-type">Tipo</label>
          <select id="library-type" value={type} onChange={(e) => setType(e.target.value as "" | LibraryTypeValue)}>
            <option value="">Todos</option>
            {LIBRARY_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid" style={{ marginTop: 12 }}>
        {items.map((item) => (
          <article className="card" key={item.id}>
            <span className="pill">Semana {item.week_number}</span>
            <h3 style={{ marginTop: 8 }}>{item.title}</h3>
            <p className="small" style={{ marginTop: 6 }}>
              {item.subject} · {item.type}
            </p>
            {onSelect ? (
              <button className="btn btn-primary" style={{ marginTop: 10 }} onClick={() => onSelect(item)}>
                Usar este material
              </button>
            ) : null}
          </article>
        ))}

        {!loading && items.length === 0 ? (
          <article className="card-soft">
            <h3>Sin materiales disponibles</h3>
            <p className="small" style={{ marginTop: 8 }}>
              No encontramos contenidos para esos filtros. Pedile al adulto que suba material en Biblioteca.
            </p>
          </article>
        ) : null}
      </div>
    </section>
  );
}
