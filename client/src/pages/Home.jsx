import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { AREAS } from '../constants';
import { OpportunityCard, PersonCard, ProjectRow } from '../components/Cards';
import { ErrorNote, Loading } from '../components/ui';

export function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [state, setState] = useState({ loading: true, error: '', data: null });

  function load() {
    setState((current) => ({ ...current, loading: true, error: '' }));
    Promise.all([
      api('/api/stats'),
      api('/api/opportunities?status=open'),
      api('/api/people?role=faculty&mentoring=true'),
      api('/api/projects'),
    ])
      .then(([stats, opportunities, faculty, projects]) => {
        setState({ loading: false, error: '', data: { stats, opportunities, faculty, projects } });
      })
      .catch((error) => setState({ loading: false, error: error.message, data: null }));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-12">
      <section className="grid items-end gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gold">Bangladesh University of Professionals</p>
          <h1 className="mt-3 max-w-3xl font-serif text-5xl leading-[1.05] text-paper sm:text-6xl">
            Find the supervisor who already works on your question.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-mist">
            Research Nexus keeps CSE and ICT faculty interests, open thesis calls, past projects, and alumni guidance in one directory. Less inbox archaeology. More time on the actual research.
          </p>
          <form
            className="mt-6 flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              const trimmed = query.trim();
              navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search');
            }}
          >
            <label className="sr-only" htmlFor="home-search">
              Search the directory
            </label>
            <input
              id="home-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Try cybersecurity, Bangla speech, or a faculty name"
              className="w-full rounded-full border border-line bg-panel px-5 py-3 text-sm outline-none focus:border-gold"
            />
            <button type="submit" className="rounded-full bg-gold px-5 py-3 text-sm font-semibold text-on-gold">
              Search
            </button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {AREAS.slice(0, 7).map((area) => (
              <Link
                key={area}
                to={`/search?area=${encodeURIComponent(area)}`}
                className="rounded-full border border-line px-3 py-1 text-xs text-mist hover:border-gold/50 hover:text-paper"
              >
                {area}
              </Link>
            ))}
          </div>
        </div>
        <aside className="rounded-3xl border border-line bg-panel/80 p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-mist">On the directory now</p>
          {state.loading ? (
            <p className="mt-4 text-sm text-mist">Counting records…</p>
          ) : state.data ? (
            <dl className="mt-4 grid grid-cols-2 gap-4">
              {[
                ['Faculty', state.data.stats.faculty],
                ['Open calls', state.data.stats.openOpportunities],
                ['Theses', state.data.stats.projects],
                ['Alumni', state.data.stats.alumni],
              ].map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs uppercase tracking-wider text-mist">{label}</dt>
                  <dd className="font-serif text-4xl text-gold">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
          <p className="mt-4 text-sm leading-6 text-mist">
            Faculty post a call when they have a seat. Alumni mark themselves open when they can actually reply.
          </p>
        </aside>
      </section>

      {state.loading ? <Loading /> : null}
      {state.error ? <ErrorNote message={state.error} onRetry={load} /> : null}

      {state.data ? (
        <>
          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="font-serif text-3xl">Open thesis calls</h2>
              <Link to="/opportunities?status=open" className="text-sm text-gold">
                All opportunities
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {state.data.opportunities.slice(0, 3).map((item) => (
                <OpportunityCard key={item._id} item={item} />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="font-serif text-3xl">Faculty accepting students</h2>
              <Link to="/people?role=faculty&mentoring=true" className="text-sm text-gold">
                Faculty directory
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {state.data.faculty.slice(0, 6).map((person) => (
                <PersonCard key={person._id} person={person} />
              ))}
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-end justify-between gap-3">
              <h2 className="font-serif text-3xl">Recent thesis work</h2>
              <Link to="/projects" className="text-sm text-gold">
                Thesis repository
              </Link>
            </div>
            <div className="space-y-3">
              {state.data.projects.slice(0, 4).map((item) => (
                <ProjectRow key={item._id} item={item} />
              ))}
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
