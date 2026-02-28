"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";

export default function SignInPage() {
  const [role, setRole] = useState<"parent" | "child">("parent");
  const router = useRouter();

  const handleContinue = () => {
    document.cookie = `app_role=${role}; path=/; max-age=1209600`;
    const next = new URLSearchParams(window.location.search).get("next");
    const fallback: Route = role === "parent" ? "/parent/home" : "/child/home";
    if (next?.startsWith("/")) {
      router.push(next as Route);
      return;
    }
    router.push(fallback);
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
