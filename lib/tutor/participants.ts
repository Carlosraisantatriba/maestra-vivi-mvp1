import type { TutorResponse } from "@/lib/tutor/schema";

export function enforceParticipantRules(
  participants: "child" | "parent" | "both",
  tutor: TutorResponse
): TutorResponse {
  if (participants !== "both" || !tutor.parent_note) {
    return tutor;
  }

  return {
    ...tutor,
    parent_note: {
      ...tutor.parent_note,
      collapsed: true
    }
  };
}
