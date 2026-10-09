import { useEffect, useState } from 'react';
import { api } from '../api';
import { AREAS } from '../constants';
import { Guard } from '../components/Layout';
import { Badge, Banner, Button, Empty, ErrorNote, Field, Loading, controlClass } from '../components/ui';

export function Admin() {
  return (
    <Guard role="admin">
      <AdminDesk />
    </Guard>
  );
}

function AdminDesk() {
  const [tab, setTab] = useState('overview');
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-gold">Administration</p>
      <h1 className="mt-2 font-serif text-5xl">Keep the directory honest.</h1>
      <div className="mt-5 flex flex-wrap gap-2">
        {['overview', 'people', 'theses'].map((item) => (
          <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-full px-4 py-2 text-sm capitalize ${tab === item ? 'bg-gold text-ink' : 'border border-line'}`}>
            {item}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tab === 'overview' ? <Overview /> : null}
        {tab === 'people' ? <PeopleModeration /> : null}
        {tab === 'theses' ? <ThesisModeration /> : null}
      </div>
    </div>
  );
}

function Overview() {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  function load() {
    api('/api/admin/overview')
      .then((data) => setState({ loading: false, error: '', data }))
      .catch((error) => setState({ loading: false, error: error.message, data: null }));
  }

  useEffect(() => {
    load();
  }, []);

  if (state.loading) return <Loading label="Loading statistics" />;
  if (state.error) return <ErrorNote message={state.error} onRetry={load} />;
  const data = state.data;
  const maxArea = Math.max(...data.areas.map((area) => area.count), 1);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Faculty', data.roles.faculty || 0],
          ['Alumni', data.roles.alumni || 0],
          ['Students', data.roles.student || 0],
          ['Awaiting verification', data.pendingProfiles || 0],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-panel p-4">
            <p className="text-xs uppercase tracking-wider text-mist">{label}</p>
            <p className="font-serif text-4xl text-gold">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-panel p-4">
          <h2 className="font-serif text-2xl">Requests</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {['pending', 'accepted', 'rejected'].map((status) => (
              <li key={status} className="flex justify-between capitalize">
                <span>{status}</span>
                <span>{data.requests[status] || 0}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="rounded-2xl border border-line bg-panel p-4">
          <h2 className="font-serif text-2xl">Thesis calls</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {['open', 'filled', 'closed'].map((status) => (
              <li key={status} className="flex justify-between capitalize">
                <span>{status}</span>
                <span>{data.opportunities[status] || 0}</span>
              </li>
            ))}
            <li className="flex justify-between">
              <span>Papers</span>
              <span>{data.publications}</span>
            </li>
          </ul>
        </section>
      </div>
      <section className="rounded-2xl border border-line bg-panel p-4">
        <h2 className="font-serif text-2xl">Interests named by faculty and alumni</h2>
        <div className="mt-4 space-y-3">
          {data.areas.length === 0 ? <p className="text-sm text-mist">No interests yet.</p> : null}
          {data.areas.map((area) => (
            <div key={area.name}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{area.name}</span>
                <span className="text-mist">{area.count}</span>
              </div>
              <div className="h-2 rounded-full bg-ink">
                <div className="h-2 rounded-full bg-gold" style={{ width: `${(area.count / maxArea) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function PeopleModeration() {
  const [state, setState] = useState({ loading: true, error: '', data: [] });
  const [message, setMessage] = useState('');

  function load() {
    api('/api/admin/users')
      .then((data) => setState({ loading: false, error: '', data }))
      .catch((error) => setState({ loading: false, error: error.message, data: [] }));
  }

  useEffect(() => {
    load();
  }, []);

  async function patch(id, body) {
    setMessage('');
    try {
      await api(`/api/admin/users/${id}`, { method: 'PATCH', body });
      setMessage('Account updated.');
      load();
    } catch (error) {
      setMessage(error.message);
    }
  }

  if (state.loading) return <Loading label="Loading accounts" />;
  if (state.error) return <ErrorNote message={state.error} onRetry={load} />;

  return (
    <div className="space-y-3">
      {message ? <Banner>{message}</Banner> : null}
      {state.data.map((person) => (
        <article key={person._id} className="flex flex-col gap-3 rounded-2xl border border-line bg-panel p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium">{person.name}</p>
            <p className="text-sm text-mist">{person.email} · {person.role} · {person.department || 'no department'}</p>
            <div className="mt-2 flex gap-1.5">
              <Badge tone={person.verified ? 'teal' : 'gold'}>{person.verified ? 'Verified' : 'Unverified'}</Badge>
              <Badge tone={person.active ? 'mist' : 'rose'}>{person.active ? 'Active' : 'Inactive'}</Badge>
            </div>
          </div>
          {person.role !== 'admin' ? (
            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => patch(person._id, { verified: !person.verified })}>
                {person.verified ? 'Unverify' : 'Verify'}
              </Button>
              <Button variant="danger" onClick={() => patch(person._id, { active: !person.active })}>
                {person.active ? 'Deactivate' : 'Restore'}
              </Button>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function ThesisModeration() {
  const [projects, setProjects] = useState([]);
  const [papers, setPapers] = useState([]);
  const [faculty, setFaculty] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    title: '',
    abstract: '',
    authors: '',
    year: 2026,
    department: 'CSE',
    type: 'thesis',
    supervisor: '',
    outcome: '',
    researchAreas: [],
    verified: true,
  });

  function load() {
    Promise.all([api('/api/projects'), api('/api/people?role=faculty'), api('/api/publications')])
      .then(([records, people, notes]) => {
        setProjects(records);
        setFaculty(people);
        setPapers(notes);
      })
      .catch((err) => setError(err.message));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-5">
      {error ? <Banner tone="rose">{error}</Banner> : null}
      <form
        className="grid gap-3 rounded-3xl border border-line bg-panel p-5"
        onSubmit={async (event) => {
          event.preventDefault();
          setError('');
          try {
            await api('/api/projects', {
              method: 'POST',
              body: { ...form, year: Number(form.year), supervisor: form.supervisor || null },
            });
            setForm({ ...form, title: '', abstract: '', authors: '', outcome: '', researchAreas: [] });
            load();
          } catch (err) {
            setError(err.message);
          }
        }}
      >
        <h2 className="font-serif text-3xl">Add a thesis or project</h2>
        <Field label="Title">
          <input className={controlClass} value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required />
        </Field>
        <Field label="Abstract">
          <textarea className={`${controlClass} min-h-24`} value={form.abstract} onChange={(event) => setForm({ ...form, abstract: event.target.value })} required />
        </Field>
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Student authors">
            <input className={controlClass} value={form.authors} onChange={(event) => setForm({ ...form, authors: event.target.value })} required />
          </Field>
          <Field label="Year">
            <input className={controlClass} value={form.year} onChange={(event) => setForm({ ...form, year: event.target.value })} required />
          </Field>
          <Field label="Department">
            <select className={controlClass} value={form.department} onChange={(event) => setForm({ ...form, department: event.target.value })}>
              <option value="CSE">CSE</option>
              <option value="ICT">ICT</option>
            </select>
          </Field>
          <Field label="Type">
            <select className={controlClass} value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })}>
              <option value="thesis">Thesis</option>
              <option value="project">Project</option>
            </select>
          </Field>
          <Field label="Supervisor">
            <select className={controlClass} value={form.supervisor} onChange={(event) => setForm({ ...form, supervisor: event.target.value })}>
              <option value="">Unlinked</option>
              {faculty.map((person) => (
                <option key={person._id} value={person._id}>{person.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Outcome">
            <input className={controlClass} value={form.outcome} onChange={(event) => setForm({ ...form, outcome: event.target.value })} />
          </Field>
        </div>
        <div className="flex flex-wrap gap-2">
          {AREAS.map((area) => {
            const on = form.researchAreas.includes(area);
            return (
              <button
                key={area}
                type="button"
                className={`rounded-full border px-3 py-1 text-xs ${on ? 'border-gold text-gold-2' : 'border-line text-mist'}`}
                onClick={() => setForm({ ...form, researchAreas: on ? form.researchAreas.filter((item) => item !== area) : [...form.researchAreas, area] })}
              >
                {area}
              </button>
            );
          })}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.verified} onChange={(event) => setForm({ ...form, verified: event.target.checked })} />
          Visible to students now
        </label>
        <Button type="submit">Save record</Button>
      </form>

      {projects.length === 0 ? <Empty title="No thesis records" body="Add the first verified project above." /> : null}
      <ul className="space-y-3">
        {projects.map((item) => (
          <li key={item._id} className="rounded-2xl border border-line bg-panel p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-sm text-mist">{item.year} · {item.authors} · {item.department}</p>
              </div>
              <Badge tone={item.verified ? 'teal' : 'gold'}>{item.verified ? 'Verified' : 'Hidden'}</Badge>
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="ghost" onClick={async () => { await api(`/api/projects/${item._id}`, { method: 'PUT', body: { verified: !item.verified } }); load(); }}>
                {item.verified ? 'Hide' : 'Verify'}
              </Button>
              <Button variant="danger" onClick={async () => {
                if (!window.confirm('Remove this thesis record?')) return;
                await api(`/api/projects/${item._id}`, { method: 'DELETE' });
                load();
              }}>
                Remove
              </Button>
            </div>
          </li>
        ))}
      </ul>
      <section className="space-y-3">
        <h2 className="font-serif text-3xl">Papers on the directory</h2>
        {papers.map((item) => (
          <article key={item._id} className="flex flex-col gap-2 rounded-2xl border border-line bg-panel p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium">{item.title}</p>
              <p className="text-sm text-mist">{item.year}{item.owner?.name ? ` · ${item.owner.name}` : ''}</p>
            </div>
            <Button variant="danger" onClick={async () => {
              if (!window.confirm('Remove this paper from the directory?')) return;
              await api(`/api/publications/${item._id}`, { method: 'DELETE' });
              load();
            }}>
              Remove
            </Button>
          </article>
        ))}
      </section>
    </div>
  );
}
