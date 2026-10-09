import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.js';
import peopleRoutes from './routes/people.js';
import publicationRoutes from './routes/publications.js';
import opportunityRoutes from './routes/opportunities.js';
import projectRoutes from './routes/projects.js';
import requestRoutes from './routes/requests.js';
import runningRoutes from './routes/running.js';
import notificationRoutes from './routes/notifications.js';
import adminRoutes from './routes/admin.js';
import catalogRoutes from './routes/catalog.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet({ contentSecurityPolicy: false }));
  app.use(cors());
  app.use(express.json({ limit: '1mb' }));
  if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'bup-research-nexus' });
  });

  app.use('/api/auth', authRoutes);
  app.use('/api/people', peopleRoutes);
  app.use('/api/publications', publicationRoutes);
  app.use('/api/opportunities', opportunityRoutes);
  app.use('/api/projects', projectRoutes);
  app.use('/api/requests', requestRoutes);
  app.use('/api/running', runningRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api', catalogRoutes);

  if (process.env.NODE_ENV === 'production') {
    const clientDist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../client/dist');
    app.use(express.static(clientDist));
    app.use((req, res, next) => {
      if (req.method !== 'GET' || req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use('/api', (_req, res) => {
    res.status(404).json({ message: 'That API route does not exist.' });
  });

  app.use((err, _req, res, _next) => {
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'That record was not found.' });
    }
    const status = err.status || 500;
    if (status >= 500) console.error(err);
    const message = status >= 500 ? 'Something went wrong. Try again.' : err.publicMessage || err.message;
    res.status(status).json({ message });
  });

  return app;
}
