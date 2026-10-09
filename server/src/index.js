import 'dotenv/config';
import { createApp } from './app.js';
import { connectDb } from './db.js';
import { seedIfEmpty } from './seed.js';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bup_research_nexus';
const port = Number(process.env.PORT || 43124);

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
  console.error('Set JWT_SECRET before starting in production.');
  process.exit(1);
}

try {
  await connectDb(uri);
} catch (error) {
  console.error(`Could not connect to MongoDB at ${uri}`);
  console.error('Start MongoDB, then run the server again.');
  console.error(error.message);
  process.exit(1);
}

const seeded = await seedIfEmpty();
if (seeded) console.log('Loaded sample faculty, alumni, theses, and demo accounts.');

createApp().listen(port, '0.0.0.0', () => {
  console.log(`BUP Research Nexus API listening on ${port}`);
});
