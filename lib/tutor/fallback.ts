import type { TutorResponse } from "@/lib/tutor/schema";

export function buildFallbackTutorResponse(participants: "child" | "parent" | "both"): TutorResponse {
  return {
    addressee: participants,
    child_message: "Vamos paso a paso. ¿Me compartís mejor el enunciado o una foto más clara?",
    parent_note:
      participants === "both"
        ? {
            title: "Tip para acompañar",
            body: "Podés leer la consigna en voz alta y pedirle que marque qué parte no entiende.",
            collapsed: true
          }
        : null,
    status: { type: "unclear", confidence: 0.45 },
    next_question: "¿Querés intentar con otra foto o escribir el enunciado?",
    steps: [
      { title: "Releer consigna", prompt: "Leé la consigna completa y buscá los datos importantes." }
    ],
    practice: [],
    skills: [],
    safety: { needs_handoff: false, reason: "" }
  };
}
