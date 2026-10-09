import { Router } from 'express';
import { Notification } from '../models/Notification.js';
import { HttpError, asyncHandler } from '../http.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const items = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
    const unread = items.filter((item) => !item.read).length;
    res.json({ items, unread });
  }),
);

router.patch(
  '/read-all',
  requireAuth,
  asyncHandler(async (req, res) => {
    await Notification.updateMany({ user: req.user.id, read: false }, { read: true });
    res.json({ message: 'All notifications marked read.' });
  }),
);

router.patch(
  '/:id/read',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await Notification.findOne({ _id: req.params.id, user: req.user.id });
    if (!item) throw new HttpError(404, 'Notification not found.');
    item.read = true;
    await item.save();
    res.json(item);
  }),
);

export default router;
