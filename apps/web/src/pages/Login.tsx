import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    
    try {
      const res = await fetch(`http://localhost:8080${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isLogin ? { email, password } : { email, password, name })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to authenticate');
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center animate-fade-in relative">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
         <div className="w-96 h-96 bg-primary-600/30 rounded-full blur-[100px] mix-blend-screen"></div>
      </div>
      
      <div className="w-full max-w-md glass-panel p-8 md:p-10 rounded-3xl z-10 relative shadow-2xl border border-border">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-display font-extrabold text-white tracking-tight mb-2">
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-sm text-gray-400">
            {isLogin ? 'Enter your details to access the marketplace.' : 'Join the verified student network.'}
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-4 rounded-xl mb-6 text-sm font-medium flex items-center gap-3">
            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLogin && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full glass-panel !bg-surface-hover border-border px-4 py-3.5 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-white placeholder-gray-500" placeholder="John Doe" />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">University Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="student@pondiuni.edu.in" className="w-full glass-panel !bg-surface-hover border-border px-4 py-3.5 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-white placeholder-gray-500" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full glass-panel !bg-surface-hover border-border px-4 py-3.5 rounded-xl focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all text-white placeholder-gray-500" placeholder="••••••••" />
          </div>
          
          <button type="submit" className="w-full primary-gradient text-white font-bold py-3.5 rounded-xl mt-4 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2">
            {isLogin ? 'Login Securely' : 'Verify & Create Account'}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-400 font-medium">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-primary-400 hover:text-primary-300 transition-colors hover:underline">
            {isLogin ? 'Sign up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}
