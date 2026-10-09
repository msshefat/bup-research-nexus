import { Router } from 'express';
import { User } from '../models/User.js';
import { Opportunity } from '../models/Opportunity.js';
import { Project } from '../models/Project.js';
import { Publication } from '../models/Publication.js';
import { Request } from '../models/Request.js';
import { Notification } from '../models/Notification.js';
import { asyncHandler, HttpError } from '../http.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { notify } from '../notify.js';

const router = Router();

router.use(requireAuth, requireRole('admin'));

router.get(
  '/overview',
  asyncHandler(async (req, res) => {
    const [roles, opportunityStatus, projectDepartments, requestStatus, publicationCount, pendingProfiles, areas] =
      await Promise.all([
        User.aggregate([{ $match: { active: true } }, { $group: { _id: '$role', count: { $sum: 1 } } }]),
        Opportunity.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Project.aggregate([{ $match: { verified: true } }, { $group: { _id: '$department', count: { $sum: 1 } } }]),
        Request.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
        Publication.countDocuments(),
        User.countDocuments({ role: { $in: ['faculty', 'alumni'] }, verified: false, active: true }),
        User.aggregate([
          { $match: { active: true, role: { $in: ['faculty', 'alumni'] } } },
          { $unwind: '$researchInterests' },
          { $group: { _id: '$researchInterests', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 8 },
        ]),
      ]);

    const toMap = (rows) => Object.fromEntries(rows.map((row) => [row._id, row.count]));
    res.json({
      roles: toMap(roles),
      opportunities: toMap(opportunityStatus),
      projectsByDepartment: toMap(projectDepartments),
      requests: toMap(requestStatus),
      publications: publicationCount,
      pendingProfiles,
      areas: areas.map((row) => ({ name: row._id, count: row.count })),
    });
  }),
);

router.get(
  '/users',
  asyncHandler(async (_req, res) => {
    const users = await User.find().sort({ createdAt: -1 }).limit(200);
    res.json(users);
  }),
);

router.patch(
  '/users/:id',
  asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) throw new HttpError(404, 'User not found.');
    if (String(user.id) === String(req.user.id) && req.body.active === false) {
      throw new HttpError(400, 'You cannot deactivate your own admin account.');
    }
    const wasVerified = user.verified;
    if (req.body.verified !== undefined) user.verified = Boolean(req.body.verified);
    if (req.body.active !== undefined) {
      const nextActive = Boolean(req.body.active);
      if (!nextActive && user.role === 'admin') {
        const otherAdmins = await User.countDocuments({ role: 'admin', active: true, _id: { $ne: user.id } });
        if (otherAdmins === 0) throw new HttpError(400, 'Keep at least one active administrator.');
      }
      user.active = nextActive;
    }
    await user.save();
    if (!wasVerified && user.verified) {
      await notify(user.id, {
        title: 'Your profile is verified',
        body: 'You can now share publications, thesis calls, and mentoring availability.',
        link: '/account',
        kind: 'verification',
      });
    }
    res.json(user);
  }),
);

router.delete(
  '/users/:id',
  asyncHandler(async (req, res) => {
    if (String(req.params.id) === String(req.user.id)) {
      throw new HttpError(400, 'You cannot delete your own account.');
    }
    const user = await User.findById(req.params.id);
    if (!user) throw new HttpError(404, 'User not found.');
    await Promise.all([
      Publication.deleteMany({ owner: user.id }),
      Opportunity.deleteMany({ supervisor: user.id }),
      Request.deleteMany({ $or: [{ from: user.id }, { to: user.id }] }),
      Notification.deleteMany({ user: user.id }),
      Project.updateMany({ supervisor: user.id }, { $set: { supervisor: null } }),
    ]);
    await user.deleteOne();
    res.json({ message: 'Account deleted.' });
  }),
);

export default router;
