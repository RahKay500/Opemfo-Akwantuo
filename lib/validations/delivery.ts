import { z } from "zod";

export const deliveryRecordSchema = z.object({
  weeksOfPregnancy: z.number().int().optional(),
  dateOfDelivery: z.string().optional(),
  timeOfDelivery: z.string().optional(),
  timeOfPlacentaDelivery: z.string().optional(),
  durationOfLabourHours: z.number().int().optional(),
  durationOfLabourMinutes: z.number().int().optional(),
  typeOfDelivery: z.string().optional(),
  indicationForVacuumOrCs: z.string().optional(),
  anesthesia: z.string().optional(),
  estimatedBloodLossMl: z.number().int().optional(),
  bloodTransfusion: z.boolean().optional(),
  statePlacentaMembranes: z.string().optional(),
  manualRemovalOfPlacenta: z.boolean().optional(),
  statePerineum: z.string().optional(),
  labourDeliveryComplications: z.string().optional(),
  birthAttendant: z.string().optional(),
  placeOfDelivery: z.string().optional(),
  breastfedWithin30Min: z.boolean().optional(),
  skinToSkinContact: z.boolean().optional(),
  babySex: z.string().optional(),
  babyBirthWeightKg: z.number().optional(),
  babyCondition: z.string().optional(),
});

export type DeliveryRecordInput = z.infer<typeof deliveryRecordSchema>;
