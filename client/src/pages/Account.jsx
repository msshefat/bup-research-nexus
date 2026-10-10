import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { AREAS } from '../constants';
import { Guard } from '../components/Layout';
import { Badge, Banner, Button, Field, controlClass, statusTone } from '../components/ui';

export function Account() {
  return (
    <Guard>
      <AccountForm />
    </Guard>
  );
}

function AccountForm() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [password, setPassword] = useState({ currentPassword: '', newPassword: '' });
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || '',
      department: user.department || 'CSE',
      batch: user.batch || '',
      studentId: user.studentId || '',
      designation: user.designation || '',
      organization: user.organization || '',
      office: user.office || '',
      bio: user.bio || '',
      academicBackground: user.academicBackground || '',
      researchExperience: user.researchExperience || '',
      researchInterests: (user.researchInterests || []).join(', '),
      expertise: (user.expertise || []).join(', '),
      mentoringAvailable: Boolean(user.mentoringAvailable),
    });
  }, [user]);

  if (!form) return null;

  function set(key, value) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function save(event) {
    event.preventDefault();
    setPending(true);
    setError('');
    setMessage('');
    try {
      const updated = await api('/api/auth/me', {
        method: 'PATCH',
        body: {
          ...form,
          researchInterests: form.researchInterests.split(',').map((item) => item.trim()).filter(Boolean),
          expertise: form.expertise.split(',').map((item) => item.trim()).filter(Boolean),
        },
      });
      setUser(updated);
      setMessage('Profile saved.');
    } catch (err) {
      setError(err.message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-gold">{user.role}</p>
        <h1 className="mt-2 font-serif text-5xl">Your research profile</h1>
        <p className="mt-2 text-sm text-mist">{user.email}</p>
        {['student', 'faculty', 'alumni'].includes(user.role) ? (
          <Link to="/running" className="mt-4 inline-flex rounded-full bg-gold px-4 py-2 text-sm font-semibold text-on-gold">
            Running opportunities and mentoring
          </Link>
        ) : null}
      </div>
      {user.role !== 'student' && user.role !== 'admin' && !user.verified ? (
        <Banner>An administrator still needs to verify this profile. You can edit it now. Publications, thesis calls, and student requests open after verification.</Banner>
      ) : null}
      {message ? <Banner>{message}</Banner> : null}
      {error ? <Banner tone="rose">{error}</Banner> : null}

      <form onSubmit={save} className="grid gap-4 rounded-3xl border border-line bg-panel p-5 md:grid-cols-2">
        <Field label="Name">
          <input className={controlClass} value={form.name} onChange={(event) => set('name', event.target.value)} required />
        </Field>
        <Field label="Department">
          <select className={controlClass} value={form.department} onChange={(event) => set('department', event.target.value)}>
            <option value="CSE">CSE</option>
            <option value="ICT">ICT</option>
          </select>
        </Field>
        <Field label="Batch">
          <input className={controlClass} value={form.batch} onChange={(event) => set('batch', event.target.value)} />
        </Field>
        {user.role === 'student' ? (
          <Field label="Student ID">
            <input className={controlClass} value={form.studentId} onChange={(event) => set('studentId', event.target.value)} />
          </Field>
        ) : null}
        {user.role === 'faculty' ? (
          <Field label="Designation">
            <input className={controlClass} value={form.designation} onChange={(event) => set('designation', event.target.value)} />
          </Field>
        ) : null}
        {user.role === 'alumni' ? (
          <Field label="Current work">
            <input className={controlClass} value={form.organization} onChange={(event) => set('organization', event.target.value)} />
          </Field>
        ) : null}
        <Field label="Office">
          <input className={controlClass} value={form.office} onChange={(event) => set('office', event.target.value)} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Short bio">
            <textarea className={`${controlClass} min-h-28`} value={form.bio} onChange={(event) => set('bio', event.target.value)} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Academic background">
            <textarea className={`${controlClass} min-h-24`} value={form.academicBackground} onChange={(event) => set('academicBackground', event.target.value)} />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Field label="Research experience">
            <textarea className={`${controlClass} min-h-24`} value={form.researchExperience} onChange={(event) => set('researchExperience', event.target.value)} />
          </Field>
        </div>
        <Field label="Research interests" hint="Comma separated. These power search.">
          <input className={controlClass} value={form.researchInterests} onChange={(event) => set('researchInterests', event.target.value)} />
        </Field>
        <Field label="Expertise">
          <input className={controlClass} value={form.expertise} onChange={(event) => set('expertise', event.target.value)} />
        </Field>
        {['faculty', 'alumni'].includes(user.role) ? (
          <label className="flex items-center gap-2 text-sm md:col-span-2">
            <input type="checkbox" checked={form.mentoringAvailable} onChange={(event) => set('mentoringAvailable', event.target.checked)} />
            I am available for new mentoring or collaboration requests
          </label>
        ) : null}
        <div className="md:col-span-2">
          <Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save profile'}</Button>
        </div>
      </form>

      <form
        className="max-w-xl space-y-4 rounded-3xl border border-line bg-panel p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setPasswordMessage('');
          try {
            const result = await api('/api/auth/me/password', { method: 'PATCH', body: password });
            setPasswordMessage(result.message);
            setPassword({ currentPassword: '', newPassword: '' });
          } catch (err) {
            setPasswordMessage(err.message);
          }
        }}
      >
        <h2 className="font-serif text-3xl">Password</h2>
        <Field label="Current password">
          <input type="password" className={controlClass} value={password.currentPassword} onChange={(event) => setPassword((current) => ({ ...current, currentPassword: event.target.value }))} required />
        </Field>
        <Field label="New password">
          <input type="password" className={controlClass} value={password.newPassword} onChange={(event) => setPassword((current) => ({ ...current, newPassword: event.target.value }))} required minLength={8} />
        </Field>
        {passwordMessage ? <p className="text-sm text-mist">{passwordMessage}</p> : null}
        <Button type="submit" variant="ghost">Update password</Button>
      </form>

      {['faculty', 'alumni'].includes(user.role) ? <PublicationDesk user={user} /> : null}
      {['faculty', 'alumni'].includes(user.role) ? <OpportunityDesk user={user} /> : null}
    </div>
  );
}

function PublicationDesk({ user }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', authors: user.name, venue: '', year: 2026, abstract: '', researchAreas: [] });

  function load() {
    api(`/api/publications?owner=${user._id}`)
      .then(setItems)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, [user._id]);

  return (
    <section className="space-y-4">
      <h2 className="font-serif text-3xl">Your papers and notes</h2>
      {error ? <Banner tone="rose">{error}</Banner> : null}
      <form
        className="grid gap-3 rounded-3xl border border-line bg-panel p-5 md:grid-cols-2"
        onSubmit={async (event) => {
          event.preventDefault();
          setError('');
          try {
            await api('/api/publications', {
              method: 'POST',
              body: {
                ...form,
                year: Number(form.year),
                authors: form.authors.split(',').map((item) => item.trim()).filter(Boolean),
              },
            });
            setForm({ title: '', authors: user.name, venue: '', year: 2026, abstract: '', researchAreas: [] });
            load();
          } catch (err) {
            setError(err.message);
          }
        }}
      >
        <Field label="Title">
          <input className={controlClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        </Field>
        <Field label="Year">
          <input className={controlClass} value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} required />
        </Field>
        <Field label="Authors" hint="Comma separated">
          <input className={controlClass} value={form.authors} onChange={(event) => setForm({ ...form, authors: event.target.value })} />
        </Field>
        <Field label="Venue">
          <input className={controlClass} value={form.venue} onChange={(event) => setForm({ ...form, venue: event.target.value })} />
        </Field>
        <div className="md:col-span-2">
          <Field label="Abstract">
            <textarea className={`${controlClass} min-h-24`} value={form.abstract} onChange={(event) => setForm({ ...form, abstract: event.target.value })} />
          </Field>
        </div>
        <AreaPicker selected={form.researchAreas} onChange={(researchAreas) => setForm({ ...form, researchAreas })} />
        <div className="md:col-span-2">
          <Button type="submit">Add publication</Button>
        </div>
      </form>
      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item._id} className="flex items-start justify-between gap-3 rounded-2xl border border-line bg-panel px-4 py-3">
            <span>
              <span className="block font-medium">{item.title}</span>
              <span className="text-sm text-mist">{item.year} · {item.venue}</span>
            </span>
            <Button
              variant="danger"
              onClick={async () => {
                if (!window.confirm('Remove this publication?')) return;
                await api(`/api/publications/${item._id}`, { method: 'DELETE' });
                load();
              }}
            >
              Remove
            </Button>
          </li>
        ))}
      </ul>
    </section>
  );
}

function OpportunityDesk({ user }) {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    summary: '',
    description: '',
    requirements: '',
    department: user.department || 'CSE',
    slots: 1,
    status: 'open',
    deadline: '',
    researchAreas: [],
  });

  function load() {
    api(`/api/opportunities?supervisor=${user._id}`)
      .then(setItems)
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, [user._id]);

  return (
    <section className="space-y-4">
      <h2 className="font-serif text-3xl">Opportunities you posted</h2>
      {error ? <Banner tone="rose">{error}</Banner> : null}
      <form
        className="grid gap-3 rounded-3xl border border-line bg-panel p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setError('');
          try {
            await api('/api/opportunities', {
              method: 'POST',
              body: { ...form, slots: Number(form.slots), deadline: form.deadline || null },
            });
            setForm({ ...form, title: '', summary: '', description: '', requirements: '', researchAreas: [] });
            load();
          } catch (err) {
            setError(err.message);
          }
        }}
      >
        <Field label="Title">
          <input className={controlClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        </Field>
        <Field label="Summary">
          <input className={controlClass} value={form.summary} onChange={(event) => setForm({ ...form, summary: event.target.value })} required />
        </Field>
        <Field label="Description">
          <textarea className={`${controlClass} min-h-28`} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required />
        </Field>
        <Field label="What you expect from the student">
          <textarea className={`${controlClass} min-h-20`} value={form.requirements} onChange={(event) => setForm({ ...form, requirements: event.target.value })} />
        </Field>
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Department">
            <select className={controlClass} value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })}>
              <option value="CSE">CSE</option>
              <option value="ICT">ICT</option>
            </select>
          </Field>
          <Field label="Seats">
            <input className={controlClass} type="number" min="1" max="20" value={form.slots} onChange={(event) => setForm({ ...form, slots: event.target.value })} />
          </Field>
          <Field label="Deadline">
            <input className={controlClass} type="date" value={form.deadline} onChange={(event) => setForm({ ...form, deadline: event.target.value })} />
          </Field>
        </div>
        <AreaPicker selected={form.researchAreas} onChange={(researchAreas) => setForm({ ...form, researchAreas })} />
        <Button type="submit">Post opportunity</Button>
      </form>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item._id} className="rounded-2xl border border-line bg-panel p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-medium">{item.title}</p>
              <Badge tone={statusTone(item.status)}>{item.status}</Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button
                variant="ghost"
                onClick={async () => {
                  const next = item.status === 'closed' ? 'open' : 'closed';
                  await api(`/api/opportunities/${item._id}`, { method: 'PUT', body: { status: next } });
                  load();
                }}
              >
                {item.status === 'closed' ? 'Open again' : 'Close'}
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  if (!window.confirm('Delete this opportunity and its applications?')) return;
                  await api(`/api/opportunities/${item._id}`, { method: 'DELETE' });
                  load();
                }}
              >
                Delete
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function AreaPicker({ selected, onChange }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">Research areas</legend>
      <div className="flex flex-wrap gap-2">
        {AREAS.map((area) => {
          const on = selected.includes(area);
          return (
            <button
              key={area}
              type="button"
              onClick={() => onChange(on ? selected.filter((item) => item !== area) : [...selected, area])}
              className={`rounded-full border px-3 py-1 text-xs ${on ? 'border-gold bg-gold/15 text-gold-2' : 'border-line text-mist'}`}
            >
              {area}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
