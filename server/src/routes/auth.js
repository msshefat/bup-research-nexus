import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { DEPARTMENTS, PUBLIC_ROLES } from '../constants.js';
import { HttpError, asString, asTags, asyncHandler, requireFields } from '../http.js';
import { jwtSecret, limitLogin, requireAuth } from '../middleware/auth.js';

const router = Router();

function sign(user) {
  return jwt.sign({ id: user.id }, jwtSecret(), { expiresIn: '12h' });
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

router.post(
  '/register',
  asyncHandler(async (req, res) => {
    const name = asString(req.body.name, 80);
    const email = asString(req.body.email, 120).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const role = asString(req.body.role, 20);
    const department = asString(req.body.department, 8);
    requireFields({ Name: name, Email: email, Password: password, Role: role, Department: department });
    if (name.length < 2) throw new HttpError(400, 'Name must be at least 2 characters.');
    if (!isEmail(email)) throw new HttpError(400, 'Enter a valid email address.');
    if (password.length < 8 || password.length > 72) {
      throw new HttpError(400, 'Password must be 8 to 72 characters.');
    }
    if (!PUBLIC_ROLES.includes(role)) throw new HttpError(400, 'Choose student, faculty, or alumni.');
    if (!DEPARTMENTS.includes(department)) throw new HttpError(400, 'Department must be CSE or ICT.');

    const existing = await User.findOne({ email });
    if (existing) throw new HttpError(409, 'An account with this email already exists.');

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role,
      department,
      batch: asString(req.body.batch, 40),
      studentId: asString(req.body.studentId, 40),
      designation: asString(req.body.designation, 80),
      organization: asString(req.body.organization, 80),
      bio: asString(req.body.bio, 800),
      researchInterests: asTags(req.body.researchInterests),
      verified: role === 'student',
      mentoringAvailable: false,
    });

    res.status(201).json({ token: sign(user), user });
  }),
);

router.post(
  '/login',
  limitLogin,
  asyncHandler(async (req, res) => {
    const email = asString(req.body.email, 120).toLowerCase();
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    requireFields({ Email: email, Password: password });
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.active) throw new HttpError(401, 'Email or password is incorrect.');
    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new HttpError(401, 'Email or password is incorrect.');
    const safe = user.toJSON();
    res.json({ token: sign(user), user: safe });
  }),
);

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json(req.user);
  }),
);

router.patch(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = req.user;
    if (req.body.name !== undefined) {
      const name = asString(req.body.name, 80);
      if (name.length < 2) throw new HttpError(400, 'Name must be at least 2 characters.');
      user.name = name;
    }
    if (req.body.department !== undefined) {
      const department = asString(req.body.department, 8);
      if (!DEPARTMENTS.includes(department)) throw new HttpError(400, 'Department must be CSE or ICT.');
      user.department = department;
    }
    const textFields = [
      ['batch', 40],
      ['studentId', 40],
      ['designation', 80],
      ['organization', 80],
      ['bio', 800],
      ['academicBackground', 800],
      ['researchExperience', 1200],
      ['office', 120],
    ];
    for (const [field, max] of textFields) {
      if (req.body[field] !== undefined) user[field] = asString(req.body[field], max);
    }
    if (req.body.researchInterests !== undefined) user.researchInterests = asTags(req.body.researchInterests);
    if (req.body.expertise !== undefined) user.expertise = asTags(req.body.expertise);
    if (req.body.mentoringAvailable !== undefined) {
      if (!['faculty', 'alumni'].includes(user.role)) {
        throw new HttpError(403, 'Only faculty and alumni can set mentoring availability.');
      }
      user.mentoringAvailable = Boolean(req.body.mentoringAvailable);
    }
    await user.save();
    res.json(user);
  }),
);

router.patch(
  '/me/password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const currentPassword = typeof req.body.currentPassword === 'string' ? req.body.currentPassword : '';
    const newPassword = typeof req.body.newPassword === 'string' ? req.body.newPassword : '';
    if (newPassword.length < 8 || newPassword.length > 72) {
      throw new HttpError(400, 'New password must be 8 to 72 characters.');
    }
    const user = await User.findById(req.user.id).select('+password');
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) throw new HttpError(400, 'Current password is incorrect.');
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.json({ message: 'Password updated.' });
  }),
);

export default router;
