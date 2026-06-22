/** tel:, mailto:, and WhatsApp links for contact row actions. */

export function contactPhoneHref(phone) {
  const trimmed = String(phone || '').trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/[^\d+]/g, '');
  return digits ? `tel:${digits}` : null;
}

export function contactEmailHref(email) {
  const trimmed = String(email || '').trim();
  return trimmed ? `mailto:${trimmed}` : null;
}

export function contactWhatsAppHref(phone) {
  const trimmed = String(phone || '').trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}
