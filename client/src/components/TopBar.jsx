import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { initials, tone } from '../constants';
import { useTheme } from '../theme';

const links = [
  { to: '/people?role=faculty', label: 'Faculty', match: 'faculty' },
  { to: '/opportunities', label: 'Opportunities' },
  { to: '/projects', label: 'Theses' },
  { to: '/people?role=alumni', label: 'Alumni', match: 'alumni' },
  { to: '/publications', label: 'Papers' },
];

function linkClass(active) {
  return `rounded-full px-3 py-1.5 text-sm transition ${active ? 'bg-gold/15 text-gold-2' : 'text-mist hover:text-paper'}`;
}

export function TopBar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const here = `${location.pathname}${location.search}`;
  const [navHere, setNavHere] = useState('');
  const [menuHere, setMenuHere] = useState('');
  const open = navHere === here;
  const menu = menuHere === here;
  const [query, setQuery] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const unread = user ? unreadCount : 0;
  const navLinks = user && ['student', 'faculty', 'alumni'].includes(user.role)
    ? [...links, { to: '/running', label: 'Running' }]
    : links;

  useEffect(() => {
    if (!user) return undefined;
    let live = true;
    const load = () => {
      api('/api/notifications')
        .then((data) => {
          if (live) setUnreadCount(data.unread || 0);
        })
        .catch(() => {});
    };
    load();
    const timer = setInterval(load, 30000);
    return () => {
      live = false;
      clearInterval(timer);
    };
  }, [user]);

  function submitSearch(event) {
    event.preventDefault();
    const trimmed = query.trim();
    navigate(trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search');
    setQuery('');
    setNavHere('');
  }

  function isActive(link) {
    if (link.match) {
      return location.pathname === '/people' && new URLSearchParams(location.search).get('role') === link.match;
    }
    return location.pathname === link.to || location.pathname.startsWith(`${link.to}/`);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-gold/20 bg-ink/85 backdrop-blur-md">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-gold focus:px-3 focus:py-1 focus:text-on-gold">
        Skip to content
      </a>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4">
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl border border-gold/50 bg-gold font-serif text-lg text-on-gold">N</span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold tracking-wide text-paper">Research Nexus</span>
            <span className="block text-[11px] uppercase tracking-[0.14em] text-mist">BUP · CSE & ICT</span>
          </span>
        </Link>

        <nav className="ml-2 hidden items-center gap-0.5 lg:flex" aria-label="Primary">
          {navLinks.map((link) => (
            <NavLink key={link.label} to={link.to} className={linkClass(isActive(link))}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <form onSubmit={submitSearch} className="ml-auto hidden min-w-0 md:block md:w-48 lg:w-56">
          <label className="sr-only" htmlFor="top-search">
            Search research
          </label>
          <input
            id="top-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search faculty, theses…"
            className="w-full rounded-full border border-line bg-panel px-3 py-1.5 text-sm text-paper outline-none placeholder:text-mist focus:border-gold"
          />
        </form>

        <button
          type="button"
          onClick={toggle}
          className="hidden rounded-full border border-line px-3 py-1.5 text-sm text-paper sm:inline-flex"
          aria-pressed={theme === 'light'}
        >
          {theme === 'dark' ? 'Light' : 'Dark'}
        </button>
        {user ? (
          <div className="hidden items-center gap-2 sm:flex">
            <Link to="/notifications" className="relative rounded-full border border-line px-3 py-1.5 text-sm text-mist hover:text-paper" aria-label="Notifications">
              Alerts
              {unread > 0 ? (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[10px] font-bold text-on-gold">
                  {unread}
                </span>
              ) : null}
            </Link>
            <div className="relative">
              <button
                type="button"
                className="flex items-center gap-2 rounded-full border border-line py-1 pl-1 pr-3 text-sm"
                onClick={() => setMenuHere(menu ? '' : here)}
                aria-expanded={menu}
              >
                <span className="grid h-7 w-7 place-items-center rounded-full text-xs font-semibold text-stamp" style={{ background: tone(user.name) }}>
                  {initials(user.name)}
                </span>
                <span className="max-w-28 truncate text-paper">{user.name.split(' ')[0]}</span>
              </button>
              {menu ? (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-line bg-panel p-2 shadow-xl">
                  <p className="px-3 py-2 text-xs uppercase tracking-wider text-mist">{user.role}</p>
                  <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-panel-2" to="/account">
                    My profile
                  </Link>
                  <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-panel-2" to="/requests">
                    Requests
                  </Link>
                  {['student', 'faculty', 'alumni'].includes(user.role) ? (
                    <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-panel-2" to="/running">
                      Running
                    </Link>
                  ) : null}
                  {user.role === 'admin' ? (
                    <Link className="block rounded-xl px-3 py-2 text-sm hover:bg-panel-2" to="/admin">
                      Administration
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    className="block w-full rounded-xl px-3 py-2 text-left text-sm text-rose hover:bg-panel-2"
                    onClick={() => {
                      logout();
                      navigate('/');
                    }}
                  >
                    Sign out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        ) : (
          <div className="hidden items-center gap-2 sm:flex">
            <Link to="/login" className="rounded-full px-3 py-1.5 text-sm text-mist hover:text-paper">
              Sign in
            </Link>
            <Link to="/register" className="rounded-full bg-gold px-3 py-1.5 text-sm font-semibold text-on-gold">
              Join
            </Link>
          </div>
        )}

        <button
          type="button"
          className="ml-auto rounded-full border border-line px-3 py-1.5 text-sm text-paper sm:ml-0 lg:hidden"
          aria-expanded={open}
          onClick={() => setNavHere(open ? '' : here)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>

      {open ? (
        <div className="border-t border-line bg-ink px-4 py-4 lg:hidden">
          <form onSubmit={submitSearch} className="mb-3 md:hidden">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search faculty, theses…"
              className="w-full rounded-full border border-line bg-panel px-3 py-2 text-sm outline-none focus:border-gold"
            />
          </form>
          <div className="flex flex-col gap-1">
            <button type="button" onClick={toggle} className="rounded-full px-3 py-1.5 text-left text-sm text-paper">
              {theme === 'dark' ? 'Light theme' : 'Dark theme'}
            </button>
            {navLinks.map((link) => (
              <NavLink key={link.label} to={link.to} className={linkClass(isActive(link))}>
                {link.label}
              </NavLink>
            ))}
            {user ? (
              <>
                <NavLink to="/notifications" className={linkClass(location.pathname === '/notifications')}>
                  Alerts{unread ? ` (${unread})` : ''}
                </NavLink>
                <NavLink to="/requests" className={linkClass(location.pathname === '/requests')}>
                  Requests
                </NavLink>
                <NavLink to="/account" className={linkClass(location.pathname === '/account')}>
                  My profile
                </NavLink>
                {user.role === 'admin' ? (
                  <NavLink to="/admin" className={linkClass(location.pathname === '/admin')}>
                    Administration
                  </NavLink>
                ) : null}
                <button
                  type="button"
                  className="rounded-full px-3 py-1.5 text-left text-sm text-rose"
                  onClick={() => {
                    logout();
                    navigate('/');
                  }}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass(location.pathname === '/login')}>
                  Sign in
                </NavLink>
                <NavLink to="/register" className={linkClass(location.pathname === '/register')}>
                  Join
                </NavLink>
              </>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
