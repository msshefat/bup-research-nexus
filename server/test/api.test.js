import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDb } from '../src/db.js';
import { User } from '../src/models/User.js';
import bcrypt from 'bcryptjs';

let app;

describe('BUP Research Nexus API', { concurrency: 1 }, () => {
before(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test-secret';
  await connectDb('mongodb://127.0.0.1:27017/nexus_test');
  await mongoose.connection.dropDatabase();
  app = createApp();
});

after(async () => {
  await mongoose.disconnect();
});

async function register(body) {
  const response = await request(app).post('/api/auth/register').send(body);
  return response;
}

test('student can register and the password is not returned', async () => {
  const response = await register({
    name: 'Test Student',
    email: 'student.test@bup.edu.bd',
    password: 'Student@2026',
    role: 'student',
    department: 'CSE',
    researchInterests: ['Data Science'],
  });
  assert.equal(response.status, 201);
  assert.ok(response.body.token);
  assert.equal(response.body.user.password, undefined);
  assert.equal(response.body.user.verified, true);
});

test('admin cannot self-register', async () => {
  const response = await register({
    name: 'Bad Admin',
    email: 'bad.admin@bup.edu.bd',
    password: 'Admin@2026',
    role: 'admin',
    department: 'CSE',
  });
  assert.equal(response.status, 400);
});

test('unverified faculty cannot post a thesis call until an admin verifies them', async () => {
  const faculty = await register({
    name: 'New Faculty',
    email: 'new.faculty@bup.edu.bd',
    password: 'Faculty@2026',
    role: 'faculty',
    department: 'ICT',
    designation: 'Lecturer',
  });
  assert.equal(faculty.status, 201);
  assert.equal(faculty.body.user.verified, false);

  const blocked = await request(app)
    .post('/api/opportunities')
    .set('Authorization', `Bearer ${faculty.body.token}`)
    .send({
      title: 'A new thesis call',
      summary: 'Short summary of the call.',
      description: 'Longer description of what the student will do.',
      researchAreas: ['Data Science'],
      department: 'ICT',
      slots: 1,
    });
  assert.equal(blocked.status, 403);

  const admin = await User.create({
    name: 'Test Admin',
    email: 'test.admin@bup.edu.bd',
    password: await bcrypt.hash('Admin@2026', 10),
    role: 'admin',
    verified: true,
  });
  const login = await request(app).post('/api/auth/login').send({
    email: 'test.admin@bup.edu.bd',
    password: 'Admin@2026',
  });
  assert.equal(login.status, 200);

  const verified = await request(app)
    .patch(`/api/admin/users/${faculty.body.user._id}`)
    .set('Authorization', `Bearer ${login.body.token}`)
    .send({ verified: true });
  assert.equal(verified.status, 200);
  assert.equal(verified.body.verified, true);

  const opened = await request(app)
    .post('/api/opportunities')
    .set('Authorization', `Bearer ${faculty.body.token}`)
    .send({
      title: 'A new thesis call',
      summary: 'Short summary of the call.',
      description: 'Longer description of what the student will do.',
      researchAreas: ['Data Science'],
      department: 'ICT',
      slots: 1,
    });
  assert.equal(opened.status, 201);

  const listed = await request(app).get('/api/opportunities?area=Data%20Science');
  assert.equal(listed.status, 200);
  assert.ok(listed.body.some((item) => item.title === 'A new thesis call'));

  await request(app)
    .patch(`/api/auth/me`)
    .set('Authorization', `Bearer ${faculty.body.token}`)
    .send({ mentoringAvailable: true, researchInterests: ['Data Science'] });

  const studentLogin = await request(app).post('/api/auth/login').send({
    email: 'student.test@bup.edu.bd',
    password: 'Student@2026',
  });
  const sent = await request(app)
    .post('/api/requests')
    .set('Authorization', `Bearer ${studentLogin.body.token}`)
    .send({
      to: faculty.body.user._id,
      topic: 'Data science thesis',
      message: 'I would like to work on the new thesis call this term.',
      kind: 'thesis',
    });
  assert.equal(sent.status, 201);

  const accepted = await request(app)
    .patch(`/api/requests/${sent.body._id}`)
    .set('Authorization', `Bearer ${faculty.body.token}`)
    .send({ status: 'accepted', responseNote: 'Send a one-page plan.' });
  assert.equal(accepted.status, 200);

  const notes = await request(app)
    .get('/api/notifications')
    .set('Authorization', `Bearer ${studentLogin.body.token}`);
  assert.equal(notes.status, 200);
  assert.ok(notes.body.unread >= 1);
  assert.ok(notes.body.items.some((item) => item.title.includes('accepted')));

  assert.ok(admin.id);
});

test('search finds a faculty interest', async () => {
  const response = await request(app).get('/api/search').query({ q: 'Data Science' });
  assert.equal(response.status, 200);
  assert.ok(response.body.people.some((person) => person.name === 'New Faculty'));
});
});
