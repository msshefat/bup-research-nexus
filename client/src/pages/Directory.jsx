import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { AREAS } from '../constants';
import { PersonCard } from '../components/Cards';
import { Empty, ErrorNote, Loading, controlClass } from '../components/ui';

const titles = {
  faculty: ['Faculty directory', 'Research interests, publications, and who is taking thesis students.'],
  alumni: ['Alumni mentors', 'Graduates who left a research trail and may still answer a careful question.'],
  student: ['Student interests', 'What current students say they want to work on. Visible after sign-in.'],
};

export function Directory() {
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const role = params.get('role') || 'faculty';
  const [draft, setDraft] = useState(params.get('q') || '');
  const [state, setState] = useState({ loading: true, error: '', data: [] });

  const query = params.toString();

  useEffect(() => {
    setDraft(params.get('q') || '');
  }, [query]);

  function load() {
    setState((current) => ({ ...current, loading: true, error: '' }));
    api(`/api/people${query ? `?${query}` : ''}`)
      .then((data) => setState({ loading: false, error: '', data }))
      .catch((error) => setState({ loading: false, error: error.message, data: [] }));
  }

  useEffect(() => {
    load();
  }, [query]);

  function update(next) {
    const merged = { role, ...Object.fromEntries(params.entries()), ...next };
    Object.keys(merged).forEach((key) => {
      if (!merged[key]) delete merged[key];
    });
    setParams(merged);
  }

  const [title, blurb] = titles[role] || titles.faculty;

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-gold">{role}</p>
      <h1 className="mt-2 font-serif text-5xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-mist">{blurb}</p>

      <form
        className="mt-6 grid gap-3 rounded-3xl border border-line bg-panel p-4 md:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          update({ q: draft.trim() });
        }}
      >
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wider text-mist">Keyword</span>
          <input className={controlClass} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Name, interest, or lab" />
        </label>
        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-mist">Department</span>
          <select className={controlClass} value={params.get('department') || ''} onChange={(event) => update({ department: event.target.value })}>
            <option value="">CSE and ICT</option>
            <option value="CSE">CSE</option>
            <option value="ICT">ICT</option>
          </select>
        </label>
        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-mist">Research area</span>
          <select className={controlClass} value={params.get('area') || ''} onChange={(event) => update({ area: event.target.value })}>
            <option value="">Any area</option>
            {AREAS.map((area) => (
              <option key={area}>{area}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input
            type="checkbox"
            checked={params.get('mentoring') === 'true'}
            onChange={(event) => update({ mentoring: event.target.checked ? 'true' : '' })}
          />
          Only people open to mentoring
        </label>
        <div className="flex items-center gap-2 md:col-span-2 md:justify-end">
          <button type="submit" className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink">
            Apply
          </button>
          <button
            type="button"
            className="rounded-full border border-line px-4 py-2 text-sm"
            onClick={() => {
              setDraft('');
              setParams(role === 'faculty' ? { role: 'faculty' } : { role });
            }}
          >
            Clear
          </button>
        </div>
      </form>

      {user ? (
        <div className="mt-4 flex gap-2 text-sm">
          <button type="button" className="text-mist hover:text-paper" onClick={() => setParams({ role: 'student' })}>
            Browse student interests
          </button>
        </div>
      ) : null}

      <div className="mt-6">
        {state.loading ? <Loading label="Loading people" /> : null}
        {state.error ? <ErrorNote message={state.error} onRetry={load} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? (
          <Empty
            title="No one matches these filters"
            body="Try another research area, or clear the department filter. New faculty appear here after they create an account."
          />
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {state.data.map((person) => (
            <PersonCard key={person._id} person={person} />
          ))}
        </div>
      </div>
      </div>
  );
}
