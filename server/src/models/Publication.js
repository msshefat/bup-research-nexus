import mongoose from 'mongoose';

const publicationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    authors: { type: [String], default: [] },
    venue: { type: String, default: '' },
    year: { type: Number, required: true },
    url: { type: String, default: '' },
    abstract: { type: String, default: '' },
    researchAreas: { type: [String], default: [] },
    department: { type: String, default: '' },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

export const Publication = mongoose.model('Publication', publicationSchema);
