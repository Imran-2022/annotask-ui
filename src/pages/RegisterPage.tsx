'use client';

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (password !== password2) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await register(username, email, password, password2);
      navigate('/tasks');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-800/90 bg-slate-950/95 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.8)] backdrop-blur-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center rounded-full bg-slate-900/90 px-4 py-2 text-[11px] uppercase tracking-[0.4em] text-slate-400 mb-4">
            ANNOTASK
          </div>
          <h2 className="text-3xl font-semibold text-white">Create your account</h2>
          <p className="text-slate-400 mt-2">Sign up to save tasks, upload images, and annotate with your team.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-200 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-slate-200 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full px-5 py-3 rounded-[1.75rem] border border-slate-700 bg-slate-950/90 text-slate-100 placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition"
              placeholder="username"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-200 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-5 py-3 rounded-[1.75rem] border border-slate-700 bg-slate-950/90 text-slate-100 placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-200 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-5 py-3 rounded-[1.75rem] border border-slate-700 bg-slate-950/90 text-slate-100 placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition"
              placeholder="••••••••"
            />
            <p className="text-xs text-slate-500 mt-2">Password should be at least 8 characters.</p>
          </div>

          <div>
            <label htmlFor="password2" className="block text-sm font-medium text-slate-200 mb-1">
              Confirm Password
            </label>
            <input
              id="password2"
              type="password"
              autoComplete="new-password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              required
              className="w-full px-5 py-3 rounded-[1.75rem] border border-slate-700 bg-slate-950/90 text-slate-100 placeholder:text-slate-500 shadow-[inset_0_1px_0_rgba(255,255,255,0.03)] focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 outline-none transition"
              placeholder="••••••••"
            />
            <p className="text-xs text-slate-500 mt-2">Confirm your password to avoid typos.</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-2xl font-semibold hover:bg-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <p className="text-center text-slate-400 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
