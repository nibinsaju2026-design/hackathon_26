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
    <div className="max-w-md mx-auto mt-20 p-6 bg-gray-800 rounded-lg border border-gray-700 shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-center">{isLogin ? 'Login' : 'Sign Up'}</h2>
      {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {!isLogin && (
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:border-blue-500 focus:outline-none" />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">Pondicherry University Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="student@pondiuni.edu.in" className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:border-blue-500 focus:outline-none" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-gray-900 border border-gray-700 rounded p-2 focus:border-blue-500 focus:outline-none" />
        </div>
        
        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded mt-2 transition-colors">
          {isLogin ? 'Login' : 'Create Account'}
        </button>
      </form>
      
      <p className="mt-4 text-center text-sm text-gray-400">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button onClick={() => setIsLogin(!isLogin)} className="text-blue-400 hover:underline">
          {isLogin ? 'Sign up' : 'Login'}
        </button>
      </p>
    </div>
  );
}
