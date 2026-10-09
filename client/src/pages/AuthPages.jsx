import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from '../constants';
import { Banner, Button, Field, controlClass } from '../components/ui';

function destination(location) {
  return location.state?.from || '/';
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await login(email, password);
      navigate(destination(location));
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[0.9fr_1.1fr]">
      <section>
        <p className="text-xs uppercase tracking-[0.18em] text-gold">Sign in</p>
        <h1 className="mt-2 font-serif text-5xl">Pick up the search where you left it.</h1>
        <p className="mt-3 text-sm leading-6 text-mist">
          Students request supervisors. Faculty answer those requests and post thesis calls. Alumni share what the work was actually like.
        </p>
        <div className="mt-6 space-y-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              className="flex w-full items-center justify-between rounded-2xl border border-line bg-panel px-4 py-3 text-left hover:border-gold/40"
              onClick={() => {
                setEmail(account.email);
                setPassword(DEMO_PASSWORD);
              }}
            >
              <span>
                <span className="block text-sm font-semibold">{account.role}</span>
                <span className="block text-xs text-mist">{account.email}</span>
              </span>
              <span className="text-xs text-gold">{account.note}</span>
            </button>
          ))}
          <p className="text-xs text-mist">Every sample account uses the password {DEMO_PASSWORD}.</p>
        </div>
      </section>
      <form onSubmit={submit} className="rounded-3xl border border-line bg-panel p-6">
        <div className="space-y-4">
          <Field label="Email">
            <input className={controlClass} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
          </Field>
          <Field label="Password">
            <input className={controlClass} type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </Field>
          {error ? <Banner tone="rose">{error}</Banner> : null}
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? 'Signing in…' : 'Sign in'}
          </Button>
          <p className="text-sm text-mist">
            New here?{' '}
            <Link to="/register" className="font-semibold text-gold">
              Create an account
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
    department: 'CSE',
    batch: '',
    studentId: '',
    designation: '',
    organization: '',
    researchInterests: '',
  });
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setPending(true);
    setError('');
    try {
      await register({ ...form, researchInterests: form.researchInterests.split(',').map((item) => item.trim()).filter(Boolean) });
      navigate(destination(location));
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-xs uppercase tracking-[0.18em] text-gold">Create an account</p>
      <h1 className="mt-2 font-serif text-5xl">Join the CSE and ICT research directory.</h1>
      <p className="mt-3 text-sm leading-6 text-mist">
        Faculty and alumni profiles stay hidden from mentoring until an administrator verifies them. Student accounts can search and request immediately.
      </p>
      <form onSubmit={submit} className="mt-6 space-y-4 rounded-3xl border border-line bg-panel p-6">
        <div className="grid grid-cols-3 gap-2">
          {['student', 'faculty', 'alumni'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => set('role', role)}
              className={`rounded-full border px-3 py-2 text-sm capitalize ${form.role === role ? 'border-gold bg-gold/15 text-gold-2' : 'border-line text-mist'}`}
            >
              {role}
            </button>
          ))}
        </div>
        <Field label="Full name">
          <input className={controlClass} value={form.name} onChange={(event) => set('name', event.target.value)} required minLength={2} />
        </Field>
        <Field label="Email">
          <input className={controlClass} type="email" value={form.email} onChange={(event) => set('email', event.target.value)} required />
        </Field>
        <Field label="Password" hint="At least 8 characters.">
          <input className={controlClass} type="password" value={form.password} onChange={(event) => set('password', event.target.value)} required minLength={8} />
        </Field>
        <Field label="Department">
          <select className={controlClass} value={form.department} onChange={(event) => set('department', event.target.value)}>
            <option value="CSE">CSE — Computer Science and Engineering</option>
            <option value="ICT">ICT — Information and Communication Technology</option>
          </select>
        </Field>
        {form.role === 'student' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Batch">
              <input className={controlClass} value={form.batch} onChange={(event) => set('batch', event.target.value)} placeholder="BICE-2023" />
            </Field>
            <Field label="Student ID">
              <input className={controlClass} value={form.studentId} onChange={(event) => set('studentId', event.target.value)} />
            </Field>
          </div>
        ) : null}
        {form.role === 'faculty' ? (
          <Field label="Designation">
            <input className={controlClass} value={form.designation} onChange={(event) => set('designation', event.target.value)} placeholder="Lecturer" />
          </Field>
        ) : null}
        {form.role === 'alumni' ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Batch">
              <input className={controlClass} value={form.batch} onChange={(event) => set('batch', event.target.value)} placeholder="BICE-2021" />
            </Field>
            <Field label="Current work">
              <input className={controlClass} value={form.organization} onChange={(event) => set('organization', event.target.value)} />
            </Field>
          </div>
        ) : null}
        <Field label="Research interests" hint="Separate areas with commas.">
          <input className={controlClass} value={form.researchInterests} onChange={(event) => set('researchInterests', event.target.value)} placeholder="Cybersecurity, Computer Networks" />
        </Field>
        {error ? <Banner tone="rose">{error}</Banner> : null}
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? 'Creating account…' : 'Create account'}
        </Button>
        <p className="text-sm text-mist">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-gold">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
