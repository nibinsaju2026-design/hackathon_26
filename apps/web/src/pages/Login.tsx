import { useState } from 'react';
import { BadgeCheck, Lock, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { api, setSession } from '../lib/api';
import type { User } from '../lib/types';

type AuthResponse = { token: string; user: User };
const UNIVERSITY_EMAIL = /^[^\s@]+@pondiuni\.ac\.in$/i;

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (!UNIVERSITY_EMAIL.test(email.trim())) {
      setError('Use your Pondicherry University email ending in @pondiuni.ac.in.');
      return;
    }
    setBusy(true);
    try {
      const result = await api<AuthResponse>(`/api/auth/${isLogin ? 'login' : 'signup'}`, {
        method: 'POST',
        body: JSON.stringify(isLogin ? { email: email.trim(), password } : { name: name.trim(), email: email.trim(), password })
      });
      setSession(result.token, result.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <section className="auth-card glass-panel">
        <span className="auth-brand-icon"><ShoppingBag size={21} /></span>
        <span className="verified-badge"><BadgeCheck size={15} /> Pondicherry University community</span>
        <h1 className="mt-3">{isLogin ? 'Welcome back.' : 'Join the campus market.'}</h1>
        <p>{isLogin ? 'Sign in to pick up where you left off.' : 'Create your student account and start trading on campus.'}</p>
        {error && <div role="alert" className="inline-error mb-4">{error}</div>}
        <form onSubmit={submit} className="grid gap-4">
          {!isLogin && <label><span className="field-label">Your name</span><input className="field" autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} minLength={2} required placeholder="How should we call you?" /></label>}
          <label><span className="field-label">University email</span><input className="field" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@pondiuni.ac.in" /></label>
          <label><span className="field-label">Password</span><input className="field" type="password" autoComplete={isLogin ? 'current-password' : 'new-password'} value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required placeholder="At least 8 characters" /></label>
          <div className="info-box flex items-center gap-2"><Lock size={15} /> Only @pondiuni.ac.in university email addresses are accepted.</div>
          <button className="button-primary w-full mt-1" type="submit" disabled={busy}>{busy ? 'Please wait…' : isLogin ? 'Sign in securely' : 'Create student account'}</button>
        </form>
        <p className="auth-switch">{isLogin ? 'New around here? ' : 'Already have an account? '}<button type="button" className="text-button" onClick={() => { setIsLogin((current) => !current); setError(''); }}>{isLogin ? 'Create an account' : 'Sign in'}</button></p>
        <p className="auth-switch mt-4"><Link className="text-button" to="/browse">Continue browsing</Link></p>
      </section>
    </div>
  );
}
