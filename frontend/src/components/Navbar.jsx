import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, PenSquare, User, LogOut } from 'lucide-react';

/* ──────────────────────────────────────────────
   Blue top header — all breakpoints
   ────────────────────────────────────────────── */
export const AppHeader = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.username?.[0]?.toUpperCase() || '?';
  const dataInitial = user?.username?.[0]?.toLowerCase() || 'z';

  return (
    <header className="app-header" role="banner">
      {/* Brand */}
      <Link to="/" className="app-header-brand" aria-label="3W Social home">
        <div className="app-header-logo" aria-hidden="true">3W</div>
        <div>
          <div className="app-header-title">3W Social</div>
          <div className="app-header-subtitle">Community Feed</div>
        </div>
      </Link>

      {/* Right side — user info + logout */}
      {user && (
        <div className="app-header-right">
          <button
            className="header-avatar-btn"
            onClick={handleLogout}
            aria-label={`Logged in as ${user.username}. Click to log out.`}
          >
            <div
              className="avatar avatar--xs"
              aria-hidden="true"
              data-initial={dataInitial}
            >
              {initial}
            </div>
            <span className="header-username">{user.username}</span>
          </button>

          <button
            className="btn-header-logout"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogOut size={14} strokeWidth={2} aria-hidden="true" />
            <span className="sr-only">Log out</span>
          </button>
        </div>
      )}
    </header>
  );
};

/* ──────────────────────────────────────────────
   Blue bottom nav — mobile only
   ────────────────────────────────────────────── */
export const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
      <div className="bottom-nav-inner">
        <Link
          to="/"
          className={`bottom-nav-item${pathname === '/' ? ' active' : ''}`}
          aria-label="Home feed"
          aria-current={pathname === '/' ? 'page' : undefined}
        >
          <Home size={22} strokeWidth={pathname === '/' ? 2.5 : 1.75} aria-hidden="true" />
          Home
        </Link>

        <button
          className="bottom-nav-item"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Create post"
        >
          <PenSquare size={22} strokeWidth={1.75} aria-hidden="true" />
          Create
        </button>

        <Link
          to="/"
          className="bottom-nav-item"
          aria-label="Profile"
        >
          <User size={22} strokeWidth={1.75} aria-hidden="true" />
          Profile
        </Link>
      </div>
    </nav>
  );
};

/* Kept for any stray default import */
const Navbar = () => null;
export default Navbar;

/* Named alias — Feed.jsx imports Sidebar + TopBar; map them to new components */
export const Sidebar = AppHeader;
export const TopBar = () => null;
