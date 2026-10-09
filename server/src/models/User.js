import mongoose from 'mongoose';
import { DEPARTMENTS, ROLES } from '../constants.js';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, required: true },
    department: { type: String, enum: [...DEPARTMENTS, ''], default: '' },
    batch: { type: String, default: '' },
    studentId: { type: String, default: '' },
    designation: { type: String, default: '' },
    organization: { type: String, default: '' },
    bio: { type: String, default: '' },
    researchInterests: { type: [String], default: [] },
    expertise: { type: [String], default: [] },
    mentoringAvailable: { type: Boolean, default: false },
    verified: { type: Boolean, default: false },
    active: { type: Boolean, default: true },
    academicBackground: { type: String, default: '' },
    researchExperience: { type: String, default: '' },
    office: { type: String, default: '' },
  },
  { timestamps: true },
);

userSchema.set('toJSON', {
  transform: (_doc, ret) => {
    delete ret.password;
    return ret;
  },
});

export const User = mongoose.model('User', userSchema);
