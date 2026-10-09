import 'dotenv/config';
import { connectDb } from './db.js';
import { seed } from './seed.js';

const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bup_research_nexus';

await connectDb(uri);
await seed();
console.log('Database reset with sample data.');
process.exit(0);
