import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { initials, tone } from '../constants';
import { OpportunityCard } from '../components/Cards';
import { Thread } from '../components/Thread';
import { Guard } from '../components/Layout';
import { Badge, Button, Empty, ErrorNote, Loading, statusTone } from '../components/ui';

export function Running() {
  return (
    <Guard>
      <RunningDesk />
    </Guard>
  );
}

function otherPerson(item, user) {
  const fromId = String(item.from?._id || item.from || '');
  return fromId === String(user._id) ? item.to : item.from;
}

function RunningDesk() {
  const { user } = useAuth();
  const mentor = user.role === 'faculty' || user.role === 'alumni';
  const allowed = mentor || user.role === 'student';
  const [state, setState] = useState({ loading: allowed, error: '', data: null });
  const [activeId, setActiveId] = useState('');
  const [actionError, setActionError] = useState('');

  function load() {
    setState((current) => ({ ...current, loading: !current.data, error: '' }));
    api('/api/running')
      .then((data) => setState({ loading: false, error: '', data }))
      .catch((error) => setState({ loading: false, error: error.message, data: null }));
  }

  useEffect(() => {
    if (allowed) load();
  }, [allowed]);

  if (!allowed) {
    return (
      <div className="rounded-2xl border border-line bg-panel p-6">
        <h1 className="font-serif text-3xl">Running opportunities and mentoring</h1>
        <p className="mt-2 text-sm text-mist">This desk is for students, faculty, and alumni.</p>
      </div>
    );
  }

  const mentoring = state.data?.mentoring || [];
  const active = mentoring.find((item) => item._id === activeId) || mentoring[0] || null;
  const person = active ? otherPerson(active, user) : null;

  async function removeChat(item) {
    const partner = otherPerson(item, user);
    const name = partner?.name || 'this person';
    if (!window.confirm(`Delete the chat with ${name}? The request and every message on it will be removed.`)) return;
    setActionError('');
    try {
      await api(`/api/requests/${item._id}`, { method: 'DELETE' });
      if (activeId === item._id) setActiveId('');
      load();
    } catch (error) {
      setActionError(error.message);
    }
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-gold">{mentor ? 'Faculty and alumni' : 'Student'}</p>
      <h1 className="mt-2 font-serif text-5xl">Running opportunities and mentoring</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-mist">
        {mentor
          ? 'Students you have accepted are listed by name. Click a name to open the chat.'
          : 'Teachers and mentors who accepted you are listed by name. Click a name to open the chat.'}
      </p>
      {state.loading ? <div className="mt-8"><Loading label="Loading running work" /></div> : null}
      {state.error ? <div className="mt-8"><ErrorNote message={state.error} onRetry={load} /></div> : null}
      {actionError ? <p className="mt-4 text-sm text-rose">{actionError}</p> : null}
      {state.data && mentor ? (
        <section className="mt-10">
          <h2 className="font-serif text-3xl">Opportunities</h2>
          {state.data.opportunities.length === 0 ? (
            <div className="mt-4">
              <Empty title="No running opportunities" body="Open a thesis call from your profile. Closed calls stay off this list." />
            </div>
          ) : (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {state.data.opportunities.map((item) => (
                <OpportunityCard key={item._id} item={item} />
              ))}
            </div>
          )}
        </section>
      ) : null}
      {state.data ? (
        <section className="mt-10">
          <h2 className="font-serif text-3xl">{mentor ? 'Students' : 'Teachers and mentors'}</h2>
          {mentoring.length === 0 ? (
            <div className="mt-4">
              <Empty
                title={mentor ? 'No accepted students yet' : 'No running mentoring yet'}
                body={mentor
                  ? 'When you accept a request, that student’s name shows up here.'
                  : 'When a teacher or mentor accepts your request, their name shows up here.'}
              />
            </div>
          ) : (
            <div className="mt-4 grid items-start gap-4 lg:grid-cols-[280px_1fr]">
              <ul className="space-y-2">
                {mentoring.map((item) => {
                  const partner = otherPerson(item, user);
                  const selected = active && active._id === item._id;
                  return (
                    <li key={item._id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(item._id)}
                        className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-3 text-left transition ${selected ? 'border-gold bg-gold/10' : 'border-line bg-panel hover:border-gold/45'}`}
                      >
                        <span
                          className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-semibold text-stamp"
                          style={{ background: tone(partner?.name || '') }}
                        >
                          {initials(partner?.name || '')}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-paper">{partner?.name || 'Unknown'}</span>
                          <span className="block truncate text-xs capitalize text-mist">{partner?.role} · {item.topic}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              {active && person ? (
                <article className="rounded-2xl border border-line bg-panel p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={statusTone(active.status)}>{active.status}</Badge>
                        <span className="text-xs uppercase tracking-wider text-mist">{active.kind}</span>
                      </div>
                      <h3 className="mt-3 font-serif text-3xl">{person.name}</h3>
                      <p className="text-sm capitalize text-mist">{person.role}{person.department ? ` · ${person.department}` : ''}</p>
                      <p className="mt-2 text-sm text-paper">{active.topic}</p>
                      {active.opportunity?.title ? (
                        <Link to={`/opportunities/${active.opportunity._id}`} className="mt-1 inline-block text-sm text-gold">
                          Opportunity: {active.opportunity.title}
                        </Link>
                      ) : null}
                    </div>
                    <Button variant="danger" onClick={() => removeChat(active)}>
                      Delete
                    </Button>
                  </div>
                  <Thread requestId={active._id} />
                </article>
              ) : null}
            </div>
          )}
        </section>
      ) : null}
    </div>
  );
}
