'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const router = useRouter();

  const manejarLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch {
      setError('Error de conexión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <div className="bg-slate-800 rounded-xl p-8 border border-slate-700">
          <div className="text-center mb-8">
            <Image
              src="/logo.png"
              alt="El Oasis TCG"
              width={80}
              height={80}
              className="w-20 h-20 rounded-full border-2 border-blue-500 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
              El Oasis TCG
            </h1>
            <p className="text-sm text-slate-400 mt-1">Panel de Administración</p>
          </div>

          <form onSubmit={manejarLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">
                Contraseña de administrador
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoFocus
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>

            {error && (
              <div className="bg-red-500/10 text-red-400 border border-red-500/30 p-3 rounded-lg text-sm">
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 py-3 rounded-lg font-bold transition shadow-lg"
            >
              {cargando ? 'Verificando...' : '🔐 Entrar al Panel'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-slate-400 hover:text-white transition"
            >
              ← Volver al calendario
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
