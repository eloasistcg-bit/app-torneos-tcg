'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface Evento {
  id: number;
  titulo: string;
  descripcion: string | null;
  juego: string;
  fecha_inicio: string;
  fecha_fin: string | null;
  hora: string | null;
  ubicacion: string | null;
  capacidad: number | null;
  created_at: string;
}

interface Inscripcion {
  id: number;
  nombre: string;
  correo: string;
  juego: string;
  player_id: string;
  evento_id: number;
  created_at: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [inscripciones, setInscripciones] = useState<Inscripcion[]>([]);
  const [inscripcionesPorEvento, setInscripcionesPorEvento] = useState<Record<number, Inscripcion[]>>({});
  const [cargando, setCargando] = useState(true);
  const [mensaje, setMensaje] = useState({ texto: '', tipo: '' });

  // Formulario
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [juego, setJuego] = useState<'Pokémon' | 'Magic'>('Pokémon');
  const [fecha, setFecha] = useState('');
  const [hora, setHora] = useState('18:00');
  const [ubicacion, setUbicacion] = useState('El Oasis TCG');
  const [capacidad, setCapacidad] = useState(8);
  const [guardando, setGuardando] = useState(false);

  // Estados para edición de eventos
  const [editandoEvento, setEditandoEvento] = useState<Evento | null>(null);
  const [editTitulo, setEditTitulo] = useState('');
  const [editDescripcion, setEditDescripcion] = useState('');
  const [editJuego, setEditJuego] = useState<'Pokémon' | 'Magic'>('Pokémon');
  const [editFecha, setEditFecha] = useState('');
  const [editHora, setEditHora] = useState('18:00');
  const [editUbicacion, setEditUbicacion] = useState('El Oasis TCG');
  const [editCapacidad, setEditCapacidad] = useState(8);

  // Estado para ver inscripciones por evento
  const [eventoSeleccionado, setEventoSeleccionado] = useState<number | null>(null);

  useEffect(() => {
    async function cargarDatos() {
      // Cargar eventos
      const { data: eventosData, error: eventosError } = await supabase
        .from('eventos')
        .select('*')
        .order('fecha_inicio', { ascending: true });
      
      if (!eventosError) setEventos(eventosData || []);

      // Cargar inscripciones
      const { data: inscripcionesData, error: inscripcionesError } = await supabase
        .from('inscripciones')
        .select('*')
        .order('created_at', { ascending: false });

      if (!inscripcionesError) {
        setInscripciones(inscripcionesData || []);
        const agrupadas: Record<number, Inscripcion[]> = {};
        (inscripcionesData || []).forEach((ins: Inscripcion) => {
          if (!agrupadas[ins.evento_id]) agrupadas[ins.evento_id] = [];
          agrupadas[ins.evento_id].push(ins);
        });
        setInscripcionesPorEvento(agrupadas);
      }
      setCargando(false);
    }
    cargarDatos();
  }, []);

  const cerrarSesion = async () => {
    await fetch('/api/admin/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const iniciarEdicion = (evento: Evento) => {
    setEditandoEvento(evento);
    setEditTitulo(evento.titulo);
    setEditDescripcion(evento.descripcion || '');
    setEditJuego(evento.juego === 'Magic' ? 'Magic' : 'Pokémon');
    setEditFecha(evento.fecha_inicio ? new Date(evento.fecha_inicio).toISOString().split('T')[0] : '');
    setEditHora(evento.hora || '18:00');
    setEditUbicacion(evento.ubicacion || 'El Oasis TCG');
    setEditCapacidad(evento.capacidad || 8);
  };

  const manejarActualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editandoEvento) return;
    setGuardando(true);
    setMensaje({ texto: '', tipo: '' });

    const fechaISO = editFecha ? new Date(`${editFecha}T${editHora}`).toISOString() : null;

    try {
      const { error } = await supabase
        .from('eventos')
        .update({
          titulo: editTitulo,
          descripcion: editDescripcion || null,
          juego: editJuego,
          fecha_inicio: fechaISO,
          hora: editHora,
          ubicacion: editUbicacion,
          capacidad: editCapacidad
        })
        .eq('id', editandoEvento.id);

      if (error) {
        setMensaje({ texto: `❌ Error: ${error.message}`, tipo: 'error' });
      } else {
        setMensaje({ texto: '✅ ¡Evento actualizado exitosamente!', tipo: 'exito' });
        setEditandoEvento(null);
        const { data } = await supabase.from('eventos').select('*').order('fecha_inicio', { ascending: true });
        setEventos(data || []);
      }
    } catch (err) {
      setMensaje({ texto: `❌ Error: ${(err as Error).message}`, tipo: 'error' });
    } finally {
      setGuardando(false);
    }
  };

  const manejarEliminarInscripcion = async (inscripcionId: number) => {
    if (!confirm('¿Eliminar esta inscripción?')) return;
    const { error } = await supabase.from('inscripciones').delete().eq('id', inscripcionId);
    if (!error) {
      setInscripciones(inscripciones.filter(i => i.id !== inscripcionId));
      setInscripcionesPorEvento(prev => {
        const nueva = { ...prev };
        for (const [eventoId, lista] of Object.entries(nueva)) {
          nueva[Number(eventoId)] = lista.filter(i => i.id !== inscripcionId);
        }
        return nueva;
      });
      setMensaje({ texto: '🗑️ Inscripción eliminada', tipo: 'exito' });
    }
  };

  const manejarCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);
    setMensaje({ texto: '', tipo: '' });

    const fechaISO = fecha ? new Date(`${fecha}T${hora}`).toISOString() : null;

    try {
      const { error } = await supabase.from('eventos').insert([{
        titulo,
        descripcion: descripcion || null,
        juego,
        fecha_inicio: fechaISO,
        fecha_fin: null,
        hora,
        ubicacion,
        capacidad
      }]);

      if (error) {
        setMensaje({ texto: `❌ Error: ${error.message}`, tipo: 'error' });
      } else {
        setMensaje({ texto: '✅ ¡Evento creado exitosamente!', tipo: 'exito' });
        setTitulo('');
        setDescripcion('');
        // Recargar eventos
        const { data } = await supabase.from('eventos').select('*').order('fecha_inicio', { ascending: true });
        setEventos(data || []);
      }
    } catch (err) {
      setMensaje({ texto: `❌ Error: ${(err as Error).message}`, tipo: 'error' });
    } finally {
      setGuardando(false);
    }
  };

  const manejarEliminar = async (id: number) => {
    if (!confirm('¿Seguro que quieres eliminar este evento?')) return;
    const { error } = await supabase.from('eventos').delete().eq('id', id);
    if (!error) {
      setEventos(eventos.filter(e => e.id !== id));
      setMensaje({ texto: '🗑️ Evento eliminado', tipo: 'exito' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
          <div className="flex items-center space-x-4">
            <Image src="/logo.png" alt="El Oasis TCG" width={64} height={64} className="w-16 h-16 rounded-full border-2 border-blue-500" />
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                El Oasis TCG
              </h1>
              <p className="text-xs text-slate-400">Panel de Administración</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-medium transition">
              ← Volver al calendario
            </Link>
            <button
              onClick={cerrarSesion}
              className="bg-red-600/80 hover:bg-red-600 px-4 py-2 rounded-lg font-medium transition text-sm"
              title="Cerrar sesión"
            >
              🚪 Salir
            </button>
          </div>
        </header>

        {mensaje.texto && (
          <div className={`p-4 rounded-lg mb-6 text-sm font-medium border ${
            mensaje.tipo === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/30' : 'bg-green-500/10 text-green-400 border-green-500/30'
          }`}>{mensaje.texto}</div>
        )}

        {/* Modal de edición */}
        {editandoEvento && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-600 rounded-2xl p-8 w-full max-w-xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">✏️ Editar Evento</h2>
                <button
                  onClick={() => setEditandoEvento(null)}
                  className="text-4xl leading-none text-slate-400 hover:text-white transition"
                  aria-label="Cerrar modal"
                >
                  ×
                </button>
              </div>
              <form onSubmit={manejarActualizar} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Título del evento *</label>
                  <input
                    type="text"
                    required
                    value={editTitulo}
                    onChange={(e) => setEditTitulo(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Descripción</label>
                  <textarea
                    value={editDescripcion}
                    onChange={(e) => setEditDescripcion(e.target.value)}
                    rows={3}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Juego</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setEditJuego('Pokémon')}
                      className={`py-2 rounded-lg font-semibold border transition ${editJuego === 'Pokémon' ? 'bg-yellow-500 text-slate-950 border-yellow-500' : 'border-slate-600 text-slate-400 hover:border-yellow-500/50'}`}
                    >
                      Pokémon TCG
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditJuego('Magic')}
                      className={`py-2 rounded-lg font-semibold border transition ${editJuego === 'Magic' ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-600 text-slate-400 hover:border-purple-600/50'}`}
                    >
                      Magic: The Gathering
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Fecha *</label>
                    <input
                      type="date"
                      required
                      value={editFecha}
                      onChange={(e) => setEditFecha(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Hora</label>
                    <input
                      type="time"
                      value={editHora}
                      onChange={(e) => setEditHora(e.target.value)}
                      className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Ubicación</label>
                  <input
                    type="text"
                    value={editUbicacion}
                    onChange={(e) => setEditUbicacion(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Capacidad ({editCapacidad} jugadores)</label>
                  <input
                    type="range"
                    min="4"
                    max="32"
                    value={editCapacidad}
                    onChange={(e) => setEditCapacidad(parseInt(e.target.value))}
                    className="w-full accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>4</span><span>32</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={guardando}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 py-3 rounded-lg font-bold transition shadow-lg"
                  >
                    {guardando ? 'Guardando...' : '💾 Guardar Cambios'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditandoEvento(null)}
                    className="px-6 bg-slate-700 hover:bg-slate-600 py-3 rounded-lg font-bold transition"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulario para crear evento */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-blue-400">+</span> Crear Nuevo Evento
            </h2>
            <form onSubmit={manejarCrear} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Título del evento *</label>
                <input
                  type="text"
                  required
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Torneo Local Pokémon"
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Descripción</label>
                <textarea
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="Ej. Torneo estándar, formato moderno..."
                  rows={3}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Juego</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setJuego('Pokémon')}
                    className={`py-2 rounded-lg font-semibold border transition ${juego === 'Pokémon' ? 'bg-yellow-500 text-slate-950 border-yellow-500' : 'border-slate-600 text-slate-400 hover:border-yellow-500/50'}`}
                  >
                    Pokémon TCG
                  </button>
                  <button
                    type="button"
                    onClick={() => setJuego('Magic')}
                    className={`py-2 rounded-lg font-semibold border transition ${juego === 'Magic' ? 'bg-purple-600 text-white border-purple-600' : 'border-slate-600 text-slate-400 hover:border-purple-600/50'}`}
                  >
                    Magic: The Gathering
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Hora</label>
                  <input
                    type="time"
                    value={hora}
                    onChange={(e) => setHora(e.target.value)}
                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Ubicación</label>
                <input
                  type="text"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Capacidad ({capacidad} jugadores)</label>
                <input
                  type="range"
                  min="4"
                  max="32"
                  value={capacidad}
                  onChange={(e) => setCapacidad(parseInt(e.target.value))}
                  className="w-full accent-blue-600"
                />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>4</span><span>32</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={guardando}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 py-3 rounded-lg font-bold transition mt-4 shadow-lg"
              >
                {guardando ? 'Guardando...' : '📅 Agregar Evento'}
              </button>
            </form>
          </div>

          {/* Lista de eventos existentes */}
          <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span className="text-teal-400">📋</span> Eventos ({eventos.length})
            </h2>

            {cargando ? (
              <p className="text-slate-400 text-center py-8">Cargando eventos...</p>
            ) : eventos.length === 0 ? (
              <p className="text-slate-400 text-center py-8">
                No hay eventos. Crea el primero con el formulario.
              </p>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {eventos.map((evento) => (
                  <div key={evento.id} className="bg-slate-700/40 p-4 rounded-lg border border-slate-600">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded mb-1 ${
                          evento.juego === 'Pokémon' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-purple-500/20 text-purple-400'
                        }`}>{evento.juego}</span>
                        <h3 className="font-bold">{evento.titulo}</h3>
                        <p className="text-sm text-slate-400">
                          📅 {new Date(evento.fecha_inicio).toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long' })}
                          {evento.hora && ` · 🕐 ${evento.hora}`}
                        </p>
                        {evento.capacidad && (
                          <p className="text-xs text-slate-500">👥 Capacidad: {evento.capacidad}</p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => iniciarEdicion(evento)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 p-2 rounded-lg transition text-sm"
                          title="Editar evento"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => setEventoSeleccionado(eventoSeleccionado === evento.id ? null : evento.id)}
                          className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10 p-2 rounded-lg transition text-sm"
                          title="Ver inscripciones"
                        >
                          👥 {inscripcionesPorEvento[evento.id]?.length || 0}
                        </button>
                        <button
                          onClick={() => manejarEliminar(evento.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-2 rounded-lg transition text-sm"
                          title="Eliminar evento"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>

                    {eventoSeleccionado === evento.id && (
                      <div className="mt-3 pt-3 border-t border-slate-600">
                        <h4 className="text-sm font-semibold text-slate-300 mb-2">
                          📋 Inscripciones ({inscripcionesPorEvento[evento.id]?.length || 0})
                        </h4>
                        {inscripcionesPorEvento[evento.id]?.length ? (
                          <div className="space-y-2">
                            {inscripcionesPorEvento[evento.id].map((ins) => (
                              <div key={ins.id} className="bg-slate-800/80 p-3 rounded-lg border border-slate-700 flex justify-between items-center">
                                <div>
                                  <p className="font-medium text-sm">
                                    <span className={ins.juego === 'Pokémon' ? 'text-yellow-400' : 'text-purple-400'}>■</span> {ins.nombre}
                                  </p>
                                  <p className="text-xs text-slate-500">{ins.correo}</p>
                                  {ins.player_id && <p className="text-xs text-slate-500">🆔 {ins.player_id}</p>}
                                  <p className="text-xs text-slate-600">
                                    Registrado: {new Date(ins.created_at).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                                <button
                                  onClick={() => manejarEliminarInscripcion(ins.id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10 p-1.5 rounded-lg transition text-xs"
                                  title="Eliminar inscripción"
                                >
                                  🗑️
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-slate-500">No hay inscripciones para este evento.</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}