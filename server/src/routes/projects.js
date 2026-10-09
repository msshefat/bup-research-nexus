import { Router } from 'express';
import { Project } from '../models/Project.js';
import { User } from '../models/User.js';
import { DEPARTMENTS, PROJECT_TYPES } from '../constants.js';
import { HttpError, asString, asTags, asyncHandler, requireFields, rx } from '../http.js';
import { optionalAuth, requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const q = asString(req.query.q, 80);
    const area = asString(req.query.area, 48);
    const department = asString(req.query.department, 8);
    const year = Number(req.query.year);
    const query = {};
    if (req.user?.role !== 'admin') query.verified = true;
    if (asString(req.query.verified, 8) === 'false' && req.user?.role === 'admin') query.verified = false;
    if (department === 'CSE' || department === 'ICT') query.department = department;
    if (Number.isInteger(year) && year > 1990 && year < 2100) query.year = year;
    if (area) query.researchAreas = rx(area);
    if (q) {
      query.$or = [{ title: rx(q) }, { abstract: rx(q) }, { authors: rx(q) }, { researchAreas: rx(q) }];
    }
    const items = await Project.find(query)
      .sort({ year: -1, title: 1 })
      .limit(100)
      .populate('supervisor', 'name department designation');
    res.json(items);
  }),
);

router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const item = await Project.findById(req.params.id).populate('supervisor', 'name department designation role verified');
    if (!item) throw new HttpError(404, 'Project not found.');
    if (!item.verified && req.user?.role !== 'admin') throw new HttpError(404, 'Project not found.');
    res.json(item);
  }),
);

router.post(
  '/',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const title = asString(req.body.title, 180);
    const abstract = asString(req.body.abstract, 1600);
    const authors = asString(req.body.authors, 180);
    const department = asString(req.body.department, 8);
    const type = asString(req.body.type, 20) || 'thesis';
    const year = Number(req.body.year);
    const researchAreas = asTags(req.body.researchAreas);
    requireFields({ Title: title, Abstract: abstract, Authors: authors, Department: department });
    if (!DEPARTMENTS.includes(department)) throw new HttpError(400, 'Department must be CSE or ICT.');
    if (!PROJECT_TYPES.includes(type)) throw new HttpError(400, 'Type must be thesis or project.');
    if (!Number.isInteger(year) || year < 1990 || year > 2100) throw new HttpError(400, 'Enter a valid year.');
    let supervisor = null;
    if (req.body.supervisor) {
      supervisor = await User.findById(asString(req.body.supervisor, 30));
      if (!supervisor) throw new HttpError(400, 'Supervisor profile was not found.');
    }
    const item = await Project.create({
      title,
      abstract,
      year,
      department,
      researchAreas,
      authors,
      supervisor: supervisor?.id || null,
      type,
      verified: req.body.verified !== false,
      outcome: asString(req.body.outcome, 400),
      createdBy: req.user.id,
    });
    res.status(201).json(await item.populate('supervisor', 'name department designation'));
  }),
);

router.put(
  '/:id',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const item = await Project.findById(req.params.id);
    if (!item) throw new HttpError(404, 'Project not found.');
    if (req.body.title !== undefined) item.title = asString(req.body.title, 180);
    if (req.body.abstract !== undefined) item.abstract = asString(req.body.abstract, 1600);
    if (req.body.authors !== undefined) item.authors = asString(req.body.authors, 180);
    if (req.body.outcome !== undefined) item.outcome = asString(req.body.outcome, 400);
    if (req.body.department !== undefined) {
      const department = asString(req.body.department, 8);
      if (!DEPARTMENTS.includes(department)) throw new HttpError(400, 'Department must be CSE or ICT.');
      item.department = department;
    }
    if (req.body.type !== undefined) {
      const type = asString(req.body.type, 20);
      if (!PROJECT_TYPES.includes(type)) throw new HttpError(400, 'Type must be thesis or project.');
      item.type = type;
    }
    if (req.body.year !== undefined) {
      const year = Number(req.body.year);
      if (!Number.isInteger(year) || year < 1990 || year > 2100) throw new HttpError(400, 'Enter a valid year.');
      item.year = year;
    }
    if (req.body.researchAreas !== undefined) item.researchAreas = asTags(req.body.researchAreas);
    if (req.body.verified !== undefined) item.verified = Boolean(req.body.verified);
    if (req.body.supervisor !== undefined) {
      if (!req.body.supervisor) item.supervisor = null;
      else {
        const supervisor = await User.findById(asString(req.body.supervisor, 30));
        if (!supervisor) throw new HttpError(400, 'Supervisor profile was not found.');
        item.supervisor = supervisor.id;
      }
    }
    if (!item.title || !item.abstract || !item.authors) throw new HttpError(400, 'Title, abstract, and authors are required.');
    await item.save();
    res.json(await item.populate('supervisor', 'name department designation'));
  }),
);

router.delete(
  '/:id',
  requireAuth,
  requireRole('admin'),
  asyncHandler(async (req, res) => {
    const item = await Project.findById(req.params.id);
    if (!item) throw new HttpError(404, 'Project not found.');
    await item.deleteOne();
    res.json({ message: 'Project removed.' });
  }),
);

export default router;
