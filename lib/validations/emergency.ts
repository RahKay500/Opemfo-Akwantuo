import { z } from "zod";

export const resolveEmergencyAlertSchema = z.object({
  notes: z.string().optional(),
});

export type ResolveEmergencyAlertInput = z.infer<typeof resolveEmergencyAlertSchema>;
