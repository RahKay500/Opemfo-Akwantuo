import { z } from "zod";

// Either conversationId (an existing thread) or patientId+staffRole (a
// mother's first message to her midwife/a doctor, where no Conversation row
// exists yet — the route creates it) must be present.
export const sendMessageSchema = z
  .object({
    conversationId: z.string().optional(),
    patientId: z.string().optional(),
    staffRole: z.enum(["MIDWIFE", "DOCTOR"]).optional(),
    staffId: z.string().optional(),
    body: z.string().trim().min(1, "Enter a message").max(2000, "Message is too long"),
  })
  .refine((data) => data.conversationId || (data.patientId && data.staffRole), {
    message: "Missing conversation target",
    path: ["conversationId"],
  });

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
