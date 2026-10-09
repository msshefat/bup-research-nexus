import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { connectDb } from '../src/db.js';
import { User } from '../src/models/User.js';
import { Message } from '../src/models/Message.js';
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

test('alumni can post an opportunity, review an application, then close and delete it', async () => {
  const alumni = await register({
    name: 'Alumni Mentor',
    email: 'alumni.mentor@bup.edu.bd',
    password: 'Alumni@2026',
    role: 'alumni',
    department: 'CSE',
    organization: 'Research engineer',
  });
  assert.equal(alumni.status, 201);
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'test.admin@bup.edu.bd',
    password: 'Admin@2026',
  });
  const verified = await request(app)
    .patch(`/api/admin/users/${alumni.body.user._id}`)
    .set('Authorization', `Bearer ${adminLogin.body.token}`)
    .send({ verified: true });
  assert.equal(verified.status, 200);

  const opened = await request(app)
    .post('/api/opportunities')
    .set('Authorization', `Bearer ${alumni.body.token}`)
    .send({
      title: 'Alumni office hour on evaluation',
      summary: 'Help a student cut a thesis down to something finishable.',
      description: 'Read a one-page plan and mark what is out of scope.',
      researchAreas: ['Machine Learning'],
      department: 'CSE',
      slots: 1,
      status: 'open',
    });
  assert.equal(opened.status, 201);

  const studentLogin = await request(app).post('/api/auth/login').send({
    email: 'student.test@bup.edu.bd',
    password: 'Student@2026',
  });
  const applied = await request(app)
    .post('/api/requests')
    .set('Authorization', `Bearer ${studentLogin.body.token}`)
    .send({
      to: alumni.body.user._id,
      opportunity: opened.body._id,
      topic: 'Alumni office hour on evaluation',
      message: 'I want feedback on a one-page plan before I email a supervisor.',
    });
  assert.equal(applied.status, 201);
  assert.equal(applied.body.opportunity, opened.body._id);

  const detail = await request(app)
    .get(`/api/opportunities/${opened.body._id}`)
    .set('Authorization', `Bearer ${alumni.body.token}`);
  assert.equal(detail.status, 200);
  assert.equal(detail.body.applications.length, 1);

  const accepted = await request(app)
    .patch(`/api/requests/${applied.body._id}`)
    .set('Authorization', `Bearer ${alumni.body.token}`)
    .send({ status: 'accepted', responseNote: 'Send the plan.' });
  assert.equal(accepted.status, 200);

  const closed = await request(app)
    .put(`/api/opportunities/${opened.body._id}`)
    .set('Authorization', `Bearer ${alumni.body.token}`)
    .send({ status: 'closed' });
  assert.equal(closed.status, 200);
  assert.equal(closed.body.status, 'closed');

  const blocked = await request(app)
    .post('/api/requests')
    .set('Authorization', `Bearer ${studentLogin.body.token}`)
    .send({
      to: alumni.body.user._id,
      opportunity: opened.body._id,
      topic: 'Another try',
      message: 'Can I still apply after it is closed today?',
    });
  assert.equal(blocked.status, 403);

  const removed = await request(app)
    .delete(`/api/opportunities/${opened.body._id}`)
    .set('Authorization', `Bearer ${alumni.body.token}`);
  assert.equal(removed.status, 200);
  assert.equal(await Message.countDocuments({ request: applied.body._id }), 0);
});

test('accepted requests keep a message record, and faculty see running work', async () => {
  const facultyLogin = await request(app).post('/api/auth/login').send({
    email: 'new.faculty@bup.edu.bd',
    password: 'Faculty@2026',
  });
  const studentLogin = await request(app).post('/api/auth/login').send({
    email: 'student.test@bup.edu.bd',
    password: 'Student@2026',
  });
  const inbox = await request(app)
    .get('/api/requests?box=inbox')
    .set('Authorization', `Bearer ${facultyLogin.body.token}`);
  const accepted = inbox.body.find((item) => item.status === 'accepted');
  assert.ok(accepted);

  const history = await request(app)
    .get(`/api/requests/${accepted._id}/messages`)
    .set('Authorization', `Bearer ${facultyLogin.body.token}`);
  assert.equal(history.status, 200);
  assert.equal(history.body.length, 1);
  assert.equal(history.body[0].body, 'Send a one-page plan.');

  const reply = await request(app)
    .post(`/api/requests/${accepted._id}/messages`)
    .set('Authorization', `Bearer ${studentLogin.body.token}`)
    .send({ body: 'The one-page plan is ready.' });
  assert.equal(reply.status, 201);

  const both = await request(app)
    .get(`/api/requests/${accepted._id}/messages`)
    .set('Authorization', `Bearer ${studentLogin.body.token}`);
  assert.equal(both.status, 200);
  assert.equal(both.body.length, 2);

  const stranger = await register({
    name: 'Other Student',
    email: 'other.student@bup.edu.bd',
    password: 'Student@2026',
    role: 'student',
    department: 'CSE',
  });
  const denied = await request(app)
    .get(`/api/requests/${accepted._id}/messages`)
    .set('Authorization', `Bearer ${stranger.body.token}`);
  assert.equal(denied.status, 403);

  const pending = await request(app)
    .post('/api/requests')
    .set('Authorization', `Bearer ${studentLogin.body.token}`)
    .send({
      to: facultyLogin.body.user._id,
      topic: 'A second question',
      message: 'Can we talk after the first plan is reviewed?',
      kind: 'mentorship',
    });
  assert.equal(pending.status, 201);
  const tooEarly = await request(app)
    .post(`/api/requests/${pending.body._id}/messages`)
    .set('Authorization', `Bearer ${studentLogin.body.token}`)
    .send({ body: 'Hello before you accept.' });
  assert.equal(tooEarly.status, 403);

  const running = await request(app)
    .get('/api/running')
    .set('Authorization', `Bearer ${facultyLogin.body.token}`);
  assert.equal(running.status, 200);
  assert.ok(running.body.opportunities.some((item) => item.title === 'A new thesis call'));
  assert.ok(running.body.mentoring.some((item) => item.topic === 'Data science thesis'));

  const studentRunning = await request(app)
    .get('/api/running')
    .set('Authorization', `Bearer ${studentLogin.body.token}`);
  assert.equal(studentRunning.status, 403);

  const alumniLogin = await request(app).post('/api/auth/login').send({
    email: 'alumni.mentor@bup.edu.bd',
    password: 'Alumni@2026',
  });
  const alumniRunning = await request(app)
    .get('/api/running')
    .set('Authorization', `Bearer ${alumniLogin.body.token}`);
  assert.equal(alumniRunning.status, 200);
  assert.equal(alumniRunning.body.opportunities.length, 0);
});

test('an administrator can delete another account but not their own', async () => {
  const adminLogin = await request(app).post('/api/auth/login').send({
    email: 'test.admin@bup.edu.bd',
    password: 'Admin@2026',
  });
  const self = await request(app)
    .delete(`/api/admin/users/${adminLogin.body.user._id}`)
    .set('Authorization', `Bearer ${adminLogin.body.token}`);
  assert.equal(self.status, 400);

  const studentLogin = await request(app).post('/api/auth/login').send({
    email: 'student.test@bup.edu.bd',
    password: 'Student@2026',
  });
  const removed = await request(app)
    .delete(`/api/admin/users/${studentLogin.body.user._id}`)
    .set('Authorization', `Bearer ${adminLogin.body.token}`);
  assert.equal(removed.status, 200);
  const gone = await request(app).post('/api/auth/login').send({
    email: 'student.test@bup.edu.bd',
    password: 'Student@2026',
  });
  assert.equal(gone.status, 401);
});

test('search finds a faculty interest', async () => {
  const response = await request(app).get('/api/search').query({ q: 'Data Science' });
  assert.equal(response.status, 200);
  assert.ok(response.body.people.some((person) => person.name === 'New Faculty'));
});
});
