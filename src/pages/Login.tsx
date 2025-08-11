import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function Login() {
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');

  return (
    <div className="h-screen flex items-center justify-center">
      <form
        onSubmit={e => { e.preventDefault(); signIn(email); }}
        className="space-y-4 bg-white p-6 rounded shadow"
      >
        <h1 className="text-xl font-bold">Entrar</h1>
        <input
          type="email"
          placeholder="seu@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 rounded w-64"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="block w-full bg-blue-600 text-white p-2 rounded"
        >
          {loading ? 'Enviando…' : 'Receber link mágico'}
        </button>
      </form>
    </div>
  );
}