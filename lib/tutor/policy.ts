import type { TutorResponse } from "@/lib/tutor/schema";

export function sanitizeIncorrectTutorResponse(tutor: TutorResponse): TutorResponse {
  if (tutor.status.type !== "incorrect") {
    return tutor;
  }

  return {
    ...tutor,
    child_message: tutor.child_message.replace(
      /la respuesta correcta es[^.]*\./gi,
      "Probá de nuevo con la pista que te di."
    )
  };
}
