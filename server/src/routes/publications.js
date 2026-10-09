import { Router } from 'express';
import { Publication } from '../models/Publication.js';
import { HttpError, asString, asTags, asyncHandler, requireFields, rx } from '../http.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

function canEdit(user, publication) {
  return user.role === 'admin' || String(publication.owner) === String(user.id);
}

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const q = asString(req.query.q, 80);
    const area = asString(req.query.area, 48);
    const year = Number(req.query.year);
    const department = asString(req.query.department, 8);
    const owner = asString(req.query.owner, 30);
    const query = {};
    if (/^[a-f\d]{24}$/i.test(owner)) query.owner = owner;
    if (area) query.researchAreas = rx(area);
    if (department === 'CSE' || department === 'ICT') query.department = department;
    if (Number.isInteger(year) && year > 1990 && year < 2100) query.year = year;
    if (q) {
      query.$or = [{ title: rx(q) }, { authors: rx(q) }, { venue: rx(q) }, { abstract: rx(q) }, { researchAreas: rx(q) }];
    }
    const items = await Publication.find(query)
      .sort({ year: -1, title: 1 })
      .limit(100)
      .populate('owner', 'name department role designation');
    res.json(items);
  }),
);

router.post(
  '/',
  requireAuth,
  requireRole('faculty', 'alumni', 'admin'),
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'admin' && !req.user.verified) {
      throw new HttpError(403, 'An administrator must verify your profile before you can add publications.');
    }
    const title = asString(req.body.title, 180);
    const venue = asString(req.body.venue, 160);
    const abstract = asString(req.body.abstract, 1200);
    const year = Number(req.body.year);
    const researchAreas = asTags(req.body.researchAreas);
    requireFields({ Title: title });
    if (!Number.isInteger(year) || year < 1990 || year > 2100) throw new HttpError(400, 'Enter a valid publication year.');
    const authors = asTags(req.body.authors, 12);
    const publication = await Publication.create({
      title,
      authors: authors.length ? authors : [req.user.name],
      venue,
      year,
      url: asString(req.body.url, 300),
      abstract,
      researchAreas,
      department: req.user.department,
      owner: req.user.id,
    });
    res.status(201).json(publication);
  }),
);

router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const publication = await Publication.findById(req.params.id);
    if (!publication) throw new HttpError(404, 'Publication not found.');
    if (!canEdit(req.user, publication)) throw new HttpError(403, 'You can only edit your own publications.');
    if (req.body.title !== undefined) {
      const title = asString(req.body.title, 180);
      if (!title) throw new HttpError(400, 'Title is required.');
      publication.title = title;
    }
    if (req.body.year !== undefined) {
      const year = Number(req.body.year);
      if (!Number.isInteger(year) || year < 1990 || year > 2100) throw new HttpError(400, 'Enter a valid publication year.');
      publication.year = year;
    }
    if (req.body.authors !== undefined) publication.authors = asTags(req.body.authors, 12);
    if (req.body.venue !== undefined) publication.venue = asString(req.body.venue, 160);
    if (req.body.abstract !== undefined) publication.abstract = asString(req.body.abstract, 1200);
    if (req.body.url !== undefined) publication.url = asString(req.body.url, 300);
    if (req.body.researchAreas !== undefined) publication.researchAreas = asTags(req.body.researchAreas);
    await publication.save();
    res.json(publication);
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const publication = await Publication.findById(req.params.id);
    if (!publication) throw new HttpError(404, 'Publication not found.');
    if (!canEdit(req.user, publication)) throw new HttpError(403, 'You can only remove your own publications.');
    await publication.deleteOne();
    res.json({ message: 'Publication removed.' });
  }),
);

export default router;
