import mongoose from 'mongoose';
import { DEPARTMENTS, PROJECT_TYPES } from '../constants.js';

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    abstract: { type: String, required: true },
    year: { type: Number, required: true },
    department: { type: String, enum: DEPARTMENTS, required: true },
    researchAreas: { type: [String], default: [] },
    authors: { type: String, required: true },
    supervisor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    type: { type: String, enum: PROJECT_TYPES, default: 'thesis' },
    verified: { type: Boolean, default: false },
    outcome: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export const Project = mongoose.model('Project', projectSchema);
