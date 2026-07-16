import { z } from "zod";

export const updateReferralShareSchema = z.object({
  doctorNotes: z.string().optional(),
  markReviewed: z.boolean().optional(),
});

export type UpdateReferralShareInput = z.infer<typeof updateReferralShareSchema>;

export const forwardReferralShareSchema = z.object({
  doctorId: z.string().min(1),
  reason: z.string().optional(),
});

export type ForwardReferralShareInput = z.infer<typeof forwardReferralShareSchema>;
