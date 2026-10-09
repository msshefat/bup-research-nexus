import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { AREAS, formatDate } from '../constants';
import { AreaTags, OpportunityCard } from '../components/Cards';
import { RequestDialog } from '../components/RequestDialog';
import { Badge, Button, Empty, ErrorNote, Loading, controlClass, statusTone } from '../components/ui';

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
          <button type="submit" className="rounded-full bg-gold px-4 py-2 text-sm font-semibold text-on-gold">
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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const [asking, setAsking] = useState(false);
  const [notes, setNotes] = useState({});
  const [actionError, setActionError] = useState('');

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
  const isOwner = Boolean(user && supervisor && String(user._id) === String(supervisor._id));
  const owns = Boolean(user && supervisor && (user.role === 'admin' || isOwner));

  async function setStatus(status) {
    setActionError('');
    try {
      await api(`/api/opportunities/${item._id}`, { method: 'PUT', body: { status } });
      load();
    } catch (error) {
      setActionError(error.message);
    }
  }

  async function respond(requestId, status) {
    setActionError('');
    try {
      await api(`/api/requests/${requestId}`, { method: 'PATCH', body: { status, responseNote: notes[requestId] || '' } });
      setNotes((current) => ({ ...current, [requestId]: '' }));
      load();
    } catch (error) {
      setActionError(error.message);
    }
  }

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
          {owns ? (
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="ghost" onClick={() => setStatus(item.status === 'closed' ? 'open' : 'closed')}>
                {item.status === 'closed' ? 'Open again' : 'Close opportunity'}
              </Button>
              <Button
                variant="danger"
                onClick={async () => {
                  if (!window.confirm('Delete this opportunity?')) return;
                  await api(`/api/opportunities/${item._id}`, { method: 'DELETE' });
                  navigate('/opportunities');
                }}
              >
                Delete
              </Button>
            </div>
          ) : item.myApplication ? (
            <p className="mt-4 text-sm text-paper">
              Your application is {item.myApplication.status}.
              {item.myApplication.responseNote ? ` Reply: ${item.myApplication.responseNote}` : ''}
            </p>
          ) : item.status === 'open' && supervisor.verified ? (
            <button type="button" className="mt-4 rounded-full bg-gold px-4 py-2 text-sm font-semibold text-on-gold" onClick={() => setAsking(true)}>
              Apply
            </button>
          ) : (
            <p className="mt-3 text-sm text-mist">
              {item.status !== 'open'
                ? 'This opportunity is closed to new applications.'
                : 'This profile is still waiting for administrator verification.'}
            </p>
          )}
        </div>
      ) : null}
      {actionError ? <p className="mt-4 text-sm text-rose">{actionError}</p> : null}
      {owns && item.applications ? (
        <section className="mt-8">
          <h2 className="font-serif text-3xl">Applications</h2>
          {item.applications.length === 0 ? (
            <p className="mt-3 text-sm text-mist">No one has applied yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {item.applications.map((application) => (
                <li key={application._id} className="rounded-2xl border border-line bg-panel p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">{application.from?.name}</p>
                    <Badge tone={statusTone(application.status)}>{application.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-mist">{application.message}</p>
                  {application.responseNote ? <p className="mt-2 text-sm">Reply: {application.responseNote}</p> : null}
                  {isOwner && application.status === 'pending' ? (
                    <div className="mt-3 space-y-2">
                      <textarea className={controlClass} placeholder="Optional note" value={notes[application._id] || ''} onChange={(event) => setNotes((current) => ({ ...current, [application._id]: event.target.value }))} />
                      <div className="flex gap-2">
                        <Button onClick={() => respond(application._id, 'accepted')}>Accept</Button>
                        <Button variant="danger" onClick={() => respond(application._id, 'rejected')}>Reject</Button>
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
      {asking && supervisor ? (
        <RequestDialog person={supervisor} initialTopic={item.title} opportunityId={item._id} onClose={() => { setAsking(false); load(); }} />
      ) : null}
    </article>
  );
}
