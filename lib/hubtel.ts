const HUBTEL_CLIENT_ID = process.env.HUBTEL_CLIENT_ID;
const HUBTEL_CLIENT_SECRET = process.env.HUBTEL_CLIENT_SECRET;
const HUBTEL_SENDER_ID = process.env.HUBTEL_SENDER_ID ?? "OpemfoAkwan";
const HUBTEL_SMS_URL = "https://sms.hubtel.com/v1/messages/send";

// No Hubtel credentials are provisioned yet — every trigger below logs to the
// console in that case instead of throwing, so auth/referral flows stay testable.
async function sendSms(to: string, content: string): Promise<void> {
  if (!HUBTEL_CLIENT_ID || !HUBTEL_CLIENT_SECRET) {
    console.log(`[DEV SMS] to=${to} :: ${content}`);
    return;
  }

  const params = new URLSearchParams({
    clientid: HUBTEL_CLIENT_ID,
    clientsecret: HUBTEL_CLIENT_SECRET,
    from: HUBTEL_SENDER_ID,
    to,
    content,
  });

  const response = await fetch(`${HUBTEL_SMS_URL}?${params.toString()}`, {
    method: "GET",
  });

  if (!response.ok) {
    console.error(`Hubtel SMS failed (${response.status}) for ${to}`);
  }
}

export async function sendOtpSms(phone: string, otp: string): Promise<void> {
  await sendSms(phone, `Your Ɔpemfoɔ Akwantuo verification code is ${otp}. It expires in 10 minutes.`);
}

export async function sendStaffActivationSms(phone: string, otp: string): Promise<void> {
  await sendSms(
    phone,
    `Welcome to Ɔpemfoɔ Akwantuo. Your activation code is ${otp}. Open the app to set your password.`
  );
}

export async function sendMotherActivationSms(phone: string, otp: string): Promise<void> {
  await sendSms(
    phone,
    `Welcome to Ɔpemfoɔ Akwantuo! Your midwife has registered you. Your activation code is ${otp}. Open the app to set your password.`
  );
}

// True when there's no real SMS provider wired up, so callers can surface the
// OTP directly in the API response instead of it going nowhere. Local dev
// gets this for free. A `next build`/deploy with NODE_ENV=production (true
// for any Vercel deployment, demo or real) requires the explicit
// SHOW_DEV_OTP=true opt-in, so a real production deploy stays safe by
// default even if Hubtel credentials are never configured there.
export function isSmsUnconfigured(): boolean {
  const hasCreds = Boolean(HUBTEL_CLIENT_ID && HUBTEL_CLIENT_SECRET);
  if (hasCreds) return false;
  if (process.env.NODE_ENV !== "production") return true;
  return process.env.SHOW_DEV_OTP === "true";
}

export async function sendReferralCreatedSms(
  hospitalPhone: string,
  emergencyContactPhone: string | null,
  patientName: string
): Promise<void> {
  await sendSms(
    hospitalPhone,
    `New referral incoming for ${patientName}. Check the referral queue on Ɔpemfoɔ Akwantuo.`
  );
  if (emergencyContactPhone) {
    await sendSms(
      emergencyContactPhone,
      `${patientName} is being referred to hospital. You will be updated on their status.`
    );
  }
}

export async function sendReferralAcknowledgedSms(nursePhone: string, patientName: string): Promise<void> {
  await sendSms(nursePhone, `Your referral for ${patientName} has been acknowledged by the receiving facility.`);
}

export async function sendPatientArrivedSms(
  nursePhone: string,
  emergencyContactPhone: string | null,
  patientName: string
): Promise<void> {
  await sendSms(nursePhone, `${patientName} has arrived at the receiving facility.`);
  if (emergencyContactPhone) {
    await sendSms(emergencyContactPhone, `${patientName} has safely arrived at the hospital.`);
  }
}

export async function sendEmergencyTriggeredSms(
  nursePhone: string,
  emergencyContactPhone: string | null,
  patientName: string
): Promise<void> {
  await sendSms(nursePhone, `EMERGENCY: ${patientName} has triggered the emergency alert. Respond immediately.`);
  if (emergencyContactPhone) {
    await sendSms(emergencyContactPhone, `${patientName} has triggered an emergency alert. Their nurse has been notified.`);
  }
}

export async function sendAppointmentConfirmedSms(
  motherPhone: string,
  date: string
): Promise<void> {
  await sendSms(motherPhone, `Your appointment on ${date} has been confirmed.`);
}
