import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { timeAgo } from '../constants';
import { Guard } from '../components/Layout';
import { Badge, Banner, Button, Empty, ErrorNote, Loading, controlClass, statusTone } from '../components/ui';

export function Requests() {
  return (
    <Guard>
      <RequestDesk />
    </Guard>
  );
}

function RequestCard({ item, box, onRespond }) {
  const [note, setNote] = useState('');
  const other = box === 'sent' ? item.to : item.from;
  return (
    <article className="rounded-2xl border border-line bg-panel p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Badge tone={statusTone(item.status)}>{item.status}</Badge>
        <span className="text-xs text-mist">{timeAgo(item.createdAt)} · {item.kind}</span>
      </div>
      <h2 className="mt-3 font-serif text-2xl">{item.topic}</h2>
      {item.opportunity?.title ? <p className="mt-1 text-sm text-gold">Opportunity: {item.opportunity.title}</p> : null}
      <p className="mt-2 text-sm leading-6 text-mist">{item.message}</p>
      {item.responseNote ? <p className="mt-3 text-sm text-paper">Reply: {item.responseNote}</p> : null}
      {other ? (
        <Link to={`/people/${other._id}`} className="mt-3 inline-block text-sm text-gold">
          {other.name} · {other.role}
        </Link>
      ) : null}
      {box === 'inbox' && item.status === 'pending' ? (
        <div className="mt-4 space-y-2">
          <textarea className={controlClass} placeholder="Optional note to the student" value={note} onChange={(event) => setNote(event.target.value)} />
          <div className="flex gap-2">
            <Button onClick={() => onRespond(item._id, 'accepted', note)}>Accept</Button>
            <Button variant="danger" onClick={() => onRespond(item._id, 'rejected', note)}>Decline</Button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function RequestDesk() {
  const { user } = useAuth();
  const [box, setBox] = useState(user.role === 'student' ? 'sent' : 'inbox');
  const [state, setState] = useState({ loading: true, error: '', data: [] });
  const [actionError, setActionError] = useState('');

  function load() {
    setState((current) => ({ ...current, loading: true, error: '' }));
    api(`/api/requests?box=${box}`)
      .then((data) => setState({ loading: false, error: '', data }))
      .catch((error) => setState({ loading: false, error: error.message, data: [] }));
  }

  useEffect(() => {
    load();
  }, [box]);

  async function respond(id, status, responseNote) {
    setActionError('');
    try {
      await api(`/api/requests/${id}`, { method: 'PATCH', body: { status, responseNote } });
      load();
    } catch (error) {
      setActionError(error.message);
    }
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-[0.18em] text-gold">Mentorship</p>
      <h1 className="mt-2 font-serif text-5xl">{box === 'sent' ? 'Requests you sent' : 'Requests waiting on you'}</h1>
      <div className="mt-4 flex gap-2">
        {user.role !== 'student' ? (
          <button type="button" className={`rounded-full px-4 py-2 text-sm ${box === 'inbox' ? 'bg-gold text-on-gold' : 'border border-line'}`} onClick={() => setBox('inbox')}>
            Inbox
          </button>
        ) : null}
        <button type="button" className={`rounded-full px-4 py-2 text-sm ${box === 'sent' ? 'bg-gold text-on-gold' : 'border border-line'}`} onClick={() => setBox('sent')}>
          Sent
        </button>
      </div>
      {actionError ? <div className="mt-4"><Banner tone="rose">{actionError}</Banner></div> : null}
      <div className="mt-6 space-y-3">
        {state.loading ? <Loading label="Loading requests" /> : null}
        {state.error ? <ErrorNote message={state.error} onRetry={load} /> : null}
        {!state.loading && !state.error && state.data.length === 0 ? (
          <Empty
            title={box === 'sent' ? 'You have not written to anyone yet' : 'No requests in this box'}
            body={box === 'sent' ? 'Open a faculty or alumni profile and send a specific question, not a generic hello.' : 'When a student asks for supervision, it lands here.'}
          />
        ) : null}
        {state.data.map((item) => (
          <RequestCard key={item._id} item={item} box={box} onRespond={respond} />
        ))}
      </div>
    </div>
  );
}
