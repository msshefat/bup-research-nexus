import mongoose from 'mongoose';
import { DEPARTMENTS, OPPORTUNITY_STATUSES } from '../constants.js';

const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    summary: { type: String, required: true },
    description: { type: String, required: true },
    researchAreas: { type: [String], default: [] },
    department: { type: String, enum: DEPARTMENTS, required: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slots: { type: Number, default: 1 },
    status: { type: String, enum: OPPORTUNITY_STATUSES, default: 'open' },
    requirements: { type: String, default: '' },
    deadline: { type: Date, default: null },
  },
  { timestamps: true },
);

export const Opportunity = mongoose.model('Opportunity', opportunitySchema);
