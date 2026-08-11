'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Jugador {
  id: number;
  nombre: string;
  correo: string;
  juego: string;
  player_id: string | null;
  creado_en: string;
}

interface EventoJugador {
  id: number;
  evento_id: number;
  jugador_id: number;
  inscrito_en: string;
}

interface Evento {
  id: number;
  titulo: string;
  juego: string;
  fecha_inicio: string;
}

interface JugadorRow extends Jugador {
  evento_ids: number[];
  eventos: { titulo: string; fecha_inicio: string }[];
}

export default function AdminJugadoresPage() {
  const router = useRouter();
  const [jugadores, setJugadores] = useState<JugadorRow[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEvento, setFiltroEvento] = useState('todos');
  const [filtroJuego, setFiltroJuego] = useState('todos');
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  useEffect(() => {
    async function cargarDatos() {
      const [eventosRes, jugadoresRes, eventoJugadoresRes] = await Promise.all([
        supabase.from('eventos').select('id, titulo, juego, fecha_inicio').order('fecha_inicio', { ascending: true }),
        supabase.from('jugadores').select('*').order('creado_en', { ascending: false }),
        supabase.from('evento_jugadores').select('*'),
      ]);

      if (!eventosRes.error) setEventos(eventosRes.data || []);
      
      if (!jugadoresRes.error && !eventoJugadoresRes.error) {
        const eventoJugadores = eventoJugadoresRes.data || [];
        const mapaEventos = new Map(eventosRes.data?.map((e: Evento) => [e.id, e]) || []);

        const filas: JugadorRow[] = (jugadoresRes.data || []).map((j: Jugador) => {
          const inscripciones = eventoJugadores.filter((ej: EventoJugador) => ej.jugador_id === j.id);
          const eventosDelJugador = inscripciones
            .map((ej: EventoJugador) => mapaEventos.get(ej.evento_id))
            .filter((e: Evento | undefined): e is Evento => Boolean(e));
          
          return {
            ...j,
            evento_ids: inscripciones.map((ej: EventoJugador) => ej.evento_id),
            eventos: eventosDelJugador.map(e => ({ titulo: e.titulo, fecha_inicio: e.fecha_inicio })),
          };
        });
        
        setJugadores(filas);
      }
      setCargando(false);
    }
    cargarDatos();
  }, []);

  const filtrarJugadores = () => {
    let filtrados = jugadores;
    
    if (filtroEvento !== 'todos') {
      const eventoId = parseInt(filtroEvento);
      filtrados = filtrados.filter(j => j.evento_ids.includes(eventoId));
    }
    
    if (filtroJuego !== 'todos') {
      filtrados = filtrados.filter(j => j.juego === filtroJuego);
    }
    
    if (busqueda) {
      const q = busqueda.toLowerCase();
      filtrados = filtrados.filter(j => 
        j.nombre.toLowerCase().includes(q) ||
        j.correo.toLowerCase().includes(q) ||
        (j.player_id || '').toLowerCase().includes(q)
      );
    }
    
    return filtrados;
  };

  const eliminarJugador = async (id: number) => {
    if (!confirm('¿Eliminar este jugador? Se eliminarán sus inscripciones.')) return;
    const { error } = await supabase.from('jugadores').delete().eq('id', id);
    if (!error) {
      setJugadores(jugadores.filter(j => j.id !== id));
      setMensaje({ texto: '✅ Jugador eliminado', tipo: 'exito' });
    } else {
      setMensaje({ texto: `❌ Error: ${error.message}`, tipo: 'error' });
    }
  };

  const jugadoresFiltrados = filtrarJugadores();

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-5xl mx-auto">
        <header className="flex items-center gap-4 mb-8 border-b border-slate-700 pb-4">
          <Image src="/logo.png" alt="El Oasis TCG" width={48} height={48} className="w-12 h-12 rounded-full border-2 border-blue-500" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">👥 Jugadores Registrados</h1>
            <p className="text-sm text-slate-400">Base de datos de jugadores del El Oasis TCG</p>
          </div>
          <Link href="/admin" className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg transition">
            ← Panel
          </Link>
        </header>

        {mensaje.texto && (
          <div className={`p-3 rounded-lg mb-4 text-sm ${mensaje.tipo === 'error' ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
            {mensaje.texto}
          </div>
        )}

        {/* Filtros */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 mb-6">
          <div className="grid md:grid-cols-4 gap-3">
            <div className="md:col-span-2">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="🔍 Buscar por nombre, correo o Player ID..."
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <select
                value={filtroEvento}
                onChange={(e) => setFiltroEvento(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="todos">Todos los eventos</option>
                {eventos.map(e => (
                  <option key={e.id} value={e.id}>{e.titulo}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filtroJuego}
                onChange={(e) => setFiltroJuego(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              >
                <option value="todos">Todos los juegos</option>
                <option value="Pokémon">Pokémon TCG</option>
                <option value="Magic">Magic TCG</option>
              </select>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">
            {jugadoresFiltrados.length} jugadores encontrados
          </p>
        </div>

        {/* Tabla de jugadores */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
          {cargando ? (
            <p className="text-center py-8 text-slate-400">Cargando jugadores...</p>
          ) : jugadoresFiltrados.length === 0 ? (
            <p className="text-center py-8 text-slate-400">No se encontraron jugadores.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-700/50 text-left text-xs text-slate-400 uppercase">
                    <th className="px-4 py-3">Jugador</th>
                    <th className="px-4 py-3">Juego</th>
                    <th className="px-4 py-3">Player ID</th>
                    <th className="px-4 py-3">Eventos</th>
                    <th className="px-4 py-3">Registrado</th>
                    <th className="px-4 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {jugadoresFiltrados.map((j) => (
                    <tr key={j.id} className="border-t border-slate-700 hover:bg-slate-700/30">
                      <td className="px-4 py-3">
                        <p className="font-medium">{j.nombre}</p>
                        <p className="text-xs text-slate-500">{j.correo}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${j.juego === 'Pokémon' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-purple-500/20 text-purple-400'}`}>
                          {j.juego}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-mono">{j.player_id || '—'}</td>
                      <td className="px-4 py-3">
                        {j.eventos.length === 0 ? (
                          <span className="text-sm text-slate-500">Sin eventos</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {j.eventos.map((e, idx) => (
                              <span key={idx} className="inline-block bg-slate-700/60 border border-slate-600 rounded px-1.5 py-0.5 text-xs">
                                {e.titulo}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {j.creado_en ? new Date(j.creado_en).toLocaleDateString('es-MX') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => eliminarJugador(j.id)}
                          className="text-red-400 hover:text-red-300 p-1.5 rounded hover:bg-red-500/10"
                          title="Eliminar jugador"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}