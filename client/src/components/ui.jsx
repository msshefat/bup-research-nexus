export function Button({ variant = 'primary', className = '', type = 'button', ...props }) {
  const styles = {
    primary: 'bg-gold text-ink hover:bg-gold-2',
    ghost: 'border border-line bg-panel/60 text-paper hover:border-gold/60',
    danger: 'border border-rose/40 text-rose hover:bg-rose/10',
    quiet: 'text-mist hover:text-paper',
  }[variant];
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${styles} ${className}`}
      {...props}
    />
  );
}

export function Field({ label, hint, children }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-paper">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-mist">{hint}</span> : null}
    </label>
  );
}

export const controlClass =
  'w-full rounded-xl border border-line bg-ink px-3 py-2.5 text-sm text-paper outline-none transition placeholder:text-mist/70 focus:border-gold';

export function Badge({ children, tone = 'gold' }) {
  const styles = {
    gold: 'border-gold/30 bg-gold/10 text-gold-2',
    teal: 'border-teal/30 bg-teal/10 text-teal',
    rose: 'border-rose/30 bg-rose/10 text-rose',
    blue: 'border-blue/30 bg-blue/10 text-blue',
    mist: 'border-line bg-white/5 text-mist',
  }[tone];
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles}`}>
      {children}
    </span>
  );
}

export function statusTone(status) {
  if (status === 'open' || status === 'accepted' || status === 'verified') return 'teal';
  if (status === 'rejected' || status === 'closed') return 'rose';
  if (status === 'filled' || status === 'pending') return 'gold';
  return 'mist';
}

export function Loading({ label = 'Loading research records' }) {
  return (
    <div className="space-y-3" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      {[0, 1, 2].map((item) => (
        <div key={item} className="h-28 animate-pulse rounded-2xl border border-line bg-panel/80" />
      ))}
    </div>
  );
}

export function ErrorNote({ message, onRetry }) {
  return (
    <div className="rounded-2xl border border-rose/30 bg-rose/10 p-5">
      <p className="font-semibold">This page could not be loaded.</p>
      <p className="mt-1 text-sm text-mist">{message}</p>
      {onRetry ? (
        <Button className="mt-4" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  );
}

export function Empty({ title, body, action }) {
  return (
    <div className="rounded-2xl border border-dashed border-line bg-panel/40 px-6 py-14 text-center">
      <p className="font-serif text-2xl text-paper">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-mist">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Banner({ children, tone = 'gold' }) {
  const styles = tone === 'rose' ? 'border-rose/30 bg-rose/10' : 'border-gold/30 bg-gold/10';
  return <div className={`rounded-2xl border px-4 py-3 text-sm leading-6 text-paper ${styles}`}>{children}</div>;
}
