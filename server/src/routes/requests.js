import { Router } from 'express';
import { Request } from '../models/Request.js';
import { Message } from '../models/Message.js';
import { User } from '../models/User.js';
import { Opportunity } from '../models/Opportunity.js';
import { REQUEST_KINDS } from '../constants.js';
import { HttpError, asString, asyncHandler, requireFields } from '../http.js';
import { requireAuth } from '../middleware/auth.js';
import { notify } from '../notify.js';

const router = Router();
const personCard = 'name role department designation organization verified mentoringAvailable';

router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const box = asString(req.query.box, 10) === 'sent' ? 'sent' : 'inbox';
    const query = box === 'sent' ? { from: req.user.id } : { to: req.user.id };
    const items = await Request.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('from', personCard)
      .populate('to', personCard)
      .populate('opportunity', 'title status');
    res.json(items);
  }),
);

router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    if (req.user.role !== 'student') {
      throw new HttpError(403, 'Students send mentorship and thesis requests.');
    }
    const to = asString(req.body.to, 30);
    const topic = asString(req.body.topic, 140);
    const message = asString(req.body.message, 1000);
    const kind = asString(req.body.kind, 20) || 'mentorship';
    requireFields({ Recipient: to, Topic: topic, Message: message });
    if (!REQUEST_KINDS.includes(kind)) throw new HttpError(400, 'Request type is not recognized.');
    if (topic.length < 4) throw new HttpError(400, 'Topic should be at least 4 characters.');
    if (message.length < 12) throw new HttpError(400, 'Write a short message so the mentor knows what you need.');
    const recipient = await User.findById(to);
    if (!recipient || !recipient.active || !['faculty', 'alumni'].includes(recipient.role)) {
      throw new HttpError(404, 'That mentor profile is not available.');
    }
    if (!recipient.verified) throw new HttpError(403, 'This profile is still waiting for verification.');
    let linkedOpportunity = null;
    const opportunityId = asString(req.body.opportunity, 30);
    if (opportunityId) {
      linkedOpportunity = await Opportunity.findById(opportunityId);
      if (!linkedOpportunity || String(linkedOpportunity.supervisor) !== String(recipient.id)) {
        throw new HttpError(404, 'That opportunity is not available.');
      }
      if (linkedOpportunity.status !== 'open') {
        throw new HttpError(403, 'This opportunity is closed to new applications.');
      }
    } else if (!recipient.mentoringAvailable) {
      throw new HttpError(403, 'This person is not currently available for new requests.');
    }
    if (String(recipient.id) === String(req.user.id)) throw new HttpError(400, 'You cannot request yourself.');
    const pending = linkedOpportunity
      ? await Request.findOne({ from: req.user.id, opportunity: linkedOpportunity.id, status: 'pending' })
      : await Request.findOne({ from: req.user.id, to: recipient.id, opportunity: null, status: 'pending' });
    if (pending) {
      throw new HttpError(409, linkedOpportunity ? 'You already applied to this opportunity.' : 'You already have a pending request with this person.');
    }

    const item = await Request.create({
      from: req.user.id,
      to: recipient.id,
      topic,
      message,
      kind: linkedOpportunity ? 'thesis' : kind,
      opportunity: linkedOpportunity?.id || null,
    });
    await notify(recipient.id, {
      title: linkedOpportunity ? `${req.user.name} applied to ${linkedOpportunity.title}` : `${req.user.name} sent a ${kind} request`,
      body: topic,
      link: linkedOpportunity ? `/opportunities/${linkedOpportunity.id}` : '/requests',
      kind: 'request',
    });
    const populated = await item.populate([
      { path: 'from', select: personCard },
      { path: 'to', select: personCard },
    ]);
    res.status(201).json(populated);
  }),
);

router.patch(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await Request.findById(req.params.id).populate('from', personCard).populate('to', personCard);
    if (!item) throw new HttpError(404, 'Request not found.');
    if (String(item.to.id || item.to) !== String(req.user.id)) {
      throw new HttpError(403, 'Only the recipient can respond to this request.');
    }
    if (item.status !== 'pending') throw new HttpError(400, 'This request has already been answered.');
    const status = asString(req.body.status, 20);
    if (!['accepted', 'rejected'].includes(status)) {
      throw new HttpError(400, 'Respond with accepted or rejected.');
    }
    const note = req.body.responseNote !== undefined ? asString(req.body.responseNote, 1000) : '';
    if (req.body.responseNote !== undefined) item.responseNote = note;
    item.status = status;
    await item.save();
    if (status === 'accepted' && note) {
      await Message.create({ request: item.id, from: req.user.id, body: note });
    }
    await notify(item.from.id || item.from, {
      title: `${req.user.name} ${status} your request`,
      body: item.topic,
      link: status === 'accepted' ? '/running' : '/requests',
      kind: 'request',
    });
    res.json(item);
  }),
);

function partyIds(item) {
  return [String(item.from?._id || item.from), String(item.to?._id || item.to)];
}

async function loadPartyRequest(req) {
  const item = await Request.findById(req.params.id);
  if (!item) throw new HttpError(404, 'Request not found.');
  if (!partyIds(item).includes(String(req.user.id))) {
    throw new HttpError(403, 'Only the two people on this request can use this record.');
  }
  return item;
}

router.get(
  '/:id/messages',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await loadPartyRequest(req);
    const messages = await Message.find({ request: item.id })
      .sort({ createdAt: 1 })
      .limit(200)
      .populate('from', 'name role');
    res.json(messages);
  }),
);

router.post(
  '/:id/messages',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await loadPartyRequest(req);
    if (item.status !== 'accepted') {
      throw new HttpError(403, 'Messages start after the request is accepted.');
    }
    const body = asString(req.body.body, 1000);
    if (!body) throw new HttpError(400, 'Write a message.');
    const message = await Message.create({ request: item.id, from: req.user.id, body });
    const recipient = String(item.from) === String(req.user.id) ? item.to : item.from;
    await notify(recipient, {
      title: `${req.user.name} sent a message`,
      body: item.topic,
      link: '/running',
      kind: 'request',
    });
    res.status(201).json(await message.populate('from', 'name role'));
  }),
);

router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const item = await loadPartyRequest(req);
    if (item.status !== 'accepted') {
      throw new HttpError(400, 'Only an accepted chat can be deleted.');
    }
    await Message.deleteMany({ request: item.id });
    await item.deleteOne();
    res.json({ message: 'Chat deleted.' });
  }),
);

export default router;
