'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { setAuth, apiPost } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const body = mode === 'login'
        ? { email, password }
        : { email, password, name };

      const res = await apiPost(endpoint, body);

      if (!res.success) {
        setError(res.error || 'Error al autenticar');
        return;
      }

      setAuth(res.token, res.user, res.organization);
      router.push('/dashboard');
    } catch {
      setError('Error de conexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-[10px] shadow-card p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="bg-accent text-primary w-12 h-12 rounded-xl flex items-center justify-center">
              <MessageCircle size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary">AgilMsg</h1>
              <p className="text-xs text-muted">WhatsApp Tech Provider</p>
            </div>
          </div>

          <div className="flex gap-1 bg-surface-bg rounded-lg p-1 mb-6">
            <button
              onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'login' ? 'bg-white text-primary shadow-sm' : 'text-muted'
              }`}
            >
              Iniciar sesion
            </button>
            <button
              onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                mode === 'register' ? 'bg-white text-primary shadow-sm' : 'text-muted'
              }`}
            >
              Registrarse
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-danger text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-muted mb-1">
                Contrasena
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                required
                minLength={6}
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Procesando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
