import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { OpportunityCard } from '../components/Cards';
import { Thread } from '../components/Thread';
import { Guard } from '../components/Layout';
import { Badge, Empty, ErrorNote, Loading, statusTone } from '../components/ui';

export function Running() {
  return (
    <Guard>
      <RunningDesk />
    </Guard>
  );
}

function RunningDesk() {
  const { user } = useAuth();
  const allowed = user.role === 'faculty' || user.role === 'alumni';
  const [state, setState] = useState({ loading: allowed, error: '', data: null });

  function load() {
    setState({ loading: true, error: '', data: null });
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
        <p className="mt-2 text-sm text-mist">This desk is for faculty and alumni who supervise a call or have accepted mentoring.</p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-gold">Faculty and alumni</p>
      <h1 className="mt-2 font-serif text-5xl">Running opportunities and mentoring</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-mist">
        Open and filled calls you still supervise, and the mentoring or applications you have already accepted. Each acceptance keeps a message record.
      </p>
      {state.loading ? <div className="mt-8"><Loading label="Loading running work" /></div> : null}
      {state.error ? <div className="mt-8"><ErrorNote message={state.error} onRetry={load} /></div> : null}
      {state.data ? (
        <>
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
          <section className="mt-12">
            <h2 className="font-serif text-3xl">Mentoring</h2>
            {state.data.mentoring.length === 0 ? (
              <div className="mt-4">
                <Empty title="No accepted mentoring yet" body="When you accept a request or an application, it stays here with its messages." />
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {state.data.mentoring.map((item) => (
                  <article key={item._id} className="rounded-2xl border border-line bg-panel p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <Badge tone={statusTone(item.status)}>{item.status}</Badge>
                      <span className="text-xs uppercase tracking-wider text-mist">{item.kind}</span>
                    </div>
                    <h3 className="mt-3 font-serif text-2xl">{item.topic}</h3>
                    {item.opportunity?.title ? (
                      <Link to={`/opportunities/${item.opportunity._id}`} className="mt-1 inline-block text-sm text-gold">
                        Opportunity: {item.opportunity.title}
                      </Link>
                    ) : null}
                    <p className="mt-2 text-sm leading-6 text-mist">{item.message}</p>
                    {item.from ? (
                      <Link to={`/people/${item.from._id}`} className="mt-3 inline-block text-sm text-gold">
                        {item.from.name} · {item.from.role}
                      </Link>
                    ) : null}
                    <Thread requestId={item._id} />
                  </article>
                ))}
              </div>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
