"use client";

import { useState } from "react";
import type { Route } from "next";

export default function SignInPage() {
  const [role, setRole] = useState<"parent" | "child">("parent");

  const handleContinue = () => {
    document.cookie = `app_role=${role}; path=/; max-age=1209600`;
    const next = new URLSearchParams(window.location.search).get("next");
    const fallback: Route = role === "parent" ? "/parent/home" : "/child/home";
    const target = next?.startsWith("/") ? (next as Route) : fallback;
    window.location.assign(target);
  };

  return (
    <main>
      <h1 className="page-title">Ingresar</h1>
      <section className="card" style={{ maxWidth: 520 }}>
        <div className="field">
          <label htmlFor="role">Perfil</label>
          <select id="role" value={role} onChange={(e) => setRole(e.target.value as "parent" | "child")}>
            <option value="parent">Padre/Madre</option>
            <option value="child">Niño/a</option>
          </select>
        </div>
        <button className="big-btn big-btn-primary" style={{ marginTop: 14 }} onClick={handleContinue}>
          Continuar
        </button>
      </section>
    </main>
  );
}
