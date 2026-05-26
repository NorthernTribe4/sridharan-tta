import { z } from "zod"

export const scoreSchema = z
  .object({
    match_date: z.string().min(1, "Date is required"),
    player1_id: z.string().min(1, "Select player 1"),
    player2_id: z.string().min(1, "Select player 2"),
    best_of: z.union([z.literal(3), z.literal(5), z.literal(7)], {
      error: "Must be 3, 5, or 7",
    }),
    sets: z
      .array(
        z.object({
          player1_score: z.number().int().min(0).max(30),
          player2_score: z.number().int().min(0).max(30),
        })
      )
      .min(1, "Enter at least one set"),
  })
  .superRefine((data, ctx) => {
    if (data.player1_id && data.player2_id && data.player1_id === data.player2_id) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Players must be different",
        path: ["player2_id"],
      })
    }
  })

export type ScoreFormValues = z.infer<typeof scoreSchema>
