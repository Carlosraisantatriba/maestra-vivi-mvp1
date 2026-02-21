import { describe, expect, it } from "vitest";
import fixture from "./fixtures/tutor-response-valid.json";
import { TutorResponseSchema } from "@/lib/tutor/schema";
import { sanitizeIncorrectTutorResponse } from "@/lib/tutor/policy";
import { enforceParticipantRules } from "@/lib/tutor/participants";

describe("Tutor JSON schema", () => {
  it("acepta respuesta válida", () => {
    const parsed = TutorResponseSchema.parse(fixture);
    expect(parsed.status.type).toBe("incorrect");
  });

  it("en incorrecto no deja revelar respuesta final literal", () => {
    const parsed = TutorResponseSchema.parse({
      ...fixture,
      child_message: "La respuesta correcta es 42. Probemos otra vez."
    });

    const safe = sanitizeIncorrectTutorResponse(parsed);
    expect(safe.child_message.toLowerCase()).not.toContain("la respuesta correcta es");
  });

  it("si participants=both fuerza parent_note.collapsed=true", () => {
    const parsed = TutorResponseSchema.parse({
      ...fixture,
      addressee: "both",
      parent_note: {
        title: "Tip para acompañar",
        body: "Leé la consigna en voz alta.",
        collapsed: false
      }
    });

    const finalData = enforceParticipantRules("both", parsed);
    expect(finalData.parent_note?.collapsed).toBe(true);
  });
});
