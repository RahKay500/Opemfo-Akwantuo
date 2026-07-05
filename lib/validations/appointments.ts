import { z } from "zod";

export const appointmentRequestSchema = z.object({
  requestType: z.enum(["ROUTINE", "GYNAECOLOGIST"]),
  preferredDate: z.string().min(1, "Choose a preferred date"),
  preferredTime: z.string().optional(),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export type AppointmentRequestInput = z.infer<typeof appointmentRequestSchema>;
