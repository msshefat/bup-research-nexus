import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { HttpError } from '../http.js';

export function jwtSecret() {
  return process.env.JWT_SECRET || 'dev-only-nexus-secret-change-me';
}

function readToken(req) {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : '';
}

export async function optionalAuth(req, _res, next) {
  const token = readToken(req);
  if (!token) return next();
  try {
    const payload = jwt.verify(token, jwtSecret());
    const user = await User.findById(payload.id);
    if (user?.active) req.user = user;
  } catch {
    // A stale token should not block public pages.
  }
  next();
}

export async function requireAuth(req, _res, next) {
  const token = readToken(req);
  if (!token) return next(new HttpError(401, 'Sign in to continue.'));
  try {
    const payload = jwt.verify(token, jwtSecret());
    const user = await User.findById(payload.id);
    if (!user || !user.active) return next(new HttpError(401, 'Sign in to continue.'));
    req.user = user;
    next();
  } catch {
    next(new HttpError(401, 'Your session expired. Sign in again.'));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new HttpError(403, 'You do not have access to this action.'));
    }
    next();
  };
}

const loginHits = new Map();

export function limitLogin(req, _res, next) {
  const key = req.ip || 'local';
  const now = Date.now();
  const recent = (loginHits.get(key) || []).filter((stamp) => now - stamp < 15 * 60 * 1000);
  if (recent.length >= 30) {
    return next(new HttpError(429, 'Too many sign-in attempts. Wait a few minutes and try again.'));
  }
  recent.push(now);
  loginHits.set(key, recent);
  next();
}
