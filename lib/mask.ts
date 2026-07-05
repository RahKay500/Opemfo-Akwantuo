// "+233241234567" -> "+233 24 XXX XXXX" (fully masks the subscriber number, per Figma)
export function maskGhanaPhone(phone: string): string {
  const match = /^\+233(\d{2})\d{7}$/.exec(phone);
  if (!match) return phone;
  return `+233 ${match[1]} XXX XXXX`;
}
