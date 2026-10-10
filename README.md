# BUP Research Nexus

A research directory for the CSE and ICT departments at Bangladesh University of Professionals. Students look up faculty interests, open thesis calls, previous projects, and alumni who can still answer a careful question. Faculty and alumni keep their own profiles. An administrator verifies people and thesis records.

The course proposal described PostgreSQL. This build uses **MongoDB** with the MERN stack: React, Node.js, Express, and MongoDB.

## Run it locally

You need Node.js 22 and MongoDB 7 or 8.

```bash
mkdir -p "$HOME/mongo-data"
mongod --dbpath "$HOME/mongo-data" --bind_ip 127.0.0.1 --port 27017 --fork --logpath "$HOME/mongo.log"

npm install
npm install --prefix server
npm install --prefix client
npm run dev
```

- Web app: [http://127.0.0.1:43123](http://127.0.0.1:43123)
- API: [http://127.0.0.1:43124/api/health](http://127.0.0.1:43124/api/health)

The API loads sample faculty, alumni, theses, and demo accounts the first time the database is empty. To wipe and load that sample data again:

```bash
npm run seed
```

On a machine that uses systemd, `sudo systemctl start mongod` is enough instead of the `mongod --fork` command.

Copy `server/.env.example` to `server/.env` if you want a different database URL or JWT secret. Without that file, the server uses the local database and a development-only secret.

## Demo accounts

Every sample account uses the password `Nexus@2026`.

| Role | Email | What to try |
| --- | --- | --- |
| Student | ayesha.karim@bup.edu.bd | Send a thesis request |
| Student | farhan.siddique@bup.edu.bd | Running chat with Dr. Farzana Haque |
| Faculty | sharmeen.seema@bup.edu.bd | Accept the request already waiting |
| Faculty | farzana.haque@bup.edu.bd | Running mentoring, with a saved message record |
| Alumni | mehzabin.chowdhury@bup.edu.bd | Profile, papers, mentoring flag |
| Admin | admin@bup.edu.bd | Verify Rafiul Islam and the hidden thesis |

The sign-in page can fill these in. Sample profiles are illustrative course data, not an official university directory. Two lecturer profiles use the supervisors named in the project proposal.

## What you can do

- Register and sign in as a student, faculty member, or alumnus. Passwords are hashed. Access is role based.
- Search and filter faculty, alumni, thesis calls, projects, and papers by keyword, department, research area, and status.
- Read a research profile, publications, supervised work, and open calls.
- Send a mentorship, thesis, or collaboration request, then accept or decline it. An acceptance can include a message, and both people keep writing on that record.
- Students, faculty, and alumni open Running to see the other person’s name. A click opens that chat. Delete removes the chat and every message on it.
- Get an in-app alert when a request is sent, answered, or a profile is verified.
- Faculty post and close thesis calls and add publications after verification.
- Administrators verify or deactivate accounts, add or hide thesis records, remove papers, and see basic counts.

## API

| Method | Path | Who |
| --- | --- | --- |
| POST | `/api/auth/register` | Public. Roles: student, faculty, alumni |
| POST | `/api/auth/login` | Public |
| GET, PATCH | `/api/auth/me` | Signed in |
| PATCH | `/api/auth/me/password` | Signed in |
| GET | `/api/people` | Public. Student list requires sign-in |
| GET | `/api/people/:id` | Public, same rule for students |
| GET | `/api/opportunities` | Public |
| POST, PUT, DELETE | `/api/opportunities/:id` | Verified faculty or alumni. Admin can edit and delete any call |
| GET | `/api/projects` | Public sees verified records. Admin sees all |
| POST, PUT, DELETE | `/api/projects/:id` | Admin |
| GET | `/api/publications` | Public |
| POST, PUT, DELETE | `/api/publications/:id` | Owner faculty or alumni, or admin |
| GET, POST | `/api/requests` | Signed in. Only students create requests |
| PATCH | `/api/requests/:id` | Recipient accepts or declines. A note on accept is the first message |
| GET, POST | `/api/requests/:id/messages` | The two people on an accepted request |
| DELETE | `/api/requests/:id` | Either person on an accepted chat. Removes the request and its messages |
| GET | `/api/running` | Student, faculty, or alumni. Names of accepted mentoring, plus open calls for faculty and alumni |
| GET | `/api/notifications` | Signed in |
| PATCH | `/api/notifications/read-all` | Signed in |
| PATCH | `/api/notifications/:id/read` | Signed in |
| GET | `/api/search` | Public |
| GET | `/api/stats` | Public |
| GET | `/api/admin/overview` | Admin |
| GET, PATCH, DELETE | `/api/admin/users/:id` | Admin. An admin cannot delete their own account |

Send `Authorization: Bearer <token>` for protected routes.

## Tests

With MongoDB running:

```bash
npm test
```

## Production build

```bash
npm run build
NODE_ENV=production JWT_SECRET=a-long-random-secret npm start --prefix server
```

The API then serves `client/dist` and the React routes.
