import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { AREAS } from '../constants';
import { AreaTags, ProjectRow } from '../components/Cards';
import { Badge, Empty, ErrorNote, Loading, controlClass } from '../components/ui';

export function Projects() {
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState(params.get('q') || '');
  const [state, setState] = useState({ loading: true, error: '', data: [] });
  const query = params.toString();

  function load() {
    setState((current) => ({ ...current, loading: true, error: '' }));
    api(`/api/projects${query ? `?${query}` : ''}`)
      .then((data) => setState({ loading: false, error: '', data }))
      .catch((error) => setState({ loading: false, error: error.message, data: [] }));
  }

  useEffect(() => {
    load();
  }, [query]);

  function update(next) {
    const merged = { ...Object.fromEntries(params.entries()), ...next };
    Object.keys(merged).forEach((key) => {
      if (!merged[key]) delete merged[key];
    });
    setParams(merged);
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-gold">Repository</p>
      <h1 className="mt-2 font-serif text-5xl">Previous theses and research projects.</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-mist">
        Read what a finished project looked like before you invent the same scope. Administrators verify a record before it appears here.
      </p>
      <form
        className="mt-6 grid gap-3 rounded-3xl border border-line bg-panel p-4 md:grid-cols-4"
        onSubmit={(event) => {
          event.preventDefault();
          update({ q: draft.trim() });
        }}
      >
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wider text-mist">Keyword</span>
          <input className={controlClass} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Title, student, or topic" />
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
          <span className="mb-1 block text-xs uppercase tracking-wider text-mist">Year</span>
          <input className={controlClass} inputMode="numeric" value={params.get('year') || ''} onChange={(event) => update({ year: event.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="2024" />
        </label>
        <label className="md:col-span-2">
          <span className="mb-1 block text-xs uppercase tracking-wider text-mist">Research area</span>
          <select className={controlClass} value={params.get('area') || ''} onChange={(event) => update({ area: event.target.value })}>
            <option value="">Any area</option>
            {AREAS.map((area) => (
              <option key={area}>{area}</option>
            ))}
          </select>
        </label>
        <div className="flex items-end justify-end gap-2 md:col-span-2">
          <button type="submit" className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-on-gold">Apply</button>
          <button type="button" className="rounded-full border border-line px-4 py-2 text-sm" onClick={() => { setDraft(''); setParams({}); }}>Clear</button>
        </div>
      </form>
      <div className="mt-6 space-y-3">
        {state.loading ? <Loading label="Loading theses" /> : null}
        {state.error ? <ErrorNote message={state.error} onRetry={load} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? (
          <Empty title="No projects in this slice" body="Try another year or area. Unverified records stay with the administrator until they are checked." />
        ) : null}
        {state.data.map((item) => (
          <ProjectRow key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
}

export function ProjectDetail() {
  const { id } = useParams();
  const [state, setState] = useState({ loading: true, error: '', data: null });

  function load() {
    api(`/api/projects/${id}`)
      .then((data) => setState({ loading: false, error: '', data }))
      .catch((error) => setState({ loading: false, error: error.message, data: null }));
  }

  useEffect(() => {
    setState({ loading: true, error: '', data: null });
    load();
  }, [id]);

  if (state.loading) return <Loading label="Loading project" />;
  if (state.error) return <ErrorNote message={state.error} onRetry={load} />;
  const item = state.data;

  return (
    <article className="mx-auto max-w-3xl">
      <Link to="/projects" className="text-sm text-gold">Thesis repository</Link>
      <p className="mt-4 font-serif text-5xl text-gold">{item.year}</p>
      <h1 className="mt-2 font-serif text-4xl leading-tight">{item.title}</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge tone={item.department === 'ICT' ? 'gold' : 'blue'}>{item.department}</Badge>
        <Badge tone="mist">{item.type}</Badge>
        {item.verified === false ? <Badge tone="gold">Needs review</Badge> : <Badge tone="teal">Verified</Badge>}
      </div>
      <p className="mt-5 text-sm leading-7 text-mist">{item.abstract}</p>
      <div className="mt-4">
        <AreaTags areas={item.researchAreas} />
      </div>
      <dl className="mt-6 grid gap-3 rounded-2xl border border-line bg-panel p-4 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-mist">Students</dt>
          <dd>{item.authors}</dd>
        </div>
        <div>
          <dt className="text-mist">Supervisor</dt>
          <dd>
            {item.supervisor ? (
              <Link className="text-gold" to={`/people/${item.supervisor._id}`}>{item.supervisor.name}</Link>
            ) : (
              'Not linked'
            )}
          </dd>
        </div>
        {item.outcome ? (
          <div className="sm:col-span-2">
            <dt className="text-mist">Outcome</dt>
            <dd>{item.outcome}</dd>
          </div>
        ) : null}
      </dl>
    </article>
  );
}
