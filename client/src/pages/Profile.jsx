import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { AreaTags, Avatar, OpportunityCard, ProjectRow } from '../components/Cards';
import { RequestDialog } from '../components/RequestDialog';
import { Badge, ErrorNote, Loading } from '../components/ui';

export function Profile() {
  const { id } = useParams();
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, error: '', data: null });
  const [asking, setAsking] = useState(false);

  function load() {
    setState((current) => ({ ...current, loading: true, error: '' }));
    api(`/api/people/${id}`)
      .then((data) => setState({ loading: false, error: '', data }))
      .catch((error) => setState({ loading: false, error: error.message, data: null }));
  }

  useEffect(() => {
    load();
  }, [id]);

  if (state.loading) return <Loading label="Loading profile" />;
  if (state.error) return <ErrorNote message={state.error} onRetry={load} />;

  const person = state.data.user;
  const canAsk = ['faculty', 'alumni'].includes(person.role) && person.verified && person.mentoringAvailable && user?._id !== person._id;

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="h-fit rounded-3xl border border-line bg-panel p-5">
        <Avatar name={person.name} size="lg" />
        <h1 className="mt-4 font-serif text-4xl leading-tight">{person.name}</h1>
        <p className="mt-2 text-sm text-mist">
          {person.designation || person.organization || person.role}
          {person.department ? ` · ${person.department}` : ''}
          {person.batch ? ` · ${person.batch}` : ''}
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Badge tone={person.department === 'ICT' ? 'gold' : 'blue'}>{person.role}</Badge>
          {person.mentoringAvailable ? <Badge tone="teal">Open to mentoring</Badge> : <Badge tone="mist">Not taking general requests</Badge>}
          {person.verified === false ? <Badge tone="gold">Awaiting verification</Badge> : null}
        </div>
        {person.office ? <p className="mt-4 text-sm text-mist">Office: {person.office}</p> : null}
        {canAsk ? (
          <button type="button" className="mt-5 w-full rounded-full bg-gold px-4 py-2.5 text-sm font-semibold text-ink" onClick={() => setAsking(true)}>
            Request guidance
          </button>
        ) : (
          <p className="mt-5 text-sm leading-6 text-mist">
            {person.verified === false
              ? 'An administrator still needs to verify this profile before students can send a request.'
              : person.mentoringAvailable
                ? 'Sign in as a student to send a request.'
                : 'This person is not marked available for new students. An open thesis call on their profile is still worth reading.'}
          </p>
        )}
      </aside>

      <div className="space-y-8">
        <section>
          <h2 className="font-serif text-3xl">Research profile</h2>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-mist">{person.bio || 'No biography yet.'}</p>
          <div className="mt-4">
            <AreaTags areas={person.researchInterests} />
          </div>
          {person.expertise?.length ? (
            <p className="mt-4 text-sm text-paper">
              <span className="text-mist">Also works on </span>
              {person.expertise.join(', ')}
            </p>
          ) : null}
        </section>

        {person.academicBackground ? (
          <section>
            <h2 className="font-serif text-2xl">Academic background</h2>
            <p className="mt-2 text-sm leading-7 text-mist">{person.academicBackground}</p>
          </section>
        ) : null}
        {person.researchExperience ? (
          <section>
            <h2 className="font-serif text-2xl">Research experience</h2>
            <p className="mt-2 text-sm leading-7 text-mist">{person.researchExperience}</p>
          </section>
        ) : null}

        {state.data.opportunities?.length ? (
          <section>
            <h2 className="font-serif text-2xl">Thesis calls</h2>
            <div className="mt-3 grid gap-3">
              {state.data.opportunities.map((item) => (
                <OpportunityCard key={item._id} item={item} />
              ))}
            </div>
          </section>
        ) : null}

        {state.data.publications?.length ? (
          <section>
            <h2 className="font-serif text-2xl">Papers and notes</h2>
            <ul className="mt-3 space-y-3">
              {state.data.publications.map((item) => (
                <li key={item._id} className="rounded-2xl border border-line bg-panel px-4 py-3">
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-mist">
                    {item.authors.join(', ')} · {item.venue} · {item.year}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {state.data.projects?.length ? (
          <section>
            <h2 className="font-serif text-2xl">Supervised work</h2>
            <div className="mt-3 space-y-3">
              {state.data.projects.map((item) => (
                <ProjectRow key={item._id} item={item} />
              ))}
            </div>
          </section>
        ) : null}

        <Link to={person.role === 'alumni' ? '/people?role=alumni' : '/people?role=faculty'} className="inline-block text-sm text-gold">
          Back to the directory
        </Link>
      </div>

      {asking ? <RequestDialog person={person} initialTopic={person.researchInterests?.[0] || ''} onClose={() => setAsking(false)} /> : null}
    </div>
  );
}
