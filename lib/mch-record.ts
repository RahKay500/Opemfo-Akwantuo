// Shared shapes + labels for the Ghana MCH Record Book's first-visit intake
// (Obstetric History, Investigations, Medical/Social/Family History,
// Physical Examination) — used by both the registration and edit-patient
// forms so the two stay in sync, and by the API routes that persist them.

export interface MedicalHistoryState {
  hypertension: boolean;
  heartDisease: boolean;
  sickleCellDisease: boolean;
  diabetes: boolean;
  epilepsy: boolean;
  hivInfection: boolean;
  asthma: boolean;
  respiratoryDisease: boolean;
  tb: boolean;
  mentalIllness: boolean;
  allergiesDrugFood: boolean;
  allergiesDrugFoodDetail: string;
  medicationHistory: boolean;
  medicationHistoryDetail: string;
  previousSurgery: string;
  other: string;
}

export const EMPTY_MEDICAL_HISTORY: MedicalHistoryState = {
  hypertension: false,
  heartDisease: false,
  sickleCellDisease: false,
  diabetes: false,
  epilepsy: false,
  hivInfection: false,
  asthma: false,
  respiratoryDisease: false,
  tb: false,
  mentalIllness: false,
  allergiesDrugFood: false,
  allergiesDrugFoodDetail: "",
  medicationHistory: false,
  medicationHistoryDetail: "",
  previousSurgery: "",
  other: "",
};

type MedicalHistoryBooleanKey =
  | "hypertension"
  | "heartDisease"
  | "sickleCellDisease"
  | "diabetes"
  | "epilepsy"
  | "hivInfection"
  | "asthma"
  | "respiratoryDisease"
  | "tb"
  | "mentalIllness";

export const MEDICAL_HISTORY_ITEMS: { key: MedicalHistoryBooleanKey; label: string }[] = [
  { key: "hypertension", label: "Hypertension" },
  { key: "heartDisease", label: "Heart disease" },
  { key: "sickleCellDisease", label: "Sickle cell disease" },
  { key: "diabetes", label: "Diabetes" },
  { key: "epilepsy", label: "Epilepsy" },
  { key: "hivInfection", label: "HIV infection" },
  { key: "asthma", label: "Asthma" },
  { key: "respiratoryDisease", label: "Respiratory disease" },
  { key: "tb", label: "TB" },
  { key: "mentalIllness", label: "Mental illness" },
];

export interface SocialHistoryState {
  alcohol: boolean;
  alcoholDetail: string;
  smoking: boolean;
  smokingDetail: string;
}

export const EMPTY_SOCIAL_HISTORY: SocialHistoryState = {
  alcohol: false,
  alcoholDetail: "",
  smoking: false,
  smokingDetail: "",
};

export interface FamilyHistoryState {
  hypertension: boolean;
  heartDisease: boolean;
  sickleCellDisease: boolean;
  diabetes: boolean;
  multiplePregnancies: boolean;
  birthDefects: boolean;
  mentalHealthDisorder: boolean;
  other: string;
}

export const EMPTY_FAMILY_HISTORY: FamilyHistoryState = {
  hypertension: false,
  heartDisease: false,
  sickleCellDisease: false,
  diabetes: false,
  multiplePregnancies: false,
  birthDefects: false,
  mentalHealthDisorder: false,
  other: "",
};

type FamilyHistoryBooleanKey =
  | "hypertension"
  | "heartDisease"
  | "sickleCellDisease"
  | "diabetes"
  | "multiplePregnancies"
  | "birthDefects"
  | "mentalHealthDisorder";

export const FAMILY_HISTORY_ITEMS: { key: FamilyHistoryBooleanKey; label: string }[] = [
  { key: "hypertension", label: "Hypertension" },
  { key: "heartDisease", label: "Heart disease" },
  { key: "sickleCellDisease", label: "Sickle cell disease" },
  { key: "diabetes", label: "Diabetes" },
  { key: "multiplePregnancies", label: "Multiple pregnancies" },
  { key: "birthDefects", label: "Birth defects" },
  { key: "mentalHealthDisorder", label: "Mental health disorder" },
];

export interface ExamArea {
  normal: boolean;
  note: string;
}

export interface PhysicalExamState {
  generalCondition: ExamArea;
  face: ExamArea;
  headNeck: ExamArea;
  breasts: ExamArea;
  abdomen: ExamArea;
  heart: ExamArea;
  lung: ExamArea;
  other: ExamArea;
}

const EMPTY_EXAM_AREA: ExamArea = { normal: true, note: "" };

export const EMPTY_PHYSICAL_EXAM: PhysicalExamState = {
  generalCondition: { ...EMPTY_EXAM_AREA },
  face: { ...EMPTY_EXAM_AREA },
  headNeck: { ...EMPTY_EXAM_AREA },
  breasts: { ...EMPTY_EXAM_AREA },
  abdomen: { ...EMPTY_EXAM_AREA },
  heart: { ...EMPTY_EXAM_AREA },
  lung: { ...EMPTY_EXAM_AREA },
  other: { ...EMPTY_EXAM_AREA },
};

export const PHYSICAL_EXAM_AREAS: { key: keyof PhysicalExamState & string; label: string }[] = [
  { key: "generalCondition", label: "General condition" },
  { key: "face", label: "Face" },
  { key: "headNeck", label: "Head & Neck" },
  { key: "breasts", label: "Breasts" },
  { key: "abdomen", label: "Abdomen" },
  { key: "heart", label: "Heart" },
  { key: "lung", label: "Lung" },
  { key: "other", label: "Other" },
];

export const MAJOR_RISK_FACTORS = [
  "Previous CS",
  "Grand multiparity",
  "Previous PPH",
  "Previous PIH",
  "Myomectomy",
  "Sickle cell disease (SS)",
  "Sickle cell disease (SC)",
  "Sickle cell disease (CC)",
];

export interface PreviousPregnancy {
  dateOfDeliveryOrLoss: string;
  placeOfBirth: string;
  problemsDuringPregnancy: string;
  gestationalAgeAtBirth: string;
  modeOfDelivery: string;
  outcome: string;
  complications: string;
  childSex: string;
  birthWeightKg: string;
  childPresentHealth: string;
}

export const EMPTY_PREVIOUS_PREGNANCY: PreviousPregnancy = {
  dateOfDeliveryOrLoss: "",
  placeOfBirth: "",
  problemsDuringPregnancy: "",
  gestationalAgeAtBirth: "",
  modeOfDelivery: "",
  outcome: "",
  complications: "",
  childSex: "",
  birthWeightKg: "",
  childPresentHealth: "",
};

export const PLACE_OF_BIRTH_OPTIONS = ["Hospital", "Health Centre", "CHPS", "Home", "Other"];
export const MODE_OF_DELIVERY_OPTIONS = ["SVD", "AVD", "CS"];
export const DELIVERY_OUTCOME_OPTIONS = ["Live Birth", "Still Birth", "Miscarriage"];
export const CHILD_HEALTH_OPTIONS = ["Good", "Poor", "Died"];

export const POSITIVE_NEGATIVE_OPTIONS = ["Negative", "Positive"];
export const G6PD_OPTIONS = ["No Defect", "Full Defect", "Partial Defect"];
export const SICKLING_OPTIONS = ["Negative", "Positive (AS)", "Positive (SS)", "Positive (SC)", "Positive (AC)", "Positive (Other)"];
