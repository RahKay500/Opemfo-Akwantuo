import { z } from "zod";
import { personName, localPhoneSchema } from "@/lib/validations/auth";

const previousPregnancySchema = z.object({
  dateOfDeliveryOrLoss: z.string().optional(),
  placeOfBirth: z.string().optional(),
  problemsDuringPregnancy: z.string().optional(),
  gestationalAgeAtBirth: z.string().optional(),
  modeOfDelivery: z.string().optional(),
  outcome: z.string().optional(),
  complications: z.string().optional(),
  childSex: z.string().optional(),
  birthWeightKg: z.string().optional(),
  childPresentHealth: z.string().optional(),
});

const medicalHistorySchema = z.object({
  hypertension: z.boolean(),
  heartDisease: z.boolean(),
  sickleCellDisease: z.boolean(),
  diabetes: z.boolean(),
  epilepsy: z.boolean(),
  hivInfection: z.boolean(),
  asthma: z.boolean(),
  respiratoryDisease: z.boolean(),
  tb: z.boolean(),
  mentalIllness: z.boolean(),
  allergiesDrugFood: z.boolean(),
  allergiesDrugFoodDetail: z.string(),
  medicationHistory: z.boolean(),
  medicationHistoryDetail: z.string(),
  previousSurgery: z.string(),
  other: z.string(),
});

const socialHistorySchema = z.object({
  alcohol: z.boolean(),
  alcoholDetail: z.string(),
  smoking: z.boolean(),
  smokingDetail: z.string(),
});

const familyHistorySchema = z.object({
  hypertension: z.boolean(),
  heartDisease: z.boolean(),
  sickleCellDisease: z.boolean(),
  diabetes: z.boolean(),
  multiplePregnancies: z.boolean(),
  birthDefects: z.boolean(),
  mentalHealthDisorder: z.boolean(),
  other: z.string(),
});

const examAreaSchema = z.object({ normal: z.boolean(), note: z.string() });
const physicalExamSchema = z.object({
  generalCondition: examAreaSchema,
  face: examAreaSchema,
  headNeck: examAreaSchema,
  breasts: examAreaSchema,
  abdomen: examAreaSchema,
  heart: examAreaSchema,
  lung: examAreaSchema,
  other: examAreaSchema,
});

export const createPatientSchema = z.object({
  name: personName,
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phone: localPhoneSchema,
  ghanaCardId: z
    .string()
    .regex(/^GHA-\d{9}-\d$/, "Enter a complete Ghana Card ID")
    .optional()
    .or(z.literal("")),
  lmp: z.string().optional(),
  // Alternative to lmp for mothers with irregular cycles — a scan date +
  // gestational age at that scan, used to back-calculate an effective LMP
  // server-side instead. See app/api/patients/route.ts.
  datingMethod: z.enum(["LMP", "ULTRASOUND"]).optional(),
  scanDate: z.string().optional(),
  gestationalAgeAtScanWeeks: z.number().optional(),
  gestationalAgeAtScanDays: z.number().optional(),
  gravida: z.number().optional(),
  para: z.number().optional(),
  bloodGroup: z.string().optional(),
  knownConditions: z.string().optional(),
  emergencyContactName: personName.optional().or(z.literal("")),
  emergencyContactPhone: z.string().optional(),
  emergencyContactRelation: z.string().optional(),
  // Ghana MCH Record Book — Family Identification (page 3)
  community: z.string().optional(),
  nhisNumber: z.string().optional(),
  maritalStatus: z.string().optional(),
  educationalLevel: z.string().optional(),
  occupation: z.string().optional(),
  spouseName: personName.optional().or(z.literal("")),
  spousePhone: z.string().optional(),
  spouseOccupation: z.string().optional(),
  emergencyTransportPhone: z.string().optional(),
  // Obstetric History
  numberOfAbortionsSpontaneous: z.number().optional(),
  numberOfAbortionsInduced: z.number().optional(),
  majorRiskFactors: z.array(z.string()).optional(),
  previousPregnancies: z.array(previousPregnancySchema).optional(),
  // Investigations
  height: z.number().optional(),
  weightAtAnc1: z.number().optional(),
  bmiAtAnc1: z.number().optional(),
  estimatedDesiredWeightAtEdd: z.string().optional(),
  contraceptionUsed: z.string().optional(),
  rhTyping: z.string().optional(),
  hbsAg: z.string().optional(),
  sickling: z.string().optional(),
  g6pd: z.string().optional(),
  vdrl: z.string().optional(),
  hivStatus: z.string().optional(),
  hbFirstVisit: z.number().optional(),
  urineRE: z.string().optional(),
  stoolRE: z.string().optional(),
  bfForMalaria: z.string().optional(),
  // Medical/Social/Family History + Physical Exam
  medicalHistory: medicalHistorySchema.optional(),
  socialHistory: socialHistorySchema.optional(),
  familyHistory: familyHistorySchema.optional(),
  physicalExamAtFirstVisit: physicalExamSchema.optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;
