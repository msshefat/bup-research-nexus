import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth';
import { timeAgo } from '../constants';
import { Button, controlClass } from './ui';

export function Thread({ requestId }) {
  const { user } = useAuth();
  const [state, setState] = useState({ loading: true, error: '', data: [] });
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState('');

  function load() {
    setState((current) => ({ ...current, loading: true, error: '' }));
    api(`/api/requests/${requestId}/messages`)
      .then((data) => setState({ loading: false, error: '', data }))
      .catch((error) => setState({ loading: false, error: error.message, data: [] }));
  }

  useEffect(() => {
    load();
  }, [requestId]);

  async function send(event) {
    event.preventDefault();
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    setSendError('');
    try {
      await api(`/api/requests/${requestId}/messages`, { method: 'POST', body: { body: text } });
      setBody('');
      load();
    } catch (error) {
      setSendError(error.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-line bg-ink/50 p-3">
      <h3 className="text-xs uppercase tracking-[0.16em] text-gold">Message record</h3>
      {state.loading ? <p className="mt-3 text-sm text-mist">Loading the record…</p> : null}
      {state.error ? <p className="mt-3 text-sm text-rose">{state.error}</p> : null}
      {!state.loading && !state.error && state.data.length === 0 ? (
        <p className="mt-3 text-sm text-mist">No messages yet. The note you write on accept is the first entry.</p>
      ) : null}
      {state.data.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {state.data.map((message) => {
            const mine = String(message.from?._id || message.from) === String(user?._id);
            return (
              <li key={message._id} className={`max-w-[85%] rounded-2xl px-3 py-2 ${mine ? 'ml-auto bg-gold/15' : 'bg-panel-2'}`}>
                <p className="text-xs text-mist">
                  {message.from?.name || 'Someone'} · {timeAgo(message.createdAt)}
                </p>
                <p className="mt-1 text-sm leading-6 text-paper">{message.body}</p>
              </li>
            );
          })}
        </ul>
      ) : null}
      <form onSubmit={send} className="mt-3 space-y-2">
        <label className="sr-only" htmlFor={`message-${requestId}`}>
          Message
        </label>
        <textarea
          id={`message-${requestId}`}
          className={controlClass}
          rows={3}
          maxLength={1000}
          placeholder="Write a message. It stays on this record."
          value={body}
          onChange={(event) => setBody(event.target.value)}
        />
        {sendError ? <p className="text-sm text-rose">{sendError}</p> : null}
        <Button type="submit" disabled={sending || !body.trim()}>
          {sending ? 'Sending…' : 'Send'}
        </Button>
      </form>
    </section>
  );
}
