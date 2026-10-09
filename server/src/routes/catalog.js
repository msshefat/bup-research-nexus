import { Router } from 'express';
import { User } from '../models/User.js';
import { Publication } from '../models/Publication.js';
import { Opportunity } from '../models/Opportunity.js';
import { Project } from '../models/Project.js';
import { CORE_AREAS } from '../constants.js';
import { asString, asyncHandler, rx } from '../http.js';

const router = Router();

router.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const [faculty, alumni, students, openOpportunities, projects, publications] = await Promise.all([
      User.countDocuments({ role: 'faculty', active: true }),
      User.countDocuments({ role: 'alumni', active: true }),
      User.countDocuments({ role: 'student', active: true }),
      Opportunity.countDocuments({ status: 'open' }),
      Project.countDocuments({ verified: true }),
      Publication.countDocuments(),
    ]);
    res.json({ faculty, alumni, students, openOpportunities, projects, publications, areas: CORE_AREAS });
  }),
);

router.get(
  '/search',
  asyncHandler(async (req, res) => {
    const q = asString(req.query.q, 80);
    const area = asString(req.query.area, 48);
    const department = asString(req.query.department, 8);
    const needle = q || area;
    const dept = department === 'CSE' || department === 'ICT' ? department : '';

    const peopleQuery = { active: true, role: { $in: ['faculty', 'alumni'] } };
    if (dept) peopleQuery.department = dept;
    if (area) peopleQuery.researchInterests = rx(area);
    if (q) {
      peopleQuery.$or = [
        { name: rx(q) },
        { designation: rx(q) },
        { bio: rx(q) },
        { researchInterests: rx(q) },
        { expertise: rx(q) },
      ];
    }

    const text = needle ? rx(needle) : null;
    const opportunityQuery = {};
    const projectQuery = { verified: true };
    const publicationQuery = {};
    if (dept) {
      opportunityQuery.department = dept;
      projectQuery.department = dept;
      publicationQuery.department = dept;
    }
    if (text) {
      opportunityQuery.$or = [{ title: text }, { summary: text }, { researchAreas: text }];
      projectQuery.$or = [{ title: text }, { abstract: text }, { authors: text }, { researchAreas: text }];
      publicationQuery.$or = [{ title: text }, { authors: text }, { abstract: text }, { researchAreas: text }];
    }

    const [people, opportunities, projects, publications] = await Promise.all([
      User.find(peopleQuery).select('name role department designation researchInterests mentoringAvailable verified').limit(12),
      Opportunity.find(opportunityQuery).populate('supervisor', 'name').limit(12),
      Project.find(projectQuery).populate('supervisor', 'name').limit(12),
      Publication.find(publicationQuery).populate('owner', 'name').limit(12),
    ]);

    res.json({ query: q, area, department: dept, people, opportunities, projects, publications });
  }),
);

export default router;
