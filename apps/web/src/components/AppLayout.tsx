import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Bell, LayoutDashboard, LogIn, LogOut, Menu, Moon, Plus, Search, ShoppingBag, Sun, X } from 'lucide-react';
import { clearSession, getStoredUser } from '../lib/api';
import type { User } from '../lib/types';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(getStoredUser);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') ?? 'dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());
    window.addEventListener('auth-change', syncUser);
    return () => window.removeEventListener('auth-change', syncUser);
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('theme', theme);
  }, [theme]);

  const signOut = () => {
    clearSession();
    setMenuOpen(false);
    navigate('/');
  };

  const navClass = ({ isActive }: { isActive: boolean }) => `nav-link ${isActive ? 'nav-link-active' : ''}`;

  return (
    <div className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />
      <header className="site-header">
        <div className="navbar glass-panel">
          <Link to="/" className="brand" aria-label="Pondicherry University Marketplace home">
            <span className="brand-mark"><ShoppingBag size={19} /></span>
            <span>pondy<span className="brand-accent">market</span></span>
          </Link>
          <form className="nav-search" onSubmit={(event) => { event.preventDefault(); const value = new FormData(event.currentTarget).get('search')?.toString() ?? ''; navigate(`/browse?search=${encodeURIComponent(value)}`); }}>
            <Search size={16} />
            <input name="search" aria-label="Search campus listings" placeholder="Find something on campus..." />
            <kbd>↵</kbd>
          </form>
          <nav className={`nav-actions ${menuOpen ? 'nav-actions-open' : ''}`}>
            <NavLink to="/browse" className={navClass} onClick={() => setMenuOpen(false)}>Explore</NavLink>
            {user && <NavLink to="/dashboard" className={navClass} onClick={() => setMenuOpen(false)}><LayoutDashboard size={16} /> Dashboard</NavLink>}
            {user && <NavLink to="/notifications" className={`${navClass} nav-icon-link`} aria-label="Notifications" onClick={() => setMenuOpen(false)}><Bell size={18} /><span className="mobile-label">Notifications</span></NavLink>}
            <button className="theme-toggle" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            {user ? (
              <>
                <Link to="/post" className="button-primary nav-post" onClick={() => setMenuOpen(false)}><Plus size={16} /> Post an item</Link>
                <Link to="/profile" className="avatar nav-avatar" aria-label="Your profile">{user.name.charAt(0).toUpperCase()}</Link>
                <button className="sign-out-link" onClick={signOut} aria-label="Sign out"><LogOut size={16} /><span className="mobile-label">Sign out</span></button>
              </>
            ) : <Link to="/login" className="button-primary nav-post"><LogIn size={16} /> Sign in</Link>}
          </nav>
          <button className="menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </header>
      <main className="main-content">{children}</main>
      <footer className="site-footer">
        <div className="footer-inner">
          <Link to="/" className="brand footer-brand"><span className="brand-mark"><ShoppingBag size={16} /></span><span>pondy<span className="brand-accent">market</span></span></Link>
          <p>Campus finds, better connections. Made for Pondicherry University.</p>
          <div className="footer-links"><Link to="/browse">Explore listings</Link><Link to="/orders">Transactions</Link><Link to="/wishlist">Saved items</Link></div>
        </div>
      </footer>
    </div>
  );
}
