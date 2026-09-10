import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, PenSquare, User, LogOut } from 'lucide-react';

/* ──────────────────────────────────────────────
   Desktop sidebar nav
   ────────────────────────────────────────────── */
export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.username?.[0]?.toUpperCase() || '?';
  const dataInitial = user?.username?.[0]?.toLowerCase() || 'z';

  return (
    <nav className="sidebar" role="navigation" aria-label="Main navigation">
      {/* Wordmark */}
      <Link to="/" className="sidebar-brand" aria-label="3W Social home">
        <div className="sidebar-brand-wordmark">
          <span className="sidebar-brand-3w">3W</span>
          <span className="sidebar-brand-social">Social</span>
        </div>
      </Link>

      {/* Nav items */}
      <div className="sidebar-nav" role="list">
        <Link
          to="/"
          className={`sidebar-nav-item${pathname === '/' ? ' active' : ''}`}
          role="listitem"
        >
          <Home size={18} strokeWidth={pathname === '/' ? 2.5 : 1.75} aria-hidden="true" />
          Feed
        </Link>
      </div>

      {/* User + logout pinned to bottom */}
      {user && (
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div
              className="avatar avatar--md"
              aria-hidden="true"
              data-initial={dataInitial}
            >
              {initial}
            </div>
            <div className="sidebar-user-info">
              <div className="sidebar-username">{user.username}</div>
              <div className="sidebar-handle">@{user.username.toLowerCase()}</div>
            </div>
          </div>

          <button
            className="btn-logout"
            onClick={handleLogout}
            aria-label="Log out"
          >
            <LogOut size={15} strokeWidth={1.75} aria-hidden="true" />
            Log out
          </button>
        </div>
      )}
    </nav>
  );
};

/* ──────────────────────────────────────────────
   Mobile bottom nav
   ────────────────────────────────────────────── */
export const BottomNav = () => {
  const { pathname } = useLocation();

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Mobile navigation">
      <div className="bottom-nav-inner">
        <Link
          to="/"
          className={`bottom-nav-item${pathname === '/' ? ' active' : ''}`}
          aria-label="Feed"
          aria-current={pathname === '/' ? 'page' : undefined}
        >
          <Home size={20} strokeWidth={pathname === '/' ? 2.5 : 1.75} aria-hidden="true" />
          Home
        </Link>

        <button
          className="bottom-nav-item"
          style={{ border: 'none', flex: 1 }}
          onClick={() => {
            // Scroll to top to focus composer on mobile
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          aria-label="Create post"
        >
          <PenSquare size={20} strokeWidth={1.75} aria-hidden="true" />
          Create
        </button>

        <Link
          to="/"
          className="bottom-nav-item"
          aria-label="Profile"
        >
          <User size={20} strokeWidth={1.75} aria-hidden="true" />
          Profile
        </Link>
      </div>
    </nav>
  );
};

/* ──────────────────────────────────────────────
   Tablet top bar (768–1023px)
   ────────────────────────────────────────────── */
export const TopBar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initial = user?.username?.[0]?.toUpperCase() || '?';
  const dataInitial = user?.username?.[0]?.toLowerCase() || 'z';

  return (
    <header className="top-bar">
      <Link to="/" className="top-bar-brand">
        3W <span>SOCIAL</span>
      </Link>

      {user && (
        <div className="top-bar-actions">
          <div
            className="avatar avatar--sm"
            aria-hidden="true"
            data-initial={dataInitial}
          >
            {initial}
          </div>
          <button
            className="btn-logout"
            onClick={handleLogout}
            aria-label="Log out"
            style={{ minHeight: '36px' }}
          >
            <LogOut size={14} strokeWidth={1.75} aria-hidden="true" />
            Log out
          </button>
        </div>
      )}
    </header>
  );
};

/* Default export kept for any possible existing import */
const Navbar = () => null;
export default Navbar;
