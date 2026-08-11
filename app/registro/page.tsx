'use client';
import { useState, Suspense } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';

function RegistroForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventoIdParam = searchParams.get('evento') || '1';

  const [juego, setJuego] = useState<'Pokémon' | 'Magic'>('Pokémon');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [playerId, setPlayerId] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  const manejarEnvio = async (e: React.FormEvent) => {
    e.preventDefault();
    setCargando(true);
    setMensaje({ texto: '', tipo: '' });

    try {
      const res = await fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, juego, playerId, eventoId: parseInt(eventoIdParam) })
      });

      const data = await res.json();

      if (!res.ok) {
        setMensaje({ texto: `❌ ${data.error}`, tipo: 'error' });
      } else {
        setMensaje({ texto: '🎉 ¡Inscripción exitosa! Revisa tu correo.', tipo: 'exito' });
        setTimeout(() => router.push('/'), 2500);
      }
    } catch {
      setMensaje({ texto: '❌ Error de red, inténtalo de nuevo.', tipo: 'error' });
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex items-center justify-center">
      <div className="bg-slate-800 p-8 rounded-xl border border-slate-700 w-full max-w-md shadow-2xl">
        <div className="text-center mb-6">
          <Image src="/logo.png" alt="El Oasis TCG" width={80} height={80} className="w-20 h-20 rounded-full mx-auto mb-2 border-2 border-blue-500" />
          <h1 className="text-2xl font-bold">Registro de Torneo</h1>
          <p className="text-xs text-slate-400">El Oasis TCG</p>
        </div>

        {mensaje.texto && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-medium border ${
            mensaje.tipo === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'
          }`}>{mensaje.texto}</div>
        )}

        <form onSubmit={manejarEnvio} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Selecciona el Juego</label>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => setJuego('Pokémon')} className={`py-2 rounded-lg font-semibold border transition ${juego === 'Pokémon' ? 'bg-yellow-500 text-slate-950 border-yellow-500' : 'border-slate-600 text-slate-400'}`}>Pokémon TCG</button>
              <button type="button" onClick={() => setJuego('Magic')} className={`py-2 rounded-lg font-semibold border transition ${juego === 'Magic' ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-600 text-slate-400'}`}>Magic TCG</button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Nombre Completo</label>
            <input type="text" required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre del jugador" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Correo Electrónico</label>
            <input type="email" required value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="correo@ejemplo.com" className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">{juego === 'Pokémon' ? 'Pokémon Player ID' : 'ID Cuenta Wizards (Correo)'}</label>
            <input type="text" required value={playerId} onChange={(e) => setPlayerId(e.target.value)} placeholder={juego === 'Pokémon' ? 'Ej. 7654321' : 'Ej. correo@wizards.com'} className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500" />
          </div>

          <button type="submit" disabled={cargando} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 py-3 rounded-lg font-bold transition mt-2 shadow-lg">
            {cargando ? 'Inscribiendo...' : 'Confirmar Inscripción'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function RegistroPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-900 text-white flex items-center justify-center text-slate-400">Cargando...</div>}>
      <RegistroForm />
    </Suspense>
  );
}
