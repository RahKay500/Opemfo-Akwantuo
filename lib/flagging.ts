import type { Priority } from "@prisma/client";

export const THRESHOLDS = {
  systolic: { critical: 160, high: 140 },
  diastolic: { critical: 110, high: 90 },
  fetalHeartRate: { low: 110, high: 160 },
  temperature: { high: 38 },
};

export interface VitalsInput {
  systolic?: number | null;
  diastolic?: number | null;
  fetalHeartRate?: number | null;
  temperature?: number | null;
}

export interface FlagResult {
  flagged: boolean;
  priority: Priority | null;
  reason: string;
}

export function evaluateVitals(vitals: VitalsInput): FlagResult {
  const criticalReasons: string[] = [];
  const highReasons: string[] = [];

  if (vitals.systolic != null) {
    if (vitals.systolic >= THRESHOLDS.systolic.critical) {
      criticalReasons.push(`Systolic BP ${vitals.systolic} mmHg (critical ≥ ${THRESHOLDS.systolic.critical})`);
    } else if (vitals.systolic >= THRESHOLDS.systolic.high) {
      highReasons.push(`Systolic BP ${vitals.systolic} mmHg (high ≥ ${THRESHOLDS.systolic.high})`);
    }
  }

  if (vitals.diastolic != null) {
    if (vitals.diastolic >= THRESHOLDS.diastolic.critical) {
      criticalReasons.push(`Diastolic BP ${vitals.diastolic} mmHg (critical ≥ ${THRESHOLDS.diastolic.critical})`);
    } else if (vitals.diastolic >= THRESHOLDS.diastolic.high) {
      highReasons.push(`Diastolic BP ${vitals.diastolic} mmHg (high ≥ ${THRESHOLDS.diastolic.high})`);
    }
  }

  if (vitals.fetalHeartRate != null) {
    if (
      vitals.fetalHeartRate < THRESHOLDS.fetalHeartRate.low ||
      vitals.fetalHeartRate > THRESHOLDS.fetalHeartRate.high
    ) {
      highReasons.push(
        `Fetal heart rate ${vitals.fetalHeartRate} bpm (normal range ${THRESHOLDS.fetalHeartRate.low}-${THRESHOLDS.fetalHeartRate.high})`
      );
    }
  }

  if (vitals.temperature != null && vitals.temperature >= THRESHOLDS.temperature.high) {
    highReasons.push(`Temperature ${vitals.temperature}°C (high ≥ ${THRESHOLDS.temperature.high}°C)`);
  }

  if (criticalReasons.length > 0) {
    return { flagged: true, priority: "CRITICAL", reason: criticalReasons.join("; ") };
  }

  if (highReasons.length > 0) {
    return { flagged: true, priority: "HIGH", reason: highReasons.join("; ") };
  }

  return { flagged: false, priority: null, reason: "" };
}
