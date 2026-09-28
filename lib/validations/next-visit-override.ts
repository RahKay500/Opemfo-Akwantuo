import { z } from "zod";

// nextVisitDate: null clears an existing override, reverting to the
// midwife's own recorded date.
export const setNextVisitOverrideSchema = z.object({
  nextVisitDate: z.string().nullable(),
});

export type SetNextVisitOverrideInput = z.infer<typeof setNextVisitOverrideSchema>;
