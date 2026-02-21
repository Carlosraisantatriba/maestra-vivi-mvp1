import { env } from "@/lib/env";

type RouteInput = {
  hasImage: boolean;
  consecutiveFailures: number;
  confidence?: number;
};

export function selectTutorModel(input: RouteInput): string {
  if (input.hasImage || input.consecutiveFailures >= 2 || (input.confidence ?? 1) < 0.6) {
    return env.tutorModelHard;
  }
  return env.tutorModel;
}
