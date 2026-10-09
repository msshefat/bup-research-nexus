import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { Button, Field, controlClass, Banner } from './ui';

const kinds = [
  ['thesis', 'Thesis supervision'],
  ['mentorship', 'Mentorship'],
  ['collaboration', 'Research collaboration'],
];

export function RequestDialog({ person, initialTopic = '', opportunityId = '', onClose }) {
  const { user } = useAuth();
  const [topic, setTopic] = useState(initialTopic);
  const [message, setMessage] = useState('');
  const [kind, setKind] = useState('thesis');
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-black/60 p-3 sm:place-items-center" role="presentation" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="request-title"
        className="w-full max-w-lg rounded-3xl border border-line bg-panel p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-gold">Request</p>
            <h2 id="request-title" className="mt-1 font-serif text-3xl text-paper">
              Ask {person.name}
            </h2>
          </div>
          <button type="button" className="text-sm text-mist hover:text-paper" onClick={onClose}>
            Close
          </button>
        </div>

        {!user ? (
          <div className="mt-5">
            <Banner>Sign in with a student account before you send a request.</Banner>
            <Link to="/login" state={{ from: window.location.pathname }} className="mt-4 inline-block text-sm font-semibold text-gold">
              Go to sign in
            </Link>
          </div>
        ) : user.role !== 'student' ? (
          <p className="mt-5 text-sm leading-6 text-mist">Students send thesis and mentorship requests. You are signed in as {user.role}.</p>
        ) : done ? (
          <div className="mt-5">
            <Banner tone="teal">Request sent. {person.name.split(' ')[0]} will see it under Requests.</Banner>
            <Button className="mt-4" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <form
            className="mt-5 space-y-4"
            onSubmit={async (event) => {
              event.preventDefault();
              setPending(true);
              setError('');
              try {
                await api('/api/requests', {
                  method: 'POST',
                  body: { to: person._id, topic, message, kind, opportunity: opportunityId || undefined },
                });
                setDone(true);
              } catch (err) {
                setError(err.message);
              } finally {
                setPending(false);
              }
            }}
          >
            <Field label="What do you need?">
              <select className={controlClass} value={kind} onChange={(event) => setKind(event.target.value)}>
                {kinds.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Topic">
              <input className={controlClass} value={topic} onChange={(event) => setTopic(event.target.value)} required minLength={4} />
            </Field>
            <Field label="Message" hint="Say who you are, what you have already read, and what you want from this conversation.">
              <textarea className={`${controlClass} min-h-32 resize-y`} value={message} onChange={(event) => setMessage(event.target.value)} required minLength={12} />
            </Field>
            {error ? <Banner tone="rose">{error}</Banner> : null}
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={pending}>
                {pending ? 'Sending…' : 'Send request'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
