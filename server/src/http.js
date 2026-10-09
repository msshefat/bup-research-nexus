export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
    this.publicMessage = message;
  }
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export function asString(value, max = 200) {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export function asTags(value, max = 8) {
  const list = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];
  const cleaned = [];
  for (const item of list) {
    if (typeof item !== 'string') continue;
    const tag = item.trim().replace(/\s+/g, ' ').slice(0, 48);
    if (!tag) continue;
    if (!cleaned.some((existing) => existing.toLowerCase() === tag.toLowerCase())) {
      cleaned.push(tag);
    }
    if (cleaned.length >= max) break;
  }
  return cleaned;
}

export function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function rx(value) {
  return new RegExp(escapeRegex(value), 'i');
}

export function requireFields(fields) {
  for (const [label, value] of Object.entries(fields)) {
    if (!value) throw new HttpError(400, `${label} is required.`);
  }
}
