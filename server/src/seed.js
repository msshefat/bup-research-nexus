import bcrypt from 'bcryptjs';
import { User } from './models/User.js';
import { Publication } from './models/Publication.js';
import { Opportunity } from './models/Opportunity.js';
import { Project } from './models/Project.js';
import { Request } from './models/Request.js';
import { Message } from './models/Message.js';
import { Notification } from './models/Notification.js';

const DEMO_PASSWORD = 'Nexus@2026';

export async function seedIfEmpty() {
  const count = await User.estimatedDocumentCount();
  if (count > 0) return false;
  await seed();
  return true;
}

export async function seed() {
  await Promise.all([
    User.deleteMany({}),
    Publication.deleteMany({}),
    Opportunity.deleteMany({}),
    Project.deleteMany({}),
    Request.deleteMany({}),
    Message.deleteMany({}),
    Notification.deleteMany({}),
  ]);

  const password = await bcrypt.hash(DEMO_PASSWORD, 10);

  const people = await User.create([
    {
      name: 'Research Nexus Admin',
      email: 'admin@bup.edu.bd',
      password,
      role: 'admin',
      department: '',
      designation: 'Platform administrator',
      bio: 'Verifies faculty and alumni profiles, keeps the thesis repository accurate, and watches basic platform activity.',
      verified: true,
    },
    {
      name: 'Md. Istakiak Adnan Palash',
      email: 'istakiak.palash@bup.edu.bd',
      password,
      role: 'faculty',
      department: 'ICT',
      designation: 'Lecturer',
      office: 'ICT faculty room, FST',
      bio: 'Lecturer in ICT. Supervises student work on software engineering practice, requirements, and tools that help undergraduates structure a research question.',
      researchInterests: ['Software Engineering', 'Natural Language Processing'],
      expertise: ['Requirements', 'Web systems', 'Research writing tools'],
      academicBackground: 'Lecturer, Department of ICT, Faculty of Science and Technology, Bangladesh University of Professionals.',
      researchExperience: 'Works with final-year students on software process, traceability, and small language tools for academic writing.',
      mentoringAvailable: true,
      verified: true,
    },
    {
      name: 'Sharmeen Jahan Seema',
      email: 'sharmeen.seema@bup.edu.bd',
      password,
      role: 'faculty',
      department: 'ICT',
      designation: 'Lecturer',
      office: 'ICT faculty room, FST',
      bio: 'Lecturer in ICT. Focuses on data science and machine learning for Bangla text, student datasets, and evaluations that a thesis can actually finish.',
      researchInterests: ['Data Science', 'Machine Learning', 'Natural Language Processing'],
      expertise: ['Bangla text', 'Classification', 'Dataset design'],
      academicBackground: 'Lecturer, Department of ICT, Faculty of Science and Technology, Bangladesh University of Professionals.',
      researchExperience: 'Supervises applied machine learning projects where the dataset, metric, and error analysis are decided before the model.',
      mentoringAvailable: true,
      verified: true,
    },
    {
      name: 'Dr. Farzana Haque',
      email: 'farzana.haque@bup.edu.bd',
      password,
      role: 'faculty',
      department: 'CSE',
      designation: 'Associate Professor',
      office: 'CSE block, room 412',
      bio: 'Studies phishing, authentication, and network defense with examples drawn from Bangladeshi university and banking sites.',
      researchInterests: ['Cybersecurity', 'Computer Networks'],
      expertise: ['Phishing detection', 'Authentication', 'Traffic analysis'],
      academicBackground: 'Associate Professor, Department of CSE, BUP. Sample profile for this course demo.',
      researchExperience: 'Runs a small security reading group and takes two thesis students a year.',
      mentoringAvailable: true,
      verified: true,
    },
    {
      name: 'Dr. Tanvir Hossain',
      email: 'tanvir.hossain@bup.edu.bd',
      password,
      role: 'faculty',
      department: 'CSE',
      designation: 'Assistant Professor',
      office: 'Vision lab, CSE',
      bio: 'Works on computer vision for classrooms and labs, especially models that run on a single low-cost camera.',
      researchInterests: ['Computer Vision', 'Machine Learning'],
      expertise: ['Occupancy estimation', 'Safety monitoring'],
      academicBackground: 'Assistant Professor, Department of CSE, BUP. Sample profile for this course demo.',
      researchExperience: 'Current cohort is full, but one posted thesis call remains open for a lab-safety study.',
      mentoringAvailable: false,
      verified: true,
    },
    {
      name: 'Nusrat Jahan',
      email: 'nusrat.jahan@bup.edu.bd',
      password,
      role: 'faculty',
      department: 'CSE',
      designation: 'Lecturer',
      office: 'Networks lab, CSE',
      bio: 'Measures campus wireless networks and small IoT deployments. Prefers theses that collect a real trace and explain it.',
      researchInterests: ['Computer Networks', 'Internet of Things'],
      expertise: ['Wi-Fi measurement', 'IoT sensing'],
      academicBackground: 'Lecturer, Department of CSE, BUP. Sample profile for this course demo.',
      researchExperience: 'Not opening general mentoring this term. One earlier Wi-Fi thesis is already filled.',
      mentoringAvailable: false,
      verified: true,
    },
    {
      name: 'Rafid Hasan',
      email: 'rafid.hasan@bup.edu.bd',
      password,
      role: 'faculty',
      department: 'ICT',
      designation: 'Lecturer',
      office: 'Signal lab, ICT',
      bio: 'Works on communication systems and short-utterance Bangla speech. Looking for students who will record data carefully.',
      researchInterests: ['Communication Systems', 'Machine Learning'],
      expertise: ['Speech features', 'Speaker identification'],
      academicBackground: 'Lecturer, Department of ICT, BUP. Sample profile for this course demo.',
      researchExperience: 'Supervises speech and signal projects with a fixed recording protocol.',
      mentoringAvailable: true,
      verified: true,
    },
    {
      name: 'Dr. Mahia Rahman',
      email: 'mahia.rahman@bup.edu.bd',
      password,
      role: 'faculty',
      department: 'CSE',
      designation: 'Assistant Professor',
      office: 'CSE block, room 305',
      bio: 'Builds question-answering and retrieval tools for low-resource languages, including undergraduate thesis abstracts.',
      researchInterests: ['Natural Language Processing', 'Artificial Intelligence'],
      expertise: ['Retrieval', 'Question answering', 'Low-resource text'],
      academicBackground: 'Assistant Professor, Department of CSE, BUP. Sample profile for this course demo.',
      researchExperience: 'Accepting one student to index past CSE and ICT thesis abstracts.',
      mentoringAvailable: true,
      verified: true,
    },
    {
      name: 'Imran Kabir',
      email: 'imran.kabir@bup.edu.bd',
      password,
      role: 'faculty',
      department: 'ICT',
      designation: 'Lecturer',
      office: 'ICT studio',
      bio: 'Studies how students choose a thesis topic and how research profiles should be written so the next cohort can actually use them.',
      researchInterests: ['Human-Computer Interaction', 'Software Engineering'],
      expertise: ['Interview studies', 'Academic interfaces'],
      academicBackground: 'Lecturer, Department of ICT, BUP. Sample profile for this course demo.',
      researchExperience: 'Mixes qualitative interviews with small interface prototypes.',
      mentoringAvailable: true,
      verified: true,
    },
    {
      name: 'Mehzabin Chowdhury',
      email: 'mehzabin.chowdhury@bup.edu.bd',
      password,
      role: 'alumni',
      department: 'CSE',
      batch: 'BICE-2021',
      organization: 'Machine learning engineer, Dhaka',
      bio: 'Graduated from CSE after a thesis on Bangla review classification. Helps current students scope an industry-readable research project.',
      researchInterests: ['Machine Learning', 'Natural Language Processing'],
      expertise: ['Text classification', 'Model evaluation'],
      academicBackground: 'B.Sc. in CSE, BUP, BICE-2021. Sample alumni profile.',
      researchExperience: 'Thesis with Sharmeen Jahan Seema on Bangla food-review sentiment. Now trains classification models at work.',
      mentoringAvailable: true,
      verified: true,
    },
    {
      name: 'Adnan Karim',
      email: 'adnan.karim@bup.edu.bd',
      password,
      role: 'alumni',
      department: 'CSE',
      batch: 'BICE-2020',
      organization: 'Security analyst',
      bio: 'Undergraduate security projects became a job portfolio. Talks with students about phishing studies, write-ups, and what hiring teams actually read.',
      researchInterests: ['Cybersecurity'],
      expertise: ['Phishing', 'Lab write-ups'],
      academicBackground: 'B.Sc. in CSE, BUP, BICE-2020. Sample alumni profile.',
      researchExperience: 'Undergraduate project on suspicious login pages, supervised in the CSE security group.',
      mentoringAvailable: true,
      verified: true,
    },
    {
      name: 'Lamia Sultana',
      email: 'lamia.sultana@bup.edu.bd',
      password,
      role: 'alumni',
      department: 'ICT',
      batch: 'BICE-2022',
      organization: 'Graduate researcher',
      bio: 'ICT graduate now working on speech and language. Available for short questions about recording Bangla audio for a thesis.',
      researchInterests: ['Communication Systems', 'Natural Language Processing'],
      expertise: ['Speech datasets', 'Graduate applications'],
      academicBackground: 'B.Sc. in ICT, BUP, BICE-2022. Sample alumni profile.',
      researchExperience: 'Undergraduate thesis on command recognition, now continuing speech research in graduate study.',
      mentoringAvailable: true,
      verified: true,
    },
    {
      name: 'Sabbir Rahman',
      email: 'sabbir.rahman@bup.edu.bd',
      password,
      role: 'alumni',
      department: 'ICT',
      batch: 'BICE-2019',
      organization: 'Network engineer',
      bio: 'Works on enterprise wireless networks. Profile is public, but mentoring time is closed this semester.',
      researchInterests: ['Computer Networks'],
      expertise: ['Campus Wi-Fi', 'Measurement'],
      academicBackground: 'B.Sc. in ICT, BUP, BICE-2019. Sample alumni profile.',
      researchExperience: 'Helped collect an early campus latency trace used in a later CSE thesis.',
      mentoringAvailable: false,
      verified: true,
    },
    {
      name: 'Rafiul Islam',
      email: 'rafiul.islam@bup.edu.bd',
      password,
      role: 'alumni',
      department: 'CSE',
      batch: 'BICE-2018',
      organization: 'Data engineer',
      bio: 'Alumni profile submitted for verification. Interests sit around data pipelines and reproducible student experiments.',
      researchInterests: ['Data Science'],
      expertise: ['Pipelines', 'Experiment logs'],
      academicBackground: 'B.Sc. in CSE, BUP, BICE-2018. Waiting for administrator verification in this demo.',
      researchExperience: 'Wants to review student experiment logs once the profile is verified.',
      mentoringAvailable: true,
      verified: false,
    },
    {
      name: 'Ayesha Karim',
      email: 'ayesha.karim@bup.edu.bd',
      password,
      role: 'student',
      department: 'CSE',
      batch: 'BICE-2023',
      studentId: '23549011021',
      bio: 'CSE undergraduate looking for a thesis on Bangla text. Comparing faculty who work on language, data, and evaluation.',
      researchInterests: ['Natural Language Processing', 'Data Science'],
      academicBackground: 'B.Sc. in CSE, BICE-2023, Bangladesh University of Professionals.',
      verified: true,
    },
    {
      name: 'Farhan Siddique',
      email: 'farhan.siddique@bup.edu.bd',
      password,
      role: 'student',
      department: 'ICT',
      batch: 'BICE-2024',
      studentId: '24549011088',
      bio: 'ICT student interested in security and campus networks. Wants a supervisor who expects a measurement or a detection baseline.',
      researchInterests: ['Cybersecurity', 'Computer Networks'],
      academicBackground: 'B.Sc. in ICT, BICE-2024, Bangladesh University of Professionals.',
      verified: true,
    },
  ]);

  const by = Object.fromEntries(people.map((person) => [person.email, person]));

  await Publication.create([
    pub(by['sharmeen.seema@bup.edu.bd'], {
      title: 'What a Bangla sentiment thesis needs before the model',
      authors: ['Sharmeen Jahan Seema', 'Mehzabin Chowdhury'],
      venue: 'BUP FST student research colloquium',
      year: 2024,
      abstract: 'A short departmental note on annotation guidelines, train and test splits, and error slices for Bangla review text.',
      researchAreas: ['Natural Language Processing', 'Data Science'],
    }),
    pub(by['istakiak.palash@bup.edu.bd'], {
      title: 'A checklist for tracing requirements in final-year software projects',
      authors: ['Md. Istakiak Adnan Palash'],
      venue: 'ICT departmental technical report',
      year: 2025,
      abstract: 'Describes a lightweight checklist students can use to connect a research question, a requirement, and a test.',
      researchAreas: ['Software Engineering'],
    }),
    pub(by['farzana.haque@bup.edu.bd'], {
      title: 'Phishing pages that copy Bangladeshi university login screens',
      authors: ['Farzana Haque', 'Adnan Karim'],
      venue: 'CSE security reading group note',
      year: 2025,
      abstract: 'Illustrative note on visual and URL cues in fake campus login pages. Seed content, not an external journal paper.',
      researchAreas: ['Cybersecurity'],
    }),
    pub(by['tanvir.hossain@bup.edu.bd'], {
      title: 'Occupancy from one classroom camera',
      authors: ['Tanvir Hossain'],
      venue: 'CSE vision lab technical report',
      year: 2024,
      abstract: 'Reports a small baseline for counting people in a classroom with a fixed camera and a public detector.',
      researchAreas: ['Computer Vision'],
    }),
    pub(by['nusrat.jahan@bup.edu.bd'], {
      title: 'Peak-hour contention on the student Wi-Fi network',
      authors: ['Nusrat Jahan', 'Sabbir Rahman'],
      venue: 'CSE networks lab technical report',
      year: 2023,
      abstract: 'Summarizes a week of campus latency samples and the hours where loss clustered.',
      researchAreas: ['Computer Networks'],
    }),
    pub(by['rafid.hasan@bup.edu.bd'], {
      title: 'Recording protocol for short Bangla voice commands',
      authors: ['Rafid Hasan', 'Lamia Sultana'],
      venue: 'ICT signal lab note',
      year: 2024,
      abstract: 'A protocol for room, microphone, and speaker balance when a thesis collects Bangla commands.',
      researchAreas: ['Communication Systems'],
    }),
    pub(by['mahia.rahman@bup.edu.bd'], {
      title: 'Searching a pile of undergraduate thesis abstracts',
      authors: ['Mahia Rahman'],
      venue: 'CSE departmental technical report',
      year: 2025,
      abstract: 'Compares keyword overlap and a small embedding index on a sample of CSE and ICT abstracts.',
      researchAreas: ['Natural Language Processing'],
    }),
    pub(by['imran.kabir@bup.edu.bd'], {
      title: 'How final-year students describe a thesis topic',
      authors: ['Imran Kabir'],
      venue: 'ICT studio interview report',
      year: 2023,
      abstract: 'Notes from interviews about where students look before they email a supervisor.',
      researchAreas: ['Human-Computer Interaction'],
    }),
    pub(by['mehzabin.chowdhury@bup.edu.bd'], {
      title: 'Error slices that changed a Bangla review classifier',
      authors: ['Mehzabin Chowdhury'],
      venue: 'Alumni thesis talk, BUP CSE',
      year: 2021,
      abstract: 'Alumni talk on the examples that accuracy hid: mixed sentiment, code-switched lines, and very short reviews.',
      researchAreas: ['Machine Learning', 'Natural Language Processing'],
    }),
    pub(by['adnan.karim@bup.edu.bd'], {
      title: 'Turning a security course project into a readable portfolio piece',
      authors: ['Adnan Karim'],
      venue: 'Alumni mentoring note',
      year: 2022,
      abstract: 'A practical note for students writing up a phishing or authentication project for both a defense and a job application.',
      researchAreas: ['Cybersecurity'],
    }),
  ]);

  await Opportunity.create([
    call(by['sharmeen.seema@bup.edu.bd'], {
      title: 'Bangla sentiment for campus service feedback',
      summary: 'Build and evaluate a small sentiment model on Bangla feedback from campus services.',
      description:
        'The thesis will define an annotation guide, label a modest set of Bangla comments, and compare two classical or small neural baselines. The contribution is the dataset decisions and the error analysis, not a leaderboard score.',
      researchAreas: ['Natural Language Processing', 'Data Science'],
      department: 'ICT',
      slots: 2,
      status: 'open',
      requirements: 'Python, a short writing sample, and time for annotation. Prior deep learning coursework is useful, not required.',
      deadline: new Date('2026-12-15'),
    }),
    call(by['farzana.haque@bup.edu.bd'], {
      title: 'Phishing pages that imitate university portals',
      summary: 'Detect login pages that copy Bangladeshi university portals, and explain the failures.',
      description:
        'Students will collect a labeled set of real and lookalike login pages, then test URL, visual, and text features. A good thesis will show which cues break first when the page is translated or lightly edited.',
      researchAreas: ['Cybersecurity'],
      department: 'CSE',
      slots: 2,
      status: 'open',
      requirements: 'Interest in web security and careful data handling. Do not collect credentials. The study uses public pages only.',
      deadline: new Date('2026-11-30'),
    }),
    call(by['tanvir.hossain@bup.edu.bd'], {
      title: 'Camera check for lab safety compliance',
      summary: 'One fixed camera should flag missing coats or blocked exits in a teaching lab.',
      description:
        'Scope is a single lab, a fixed camera, and a written definition of the safety events. The thesis compares a simple detector with a manual audit on a recorded hour.',
      researchAreas: ['Computer Vision'],
      department: 'CSE',
      slots: 1,
      status: 'open',
      requirements: 'Comfort with Python and a willingness to film an empty lab before any class recording.',
      deadline: new Date('2026-11-20'),
    }),
    call(by['nusrat.jahan@bup.edu.bd'], {
      title: 'Campus Wi-Fi quality under peak load',
      summary: 'Filled. The measurement plan and the trace for this call are already assigned.',
      description:
        'This call collected a week of latency and loss samples across two academic buildings. It is listed so students can see a filled example and the kind of trace a network thesis expects.',
      researchAreas: ['Computer Networks'],
      department: 'CSE',
      slots: 1,
      status: 'filled',
      requirements: 'Closed to new students.',
      deadline: new Date('2026-08-01'),
    }),
    call(by['rafid.hasan@bup.edu.bd'], {
      title: 'Bangla speaker identification for short voice notes',
      summary: 'Identify speakers from a few seconds of Bangla speech recorded on a phone.',
      description:
        'The student will follow the lab recording protocol, balance speakers, and report how accuracy drops when the note is shorter than three seconds.',
      researchAreas: ['Communication Systems', 'Machine Learning'],
      department: 'ICT',
      slots: 2,
      status: 'open',
      requirements: 'Willingness to recruit speakers and document consent. Signal processing background helps.',
      deadline: new Date('2027-01-10'),
    }),
    call(by['istakiak.palash@bup.edu.bd'], {
      title: 'A directory of faculty expertise from paper titles',
      summary: 'Turn public paper titles into a searchable expertise profile for ICT faculty.',
      description:
        'Design a small pipeline and an interface that a student can trust. The thesis must show wrong tags, not only a demo. Evaluation is with faculty who correct their own profile.',
      researchAreas: ['Software Engineering', 'Natural Language Processing'],
      department: 'ICT',
      slots: 2,
      status: 'open',
      requirements: 'A software engineering course and a sample of careful UI writing.',
      deadline: new Date('2026-12-01'),
    }),
    call(by['mahia.rahman@bup.edu.bd'], {
      title: 'Question answering over thesis abstracts',
      summary: 'Ask questions against a local set of CSE and ICT thesis abstracts.',
      description:
        'Index a curated set of abstracts and compare keyword search with a small retriever. The thesis stops at retrieval quality and cited abstracts. It does not generate unsupervised answers.',
      researchAreas: ['Natural Language Processing', 'Artificial Intelligence'],
      department: 'CSE',
      slots: 1,
      status: 'open',
      requirements: 'Interest in search and evaluation. Bring one research question you wish the archive could answer.',
      deadline: new Date('2026-12-20'),
    }),
    call(by['mehzabin.chowdhury@bup.edu.bd'], {
      title: 'How to scope a Bangla text thesis',
      summary: 'An alumni office hour for students who want a finishable language project, not a giant model.',
      description:
        'Mehzabin will read a one-page plan and say what to cut. This is a mentoring seat from an alumnus, not a faculty thesis allocation.',
      researchAreas: ['Natural Language Processing', 'Machine Learning'],
      department: 'CSE',
      slots: 2,
      status: 'open',
      requirements: 'A one-page plan and one dataset you could actually label.',
      deadline: new Date('2026-12-18'),
    }),
    call(by['nusrat.jahan@bup.edu.bd'], {
      title: 'Classroom air-quality node',
      summary: 'Closed. The sensor build was not repeated after the pilot semester.',
      description:
        'A previous call for a low-cost air-quality node in two classrooms. Kept in the list so the closed status is visible in filters.',
      researchAreas: ['Internet of Things'],
      department: 'CSE',
      slots: 1,
      status: 'closed',
      requirements: 'Not accepting students.',
      deadline: null,
    }),
  ]);

  await Project.create([
    project(by['admin@bup.edu.bd'], by['sharmeen.seema@bup.edu.bd'], {
      title: 'Classification of Bangla food reviews',
      abstract:
        'Labeled Bangla food reviews from public posts and compared two classifiers. The useful result was the error slice: mixed sentiment and very short lines, not the headline accuracy.',
      year: 2024,
      department: 'ICT',
      researchAreas: ['Natural Language Processing', 'Machine Learning'],
      authors: 'Mehzabin Chowdhury',
      type: 'thesis',
      verified: true,
      outcome: 'Defended. Alumni talk archived in the publication list.',
    }),
    project(by['admin@bup.edu.bd'], by['farzana.haque@bup.edu.bd'], {
      title: 'A phishing URL baseline for education sites',
      abstract:
        'Collected public lookalike pages aimed at campus portals and reported which URL features still fired after light editing.',
      year: 2025,
      department: 'CSE',
      researchAreas: ['Cybersecurity'],
      authors: 'Adnan Karim',
      type: 'project',
      verified: true,
      outcome: 'Course project extended into an alumni mentoring note.',
    }),
    project(by['admin@bup.edu.bd'], by['tanvir.hossain@bup.edu.bd'], {
      title: 'Occupancy estimation from a single classroom camera',
      abstract:
        'Fixed-camera count of people in one classroom. Compared a public detector against a manual tally for one teaching hour.',
      year: 2024,
      department: 'CSE',
      researchAreas: ['Computer Vision'],
      authors: 'Nafisa Anjum',
      type: 'thesis',
      verified: true,
      outcome: 'Defended. Lab report shared with the vision group.',
    }),
    project(by['admin@bup.edu.bd'], by['nusrat.jahan@bup.edu.bd'], {
      title: 'Latency map of the student Wi-Fi network',
      abstract:
        'Week-long probe of two academic buildings. Loss clustered in the late afternoon on the floor nearest the canteen.',
      year: 2023,
      department: 'CSE',
      researchAreas: ['Computer Networks'],
      authors: 'Sabbir Rahman',
      type: 'thesis',
      verified: true,
      outcome: 'Trace retained in the networks lab.',
    }),
    project(by['admin@bup.edu.bd'], by['istakiak.palash@bup.edu.bd'], {
      title: 'Requirements checklist for final-year projects',
      abstract:
        'A small web checklist that links a research question to requirements and tests. Evaluated with one ICT project group.',
      year: 2025,
      department: 'ICT',
      researchAreas: ['Software Engineering'],
      authors: 'Tanisha Noor',
      type: 'project',
      verified: true,
      outcome: 'Pilot used by one project group.',
    }),
    project(by['admin@bup.edu.bd'], by['rafid.hasan@bup.edu.bd'], {
      title: 'Bangla command recognition for lab equipment',
      abstract:
        'Short spoken commands recorded with the lab protocol. Accuracy fell once commands dropped under two seconds.',
      year: 2024,
      department: 'ICT',
      researchAreas: ['Communication Systems'],
      authors: 'Lamia Sultana',
      type: 'thesis',
      verified: true,
      outcome: 'Defended. Recording protocol reused by the signal lab.',
    }),
    project(by['admin@bup.edu.bd'], by['imran.kabir@bup.edu.bd'], {
      title: 'How students pick a thesis topic',
      abstract:
        'Interviews with final-year ICT students about the week they chose a topic. Most started from a senior, not from a faculty page.',
      year: 2023,
      department: 'ICT',
      researchAreas: ['Human-Computer Interaction'],
      authors: 'Rumaisa Haque',
      type: 'thesis',
      verified: true,
      outcome: 'Interview notes held by the ICT studio.',
    }),
    project(by['admin@bup.edu.bd'], by['mahia.rahman@bup.edu.bd'], {
      title: 'Retrieval over CSE thesis abstracts',
      abstract:
        'A draft index of thesis abstracts. Waiting for an administrator to confirm the abstract list before students rely on it.',
      year: 2025,
      department: 'CSE',
      researchAreas: ['Natural Language Processing'],
      authors: 'Arif Mahmud',
      type: 'project',
      verified: false,
      outcome: 'Pending verification.',
    }),
  ]);

  const ayesha = by['ayesha.karim@bup.edu.bd'];
  const farhan = by['farhan.siddique@bup.edu.bd'];
  const seema = by['sharmeen.seema@bup.edu.bd'];
  const farzana = by['farzana.haque@bup.edu.bd'];
  const mehzabin = by['mehzabin.chowdhury@bup.edu.bd'];

  const [, acceptedMentoring] = await Request.create([
    {
      from: ayesha.id,
      to: seema.id,
      kind: 'thesis',
      status: 'pending',
      topic: 'Bangla sentiment for campus service feedback',
      message:
        'I am a CSE student in BICE-2023. I have coursework in machine learning and I want the sentiment thesis, especially the annotation and error analysis. I can share a one-page plan this week.',
    },
    {
      from: farhan.id,
      to: farzana.id,
      kind: 'mentorship',
      status: 'accepted',
      topic: 'Phishing pages that imitate university portals',
      message:
        'I want to understand the data collection rules before I apply for the phishing thesis. I will not collect credentials.',
      responseNote: 'Come to the reading group on Sunday. Bring a page you think is a lookalike and we will label it together.',
    },
    {
      from: ayesha.id,
      to: mehzabin.id,
      kind: 'collaboration',
      status: 'pending',
      topic: 'How you sliced errors in the food-review thesis',
      message:
        'Could you walk me through the error slices from your thesis before I email a supervisor? I want to copy the habit, not the dataset.',
    },
  ]);

  await Message.create([
    {
      request: acceptedMentoring.id,
      from: farzana.id,
      body: 'Come to the reading group on Sunday. Bring a page you think is a lookalike and we will label it together.',
      createdAt: new Date('2026-09-14T04:00:00.000Z'),
      updatedAt: new Date('2026-09-14T04:00:00.000Z'),
    },
    {
      request: acceptedMentoring.id,
      from: farhan.id,
      body: 'I will bring a public lookalike page. I will not store login forms, only the visible page text.',
      createdAt: new Date('2026-09-15T09:20:00.000Z'),
      updatedAt: new Date('2026-09-15T09:20:00.000Z'),
    },
  ]);

  await Notification.create([
    {
      user: seema.id,
      title: 'Ayesha Karim sent a thesis request',
      body: 'Bangla sentiment for campus service feedback',
      link: '/requests',
      kind: 'request',
      read: false,
    },
    {
      user: farhan.id,
      title: 'Dr. Farzana Haque accepted your request',
      body: 'Phishing pages that imitate university portals',
      link: '/requests',
      kind: 'request',
      read: false,
    },
    {
      user: mehzabin.id,
      title: 'Ayesha Karim sent a collaboration request',
      body: 'How you sliced errors in the food-review thesis',
      link: '/requests',
      kind: 'request',
      read: false,
    },
    {
      user: ayesha.id,
      title: 'Three faculty match Natural Language Processing',
      body: 'Seema, Mahia, and Palash list language among their interests.',
      link: '/people?role=faculty&area=Natural%20Language%20Processing',
      kind: 'info',
      read: false,
    },
  ]);

  console.log('Seeded BUP Research Nexus.');
  console.log('Demo password for every sample account: Nexus@2026');
}

function pub(owner, data) {
  return { ...data, owner: owner.id, department: owner.department, url: '' };
}

function call(supervisor, data) {
  return { ...data, supervisor: supervisor.id };
}

function project(admin, supervisor, data) {
  return { ...data, supervisor: supervisor.id, createdBy: admin.id };
}
