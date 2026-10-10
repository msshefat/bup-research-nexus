import { Router } from 'express';
import { Opportunity } from '../models/Opportunity.js';
import { Request } from '../models/Request.js';
import { HttpError, asyncHandler } from '../http.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const personCard = 'name role department designation organization verified';

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const role = req.user.role;
    if (!['faculty', 'alumni', 'student'].includes(role)) {
      throw new HttpError(403, 'Running opportunities and mentoring are for students, faculty, and alumni.');
    }
    const mentor = role === 'faculty' || role === 'alumni';
    const [opportunities, mentoring] = await Promise.all([
      mentor
        ? Opportunity.find({ supervisor: req.user.id, status: { $in: ['open', 'filled'] } })
            .sort({ updatedAt: -1 })
            .limit(50)
            .populate('supervisor', 'name department designation')
        : Promise.resolve([]),
      Request.find(mentor ? { to: req.user.id, status: 'accepted' } : { from: req.user.id, status: 'accepted' })
        .sort({ updatedAt: -1 })
        .limit(50)
        .populate('from', personCard)
        .populate('to', personCard)
        .populate('opportunity', 'title status'),
    ]);
    res.json({ opportunities, mentoring });
  }),
);

export default router;
