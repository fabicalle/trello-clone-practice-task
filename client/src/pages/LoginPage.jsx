import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../hooks/useAuth.js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      navigate('/boards');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-glow flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm relative z-10">

        {/* Logo mark */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)', boxShadow: '0 0 30px rgba(99,102,241,0.35)' }}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold tracking-wide gradient-text">Trello Clone</h1>
          <p className="mt-1.5 text-xs tracking-widest uppercase" style={{ color: 'var(--text-2)' }}>
            Sign in to your workspace
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 glass-card">
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label htmlFor="email" className="section-label block mb-2">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="input-dark w-full rounded-lg px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label htmlFor="password" className="section-label block mb-2">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="input-dark w-full rounded-lg px-4 py-2.5 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-2.5 rounded-xl text-sm mt-1"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <p className="text-center text-xs" style={{ color: 'var(--text-2)' }}>
              Don't have an account?{' '}
              <Link to="/register" className="gradient-text font-semibold hover:opacity-80 transition-opacity">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
