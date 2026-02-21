import { z } from "zod";

export const TutorResponseSchema = z.object({
  addressee: z.enum(["child", "parent", "both"]),
  child_message: z.string(),
  parent_note: z
    .object({
      title: z.string(),
      body: z.string(),
      collapsed: z.boolean()
    })
    .nullable(),
  status: z.object({
    type: z.enum(["correct", "incorrect", "needs_procedure", "unclear"]),
    confidence: z.number().min(0).max(1)
  }),
  next_question: z.string(),
  steps: z.array(
    z.object({
      title: z.string(),
      prompt: z.string()
    })
  ),
  practice: z.array(
    z.object({
      question: z.string(),
      expected_answer: z.string(),
      hint: z.string()
    })
  ),
  skills: z.array(
    z.object({
      code: z.string(),
      confidence: z.number().min(0).max(1)
    })
  ),
  safety: z.object({
    needs_handoff: z.boolean(),
    reason: z.string()
  })
});

export type TutorResponse = z.infer<typeof TutorResponseSchema>;
