import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth';
import { TopBar } from './TopBar';

export function Layout() {
  const { ready } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <TopBar />
      <main id="content" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {ready ? (
          <Outlet />
        ) : (
          <p className="text-sm text-mist" role="status">
            Checking your session…
          </p>
        )}
      </main>
      <footer className="border-t border-line/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-xs leading-5 text-mist sm:flex-row sm:items-center sm:justify-between">
          <p>BUP Research Nexus · CSE and ICT · Faculty of Science and Technology</p>
          <p>
            Course project supervised by{' '}
            <Link className="text-paper hover:text-gold" to="/search?q=Palash">
              Md. Istakiak Adnan Palash
            </Link>{' '}
            and{' '}
            <Link className="text-paper hover:text-gold" to="/search?q=Seema">
              Sharmeen Jahan Seema
            </Link>
            . Sample records are illustrative.
          </p>
        </div>
      </footer>
    </div>
  );
}

export function Guard({ children, role }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) return null;
  if (!user) {
    return (
      <div className="rounded-2xl border border-line bg-panel p-6">
        <h1 className="font-serif text-3xl">Sign in to continue</h1>
        <p className="mt-2 text-sm text-mist">This part of Nexus is for people with an account.</p>
        <Link to="/login" state={{ from: location.pathname }} className="mt-4 inline-block text-sm font-semibold text-gold">
          Sign in
        </Link>
      </div>
    );
  }
  if (role && user.role !== role) {
    return (
      <div className="rounded-2xl border border-line bg-panel p-6">
        <h1 className="font-serif text-3xl">This desk is for administrators</h1>
        <p className="mt-2 text-sm text-mist">Your {user.role} account can browse research records, not moderate them.</p>
      </div>
    );
  }
  return children;
}
