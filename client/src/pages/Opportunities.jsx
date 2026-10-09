import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { AREAS, formatDate } from '../constants';
import { AreaTags, OpportunityCard } from '../components/Cards';
import { RequestDialog } from '../components/RequestDialog';
import { Badge, Empty, ErrorNote, Loading, controlClass, statusTone } from '../components/ui';

export function Opportunities() {
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState(params.get('q') || '');
  const [state, setState] = useState({ loading: true, error: '', data: [] });
  const query = params.toString();

  function load() {
    setState((current) => ({ ...current, loading: true, error: '' }));
    api(`/api/opportunities${query ? `?${query}` : ''}`)
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
      <p className="text-xs uppercase tracking-[0.18em] text-gold">Thesis opportunities</p>
      <h1 className="mt-2 font-serif text-5xl">Calls with a seat, a topic, and a supervisor.</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-mist">
        Filter by department, research area, or whether the call is still open. A filled or closed call stays visible so the next student can see what the department already ran.
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
          <input className={controlClass} value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Bangla, phishing, camera…" />
        </label>
        <label>
          <span className="mb-1 block text-xs uppercase tracking-wider text-mist">Status</span>
          <select className={controlClass} value={params.get('status') || ''} onChange={(event) => update({ status: event.target.value })}>
            <option value="">Any status</option>
            <option value="open">Open</option>
            <option value="filled">Filled</option>
            <option value="closed">Closed</option>
          </select>
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
        <div className="flex items-end gap-2 md:col-span-2 md:justify-end">
          <button type="submit" className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink">
            Apply
          </button>
          <button type="button" className="rounded-full border border-line px-4 py-2 text-sm" onClick={() => { setDraft(''); setParams({}); }}>
            Clear
          </button>
        </div>
      </form>
      <div className="mt-6">
        {state.loading ? <Loading label="Loading thesis calls" /> : null}
        {state.error ? <ErrorNote message={state.error} onRetry={load} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? (
          <Empty title="No thesis calls match" body="Clear a filter or check again after faculty post a new call from their profile." />
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          {state.data.map((item) => (
            <OpportunityCard key={item._id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function OpportunityDetail() {
  const { id } = useParams();
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const [asking, setAsking] = useState(false);

  function load() {
    api(`/api/opportunities/${id}`)
      .then((data) => setState({ loading: false, error: '', data }))
      .catch((error) => setState({ loading: false, error: error.message, data: null }));
  }

  useEffect(() => {
    setState({ loading: true, error: '', data: null });
    load();
  }, [id]);

  if (state.loading) return <Loading label="Loading thesis call" />;
  if (state.error) return <ErrorNote message={state.error} onRetry={load} />;
  const item = state.data;
  const supervisor = item.supervisor;

  return (
    <article className="mx-auto max-w-3xl">
      <Link to="/opportunities" className="text-sm text-gold">
        All opportunities
      </Link>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone={statusTone(item.status)}>{item.status}</Badge>
        <Badge tone={item.department === 'ICT' ? 'gold' : 'blue'}>{item.department}</Badge>
        <Badge tone="mist">{item.slots} {item.slots === 1 ? 'seat' : 'seats'}</Badge>
      </div>
      <h1 className="mt-4 font-serif text-5xl leading-tight">{item.title}</h1>
      <p className="mt-4 text-lg leading-8 text-paper">{item.summary}</p>
      <div className="mt-4">
        <AreaTags areas={item.researchAreas} />
      </div>
      <p className="mt-6 text-sm leading-7 text-mist">{item.description}</p>
      {item.requirements ? (
        <section className="mt-6 rounded-2xl border border-line bg-panel p-4">
          <h2 className="font-semibold">What the supervisor expects</h2>
          <p className="mt-2 text-sm leading-6 text-mist">{item.requirements}</p>
        </section>
      ) : null}
      <p className="mt-4 text-sm text-mist">{item.deadline ? `Respond by ${formatDate(item.deadline)}.` : 'No deadline posted.'}</p>
      {supervisor ? (
        <div className="mt-6 rounded-2xl border border-line bg-panel p-4">
          <p className="text-xs uppercase tracking-wider text-mist">Supervisor</p>
          <Link to={`/people/${supervisor._id}`} className="mt-1 block font-serif text-2xl text-paper hover:text-gold-2">
            {supervisor.name}
          </Link>
          <p className="text-sm text-mist">
            {supervisor.designation} · {supervisor.department}
          </p>
          {item.status === 'open' && supervisor.verified ? (
            <button type="button" className="mt-4 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-ink" onClick={() => setAsking(true)}>
              Request this thesis
            </button>
          ) : (
            <p className="mt-3 text-sm text-mist">
              {item.status !== 'open'
                ? 'This call is not open to new students.'
                : 'This profile is still waiting for administrator verification.'}
            </p>
          )}
        </div>
      ) : null}
      {asking && supervisor ? (
        <RequestDialog person={supervisor} initialTopic={item.title} opportunityId={item._id} onClose={() => setAsking(false)} />
      ) : null}
    </article>
  );
}
