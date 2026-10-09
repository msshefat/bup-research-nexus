import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { AREAS } from '../constants';
import { OpportunityCard, PersonCard, ProjectRow } from '../components/Cards';
import { Empty, ErrorNote, Loading } from '../components/ui';

export function Search() {
  const [params, setParams] = useSearchParams();
  const [draft, setDraft] = useState(params.get('q') || '');
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const query = params.toString();

  function load() {
    setState((current) => ({ ...current, loading: true, error: '' }));
    api(`/api/search${query ? `?${query}` : ''}`)
      .then((data) => setState({ loading: false, error: '', data }))
      .catch((error) => setState({ loading: false, error: error.message, data: null }));
  }

  useEffect(() => {
    load();
  }, [query]);

  const data = state.data;
  const total = data ? data.people.length + data.opportunities.length + data.projects.length + data.publications.length : 0;
  const looking = params.get('q') || params.get('area') || 'everything currently listed';

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-gold">Search</p>
      <h1 className="mt-2 font-serif text-5xl">One query across people, calls, theses, and papers.</h1>
      <form
        className="mt-6 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          const next = new URLSearchParams(params);
          const trimmed = draft.trim();
          if (trimmed) next.set('q', trimmed);
          else next.delete('q');
          setParams(next);
        }}
      >
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          className="w-full rounded-full border border-line bg-panel px-5 py-3 text-sm outline-none focus:border-gold"
          placeholder="Keyword"
        />
        <button type="submit" className="rounded-full bg-gold px-5 py-3 text-sm font-semibold text-on-gold">
          Search
        </button>
      </form>
      <div className="mt-4 flex flex-wrap gap-2">
        {AREAS.map((area) => (
          <button
            key={area}
            type="button"
            onClick={() => setParams({ area, q: draft.trim() })}
            className={`rounded-full border px-3 py-1 text-xs ${params.get('area') === area ? 'border-gold text-gold-2' : 'border-line text-mist'}`}
          >
            {area}
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-8">
        {state.loading ? <Loading label="Searching" /> : null}
        {state.error ? <ErrorNote message={state.error} onRetry={load} /> : null}
        {data && total === 0 ? (
          <Empty title="Nothing matched" body={`No research records mention ${looking}. Try a broader area, such as Machine Learning or Cybersecurity.`} />
        ) : null}
        {data?.people.length ? (
          <section>
            <h2 className="mb-3 font-serif text-3xl">People</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.people.map((person) => (
                <PersonCard key={person._id} person={person} />
              ))}
            </div>
          </section>
        ) : null}
        {data?.opportunities.length ? (
          <section>
            <h2 className="mb-3 font-serif text-3xl">Opportunities</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {data.opportunities.map((item) => (
                <OpportunityCard key={item._id} item={item} />
              ))}
            </div>
          </section>
        ) : null}
        {data?.projects.length ? (
          <section>
            <h2 className="mb-3 font-serif text-3xl">Theses and projects</h2>
            <div className="space-y-3">
              {data.projects.map((item) => (
                <ProjectRow key={item._id} item={item} />
              ))}
            </div>
          </section>
        ) : null}
        {data?.publications.length ? (
          <section>
            <h2 className="mb-3 font-serif text-3xl">Papers</h2>
            <ul className="space-y-2">
              {data.publications.map((item) => (
                <li key={item._id} className="rounded-2xl border border-line bg-panel px-4 py-3">
                  <p className="font-medium">{item.title}</p>
                  <p className="text-sm text-mist">
                    {item.year}
                    {item.owner?.name ? ` · ${item.owner.name}` : ''}
                  </p>
                  {item.owner?._id ? (
                    <Link to={`/people/${item.owner._id}`} className="text-sm text-gold">
                      Open profile
                    </Link>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  );
}
