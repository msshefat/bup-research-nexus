import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { timeAgo } from '../constants';
import { Guard } from '../components/Layout';
import { Button, Empty, ErrorNote, Loading } from '../components/ui';

export function Notifications() {
  return (
    <Guard>
      <NotificationList />
    </Guard>
  );
}

function NotificationList() {
  const [state, setState] = useState({ loading: true, error: '', data: null });

  function load() {
    setState((current) => ({ ...current, loading: true, error: '' }));
    api('/api/notifications')
      .then((data) => setState({ loading: false, error: '', data }))
      .catch((error) => setState({ loading: false, error: error.message, data: null }));
  }

  useEffect(() => {
    load();
  }, []);

  async function mark(id) {
    await api(`/api/notifications/${id}/read`, { method: 'PATCH' });
    load();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-gold">Alerts</p>
          <h1 className="mt-2 font-serif text-5xl">What changed</h1>
        </div>
        <Button
          variant="ghost"
          onClick={async () => {
            await api('/api/notifications/read-all', { method: 'PATCH' });
            load();
          }}
        >
          Mark all read
        </Button>
      </div>
      <div className="mt-6 space-y-3">
        {state.loading ? <Loading label="Loading alerts" /> : null}
        {state.error ? <ErrorNote message={state.error} onRetry={load} /> : null}
        {state.data && state.data.items.length === 0 ? (
          <Empty title="No alerts yet" body="Requests, replies, and profile verification show up here." />
        ) : null}
        {state.data?.items.map((item) => (
          <article key={item._id} className={`rounded-2xl border px-4 py-4 ${item.read ? 'border-line bg-panel/50' : 'border-gold/40 bg-panel'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="font-medium">{item.title}</h2>
                {item.body ? <p className="mt-1 text-sm text-mist">{item.body}</p> : null}
                <p className="mt-2 text-xs text-mist">{timeAgo(item.createdAt)}</p>
              </div>
              {!item.read ? (
                <button type="button" className="text-xs text-gold" onClick={() => mark(item._id)}>
                  Mark read
                </button>
              ) : null}
            </div>
            {item.link ? (
              <Link to={item.link} className="mt-3 inline-block text-sm text-gold" onClick={() => { if (!item.read) mark(item._id); }}>
                Open
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}
