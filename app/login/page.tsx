'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await signIn('credentials', {
      username: username, // Matches the key in NextAuth authorize
      password: password,
      redirect: false,
    });

    if (result?.ok) {
      // Direct push to dashboard - the dashboard will fetch the REAL role now
      router.push('/dashboard');
      router.refresh();
    } else {
      setLoading(false);
      alert("Invalid Username or Password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="bg-white p-10 rounded-[2.5rem] shadow-2xl w-full max-w-md border border-slate-100">
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2 uppercase italic">Safeguard</h2>
        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-8">Internal Compliance Portal</p>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input 
            type="password"
            className="w-full p-5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold focus:border-blue-500 focus:bg-white transition-all outline-none"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button 
            disabled={loading}
            className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50"
          >
            {loading ? "Authenticating..." : "Login to Workspace"}
          </button>
        </form>
      </div>
    </div>
  );
}