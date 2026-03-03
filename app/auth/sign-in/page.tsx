"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function SignInPage() {
  const router = useRouter();
  const [role, setRole] = useState<"parent" | "child">("parent");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<"none" | "link" | "password">("none");
  const [status, setStatus] = useState<string | null>(null);
  const [errorParam, setErrorParam] = useState<string | null>(null);
  const [nextPath, setNextPath] = useState<string>("/parent/home");

  const redirectPath = useMemo(() => {
    if (nextPath.startsWith("/")) return nextPath;
    return role === "parent" ? "/parent/home" : "/child/home";
  }, [nextPath, role]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const next = params.get("next");
    setErrorParam(error);
    if (next && next.startsWith("/")) setNextPath(next);
  }, []);

  const syncProfile = async () => {
    const sync = await fetch("/api/profile/sync", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ role })
    });
    if (!sync.ok) {
      const payload = await sync.json().catch(() => ({}));
      throw new Error(payload?.message || payload?.error || "No se pudo sincronizar el perfil.");
    }
  };

  const handleMagicLink = async () => {
    if (!email.trim()) {
      setStatus("Ingresá un email válido.");
      return;
    }

    setLoading("link");
    setStatus(null);
    const { error } = await supabaseBrowser.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}&role=${role}`
      }
    });

    if (error) {
      setStatus(`No se pudo enviar el link: ${error.message}`);
      setLoading("none");
      return;
    }

    setStatus("Te enviamos un link por email para ingresar.");
    setLoading("none");
  };

  const handlePassword = async () => {
    if (!email.trim() || !password) {
      setStatus("Completá email y contraseña.");
      return;
    }

    setLoading("password");
    setStatus(null);

    let signInError: string | null = null;
    const signIn = await supabaseBrowser.auth.signInWithPassword({
      email: email.trim(),
      password
    });
    if (signIn.error) {
      signInError = signIn.error.message;
      const signUp = await supabaseBrowser.auth.signUp({
        email: email.trim(),
        password
      });
      if (signUp.error) {
        setStatus(`No se pudo ingresar ni registrar: ${signUp.error.message}`);
        setLoading("none");
        return;
      }
      if (!signUp.data.session) {
        setStatus("Cuenta creada. Revisá tu email para confirmar y luego ingresá.");
        setLoading("none");
        return;
      }
    }

    try {
      await syncProfile();
      document.cookie = `app_role=${role}; path=/; max-age=${60 * 60 * 24 * 14}; samesite=lax`;
      router.push(redirectPath);
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      setStatus(message || signInError || "No se pudo completar el ingreso.");
    } finally {
      setLoading("none");
    }
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

        <div className="field" style={{ marginTop: 10 }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="field" style={{ marginTop: 10 }}>
          <label htmlFor="password">Contraseña (opcional)</label>
          <input
            id="password"
            type="password"
            placeholder="Ingresá tu contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          className="big-btn big-btn-primary"
          style={{ marginTop: 14 }}
          onClick={handleMagicLink}
          disabled={loading !== "none"}
        >
          {loading === "link" ? "Enviando..." : "Enviar link"}
        </button>

        <button
          className="big-btn big-btn-secondary"
          style={{ marginTop: 10 }}
          onClick={handlePassword}
          disabled={loading !== "none"}
        >
          {loading === "password" ? "Procesando..." : "Ingresar con contraseña"}
        </button>

        {errorParam ? (
          <p className="status-bad small" style={{ marginTop: 10 }}>
            Error: {errorParam}
          </p>
        ) : null}
        {status ? (
          <p className="small" style={{ marginTop: 10 }}>
            {status}
          </p>
        ) : null}
      </section>
    </main>
  );
}
