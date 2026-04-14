import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useTheme } from '../hooks/useTheme.js';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <header className="glass-header fixed top-0 left-0 right-0 z-50 h-12 flex items-center justify-between px-5">
      <Link
        to="/boards"
        className="font-display text-sm font-bold tracking-[0.18em] uppercase gradient-text hover:opacity-80 transition-opacity"
      >
        Trello Clone
      </Link>

      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
          {theme === 'dark' ? (
            /* Sun icon */
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" strokeWidth={2} />
              <path strokeLinecap="round" strokeWidth={2} d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          ) : (
            /* Moon icon */
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
          )}
        </button>

      {user && (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 header-user-btn"
          >
            {/* Avatar with gradient */}
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)' }}
            >
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium" style={{ color: 'var(--text-0)' }}>
              {user.name}
            </span>
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-200`}
              style={{
                color: 'var(--text-2)',
                transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div
              className="header-dropdown absolute right-0 mt-1.5 w-52 rounded-xl py-1.5 overflow-hidden z-50"
            >
              <div
                className="px-4 py-2.5 text-xs"
                style={{
                  color: 'var(--text-2)',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                  letterSpacing: '0.01em',
                }}
              >
                {user.email}
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm transition-all flex items-center gap-2"
                style={{ color: '#f87171' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(248,113,113,0.08)';
                  e.currentTarget.style.color = '#fca5a5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#f87171';
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Log out
              </button>
            </div>
          )}
        </div>
      )}
      </div>
    </header>
  );
}
