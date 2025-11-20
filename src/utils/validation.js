export function clampGuests(n) {
  const x = Number(n) || 1;
  return Math.min(20, Math.max(1, x));
}

export function isValidDateStr(s) {
  if (!s) return false;
  const d = new Date(s);
  return !isNaN(d.getTime());
}

export function sanitize(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[\n\r\t]/g, ' ').trim().slice(0, 200);
}
