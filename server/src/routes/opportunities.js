import { Router } from 'express';
import { Opportunity } from '../models/Opportunity.js';
import { DEPARTMENTS, OPPORTUNITY_STATUSES } from '../constants.js';
import { HttpError, asString, asTags, asyncHandler, requireFields, rx } from '../http.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = asString(req.query.q, 80);
    const area = asString(req.query.area, 48);
    const department = asString(req.query.department, 8);
    const status = asString(req.query.status, 20);
    const supervisor = asString(req.query.supervisor, 30);
    const query = {};
    if (/^[a-f\d]{24}$/i.test(supervisor)) query.supervisor = supervisor;
    if (department === 'CSE' || department === 'ICT') query.department = department;
    if (OPPORTUNITY_STATUSES.includes(status)) query.status = status;
    if (area) query.researchAreas = rx(area);
    if (q) {
      query.$or = [{ title: rx(q) }, { summary: rx(q) }, { description: rx(q) }, { researchAreas: rx(q) }];
    }
    const items = await Opportunity.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('supervisor', 'name department designation mentoringAvailable verified');
    res.json(items);
  }),
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const item = await Opportunity.findById(req.params.id).populate(
      'supervisor',
      'name department designation bio researchInterests mentoringAvailable verified office role',
    );
    if (!item) throw new HttpError(404, 'Opportunity not found.');
    res.json(item);
  }),
);

router.post(
  '/',
  requireAuth,
  requireRole('faculty'),
  asyncHandler(async (req, res) => {
    if (!req.user.verified) {
      throw new HttpError(403, 'An administrator must verify your profile before you can post a thesis call.');
    }
    const title = asString(req.body.title, 160);
    const summary = asString(req.body.summary, 280);
    const description = asString(req.body.description, 2000);
    const department = asString(req.body.department, 8) || req.user.department;
    const researchAreas = asTags(req.body.researchAreas);
    const status = asString(req.body.status, 20) || 'open';
    requireFields({ Title: title, Summary: summary, Description: description });
    if (!DEPARTMENTS.includes(department)) throw new HttpError(400, 'Department must be CSE or ICT.');
    if (!researchAreas.length) throw new HttpError(400, 'Add at least one research area.');
    if (!OPPORTUNITY_STATUSES.includes(status)) throw new HttpError(400, 'Status must be open, filled, or closed.');
    const slots = Number(req.body.slots || 1);
    if (!Number.isInteger(slots) || slots < 1 || slots > 20) throw new HttpError(400, 'Seats must be between 1 and 20.');
    let deadline = null;
    if (req.body.deadline) {
      deadline = new Date(req.body.deadline);
      if (Number.isNaN(deadline.getTime())) throw new HttpError(400, 'Deadline is not a valid date.');
    }
    const item = await Opportunity.create({
      title,
      summary,
      description,
      researchAreas,
      department,
      supervisor: req.user.id,
      slots,
      status,
      requirements: asString(req.body.requirements, 800),
      deadline,
    });
    const populated = await item.populate('supervisor', 'name department designation mentoringAvailable verified');
    res.status(201).json(populated);
  }),
);

router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await Opportunity.findById(req.params.id);
    if (!item) throw new HttpError(404, 'Opportunity not found.');
    const owns = String(item.supervisor) === String(req.user.id);
    if (!owns && req.user.role !== 'admin') throw new HttpError(403, 'You can only edit your own thesis calls.');
    if (req.body.title !== undefined) item.title = asString(req.body.title, 160);
    if (req.body.summary !== undefined) item.summary = asString(req.body.summary, 280);
    if (req.body.description !== undefined) item.description = asString(req.body.description, 2000);
    if (req.body.requirements !== undefined) item.requirements = asString(req.body.requirements, 800);
    if (req.body.researchAreas !== undefined) {
      const areas = asTags(req.body.researchAreas);
      if (!areas.length) throw new HttpError(400, 'Add at least one research area.');
      item.researchAreas = areas;
    }
    if (req.body.department !== undefined) {
      const department = asString(req.body.department, 8);
      if (!DEPARTMENTS.includes(department)) throw new HttpError(400, 'Department must be CSE or ICT.');
      item.department = department;
    }
    if (req.body.status !== undefined) {
      const status = asString(req.body.status, 20);
      if (!OPPORTUNITY_STATUSES.includes(status)) throw new HttpError(400, 'Status must be open, filled, or closed.');
      item.status = status;
    }
    if (req.body.slots !== undefined) {
      const slots = Number(req.body.slots);
      if (!Number.isInteger(slots) || slots < 1 || slots > 20) throw new HttpError(400, 'Seats must be between 1 and 20.');
      item.slots = slots;
    }
    if (req.body.deadline !== undefined) {
      if (!req.body.deadline) item.deadline = null;
      else {
        const deadline = new Date(req.body.deadline);
        if (Number.isNaN(deadline.getTime())) throw new HttpError(400, 'Deadline is not a valid date.');
        item.deadline = deadline;
      }
    }
    if (!item.title || !item.summary || !item.description) throw new HttpError(400, 'Title, summary, and description are required.');
    await item.save();
    res.json(await item.populate('supervisor', 'name department designation mentoringAvailable verified'));
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await Opportunity.findById(req.params.id);
    if (!item) throw new HttpError(404, 'Opportunity not found.');
    const owns = String(item.supervisor) === String(req.user.id);
    if (!owns && req.user.role !== 'admin') throw new HttpError(403, 'You can only remove your own thesis calls.');
    await item.deleteOne();
    res.json({ message: 'Opportunity removed.' });
  }),
);

export default router;
