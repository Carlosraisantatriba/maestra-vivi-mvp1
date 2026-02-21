"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignInPage() {
  const [role, setRole] = useState<"parent" | "child">("parent");
  const router = useRouter();
  const params = useSearchParams();

  const handleContinue = () => {
    document.cookie = `app_role=${role}; path=/; max-age=1209600`;
    const next = params.get("next");
    router.push(next || (role === "parent" ? "/parent/home" : "/child/home"));
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
