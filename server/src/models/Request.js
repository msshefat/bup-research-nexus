import mongoose from 'mongoose';
import { REQUEST_KINDS, REQUEST_STATUSES } from '../constants.js';

const requestSchema = new mongoose.Schema(
  {
    from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    topic: { type: String, required: true },
    message: { type: String, required: true },
    kind: { type: String, enum: REQUEST_KINDS, default: 'mentorship' },
    status: { type: String, enum: REQUEST_STATUSES, default: 'pending' },
    responseNote: { type: String, default: '' },
  },
  { timestamps: true },
);

export const Request = mongoose.model('Request', requestSchema);
