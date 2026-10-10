# BUP Research Nexus — requirements this build fulfills

The proposal PDF is not stored in this repository, so the rows below are not a numbered copy of that document. They are the functional and non-functional requirements the running app actually fulfills. Map them onto the IDs in the course proposal.

The proposal named PostgreSQL. This build uses MongoDB because the requested stack is MERN: React, Node.js, Express, and MongoDB.

## Functional requirements

| Requirement | Status |
| --- | --- |
| Register and sign in as student, faculty, or alumni | Done |
| Admin account is not open for self-registration | Done |
| Each role sees only what that role is allowed to do | Done |
| Edit your own profile, research interests, and password | Done |
| Faculty and alumni directory for CSE and ICT | Done |
| Faculty profile shows interests, papers, supervised work, and open calls | Done |
| Alumni profile, papers, and mentoring availability | Done |
| Search and filter by name, department, research area, and status | Done |
| Thesis and project repository. The public sees verified records only | Done |
| Admin can add, verify, or hide a thesis record | Done |
| Verified faculty can post a publication | Done |
| Verified faculty or alumni can open a thesis call | Done |
| Student can apply to an open opportunity | Done |
| The owner can accept or reject an application | Done |
| The owner can close or delete an opportunity. Deleting it also removes its applications and messages | Done |
| Student can send a mentorship, thesis, or collaboration request | Done |
| Faculty or alumni can accept or decline, and the accept box saves a message | Done |
| That chat keeps a history. Both people can keep writing | Done |
| Running page for students, faculty, and alumni | Done |
| Running lists the other person’s name. A click opens that chat | Done |
| Delete on a running chat removes the request and every message | Done |
| In-app alerts for a new request, an answer, a new message, and profile verification | Done |
| Admin can verify or deactivate an account | Done |
| Admin can delete any account except their own. Related papers, calls, requests, and messages go with it | Done |
| Admin overview counts for people, calls, theses, and requests | Done |
| Home page shows open calls, faculty who are mentoring, and past projects | Done |

## Non-functional requirements

| Requirement | Status |
| --- | --- |
| Web app the user can open in a browser | Done. React renders the HTML |
| Styling | Done. Tailwind CSS, plus a light and dark theme |
| Navigation in a top bar, including on a phone | Done |
| MERN stack | Done. React, Node.js, Express, MongoDB |
| Passwords stored hashed, not as plain text | Done. bcrypt |
| Signed-in access with a token | Done. JWT, and the role is read from the database |
| A person cannot use another role’s actions by calling the API directly | Done |
| Unverified faculty or alumni cannot post a call or a paper | Done |
| Basic protection on the API | Done. Helmet, CORS, input length limits, and a sign-in attempt limit |
| The same flow works on desktop and on a narrow phone screen | Done |
| Sample data so the app can be demonstrated without typing everything | Done. Password `Nexus@2026` |
| Automated API tests | Done. `npm test` |
| A way to run it again from the README | Done |

## Not built

Leave these out of a viva unless the proposal never asked for them.

- PostgreSQL. The proposal named it. This build uses MongoDB because the requested stack is MERN.
- Email. Alerts stay inside the app.
- Uploading a thesis PDF or image.
- University login, such as a BUP single sign-on account.
- A chat before the request is accepted. The message record starts at acceptance.
- A deployed public server. It runs locally with MongoDB.
