export interface CustomerFields {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  terms: boolean;
}

export type FieldErrors = Partial<Record<keyof CustomerFields, string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Normalisiert Telefonnummern (Schweiz & international) auf die Form +41… */
export function normalizePhone(input: string) {
  const digits = input.replace(/[\s\-/().]/g, '');
  if (/^\+\d{8,15}$/.test(digits)) return digits;
  if (/^00\d{8,15}$/.test(digits)) return `+${digits.slice(2)}`;
  if (/^0\d{9}$/.test(digits)) return `+41${digits.slice(1)}`;
  return null;
}

export function formatPhone(input: string) {
  const n = normalizePhone(input);
  if (!n) return input;
  if (n.startsWith('+41') && n.length === 12) {
    return `+41 ${n.slice(3, 5)} ${n.slice(5, 8)} ${n.slice(8, 10)} ${n.slice(10)}`;
  }
  return n;
}

export function validateCustomer(c: CustomerFields): FieldErrors {
  const e: FieldErrors = {};
  if (!c.firstName.trim()) e.firstName = 'Bitte gib deinen Vornamen ein.';
  else if (c.firstName.trim().length < 2) e.firstName = 'Der Vorname ist zu kurz.';
  if (!c.lastName.trim()) e.lastName = 'Bitte gib deinen Nachnamen ein.';
  if (!c.email.trim()) e.email = 'Bitte gib deine E-Mail-Adresse ein.';
  else if (!EMAIL.test(c.email.trim()))
    e.email = 'Diese E-Mail-Adresse sieht nicht vollständig aus (z. B. name@beispiel.ch).';
  if (!c.phone.trim()) e.phone = 'Bitte gib deine Mobilnummer ein – für Rückfragen zum Termin.';
  else if (!normalizePhone(c.phone))
    e.phone = 'Bitte gib eine gültige Nummer ein, z. B. 079 123 45 67.';
  if (!c.terms) e.terms = 'Bitte bestätige die Termin- und Stornobedingungen.';
  return e;
}
