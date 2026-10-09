import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { AREAS } from '../constants';
import { AreaTags } from '../components/Cards';
import { Empty, ErrorNote, Loading, controlClass } from '../components/ui';

export function Publications() {
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState(params.get('q') || '');
  const [state, setState] = useState({ loading: true, error: '', data: [] });
  const query = params.toString();

  function load() {
    setState((current) => ({ ...current, loading: true, error: '' }));
    api(`/api/publications${query ? `?${query}` : ''}`)
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
      <p className="text-xs uppercase tracking-[0.18em] text-gold">Publications</p>
      <h1 className="mt-2 font-serif text-5xl">Notes, reports, and papers from the departments.</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-mist">
        Faculty and alumni add the work they want students to read first. Seed records are departmental notes for this demo, not citations of outside journals.
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
          <input className={controlClass} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Title, author, or venue" />
        </label>
        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-mist">Year</span>
          <input className={controlClass} value={params.get('year') || ''} onChange={(event) => update({ year: event.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="2025" />
        </label>
        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-mist">Department</span>
          <select className={controlClass} value={params.get('department') || ''} onChange={(event) => update({ department: event.target.value })}>
            <option value="">CSE and ICT</option>
            <option value="CSE">CSE</option>
            <option value="ICT">ICT</option>
          </select>
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
        {state.loading ? <Loading /> : null}
        {state.error ? <ErrorNote message={state.error} onRetry={load} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? (
          <Empty title="No papers match" body="Search a shorter keyword, or clear the year filter." />
        ) : null}
        {state.data.map((item) => (
          <article key={item._id} className="rounded-2xl border border-line bg-panel p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-serif text-2xl">{item.title}</h2>
              <span className="text-sm text-gold">{item.year}</span>
            </div>
            <p className="mt-1 text-sm text-mist">
              {item.authors.join(', ')}
              {item.venue ? ` · ${item.venue}` : ''}
            </p>
            {item.abstract ? <p className="mt-3 text-sm leading-6 text-mist">{item.abstract}</p> : null}
            <div className="mt-3">
              <AreaTags areas={item.researchAreas} />
            </div>
            {item.owner ? (
              <Link to={`/people/${item.owner._id}`} className="mt-3 inline-block text-sm text-gold">
                {item.owner.name}
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
