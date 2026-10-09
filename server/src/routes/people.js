import { Router } from 'express';
import { User } from '../models/User.js';
import { Publication } from '../models/Publication.js';
import { Opportunity } from '../models/Opportunity.js';
import { Project } from '../models/Project.js';
import { PUBLIC_ROLES } from '../constants.js';
import { HttpError, asString, asyncHandler, rx } from '../http.js';
import { optionalAuth } from '../middleware/auth.js';

const router = Router();
const personFields = 'name role department batch designation organization bio researchInterests expertise mentoringAvailable verified academicBackground researchExperience office createdAt';

router.get(
  '/',
  optionalAuth,
  asyncHandler(async (req, res) => {
    const q = asString(req.query.q, 80);
    const role = asString(req.query.role, 20);
    const department = asString(req.query.department, 8);
    const area = asString(req.query.area, 48);
    const mentoring = asString(req.query.mentoring, 8) === 'true';

    if (role && !PUBLIC_ROLES.includes(role)) throw new HttpError(400, 'Unknown role filter.');
    if (role === 'student' && !req.user) {
      throw new HttpError(401, 'Sign in to view student research interests.');
    }

    const query = { active: true, role: { $in: ['faculty', 'alumni'] } };
    if (role) query.role = role;
    if (department === 'CSE' || department === 'ICT') query.department = department;
    if (mentoring) query.mentoringAvailable = true;
    if (area) query.researchInterests = rx(area);
    if (q) {
      query.$or = [
        { name: rx(q) },
        { bio: rx(q) },
        { designation: rx(q) },
        { organization: rx(q) },
        { researchInterests: rx(q) },
        { expertise: rx(q) },
      ];
    }

    const people = await User.find(query).select(personFields).sort({ mentoringAvailable: -1, name: 1 }).limit(100);
    res.json(people);
  }),
);

router.get(
  '/:id',
  optionalAuth,
  asyncHandler(async (req, res) => {
    if (!req.params.id.match(/^[a-f\d]{24}$/i)) throw new HttpError(404, 'Profile not found.');
    const person = await User.findOne({ _id: req.params.id, active: true }).select(personFields);
    if (!person) throw new HttpError(404, 'Profile not found.');
    if (person.role === 'admin') throw new HttpError(404, 'Profile not found.');
    if (person.role === 'student' && !req.user) {
      throw new HttpError(401, 'Sign in to view student research interests.');
    }

    const [publications, opportunities, projects] = await Promise.all([
      Publication.find({ owner: person.id }).sort({ year: -1, title: 1 }),
      Opportunity.find({ supervisor: person.id }).sort({ createdAt: -1 }).populate('supervisor', 'name department designation'),
      Project.find({ supervisor: person.id, verified: true }).sort({ year: -1 }),
    ]);

    res.json({ user: person, publications, opportunities, projects });
  }),
);

export default router;
