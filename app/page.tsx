'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface Evento {
  id: number;
  titulo: string;
  descripcion: string | null;
  juego: string;
  fecha_inicio: string;
  hora: string | null;
  capacidad: number | null;
}

// Función para calcular color del semáforo basado en llenado
function obtenerColorSemaforo(registrados: number, capacidad: number): { color: string; fondo: string; texto: string; emoji: string } {
  const porcentaje = (registrados / capacidad) * 100;
  
  if (porcentaje >= 75) {
    // ROJO - casi lleno (75% - 100%)
    return { color: 'bg-red-500', fondo: 'bg-red-500/20 text-red-400 border-red-500/50', texto: '¡Casi lleno!', emoji: '🔴' };
  } else if (porcentaje >= 50) {
    // AMARILLO - medio (50% - 74%)
    return { color: 'bg-yellow-500', fondo: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50', texto: 'Más de la mitad', emoji: '🟡' };
  } else {
    // VERDE - disponible (0% - 49%)
    return { color: 'bg-green-500', fondo: 'bg-green-500/20 text-green-400 border-green-500/50', texto: 'Disponible', emoji: '🟢' };
  }
}

export default function CalendarioPage() {
  const [filtro, setFiltro] = useState<'Día' | 'Semana' | 'Mes'>('Mes');
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [inscripcionesPorEvento, setInscripcionesPorEvento] = useState<Record<number, number>>({});
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    async function obtenerEventos() {
      setCargando(true);
      let query = supabase.from('eventos').select('*');
      const hoy = new Date();
      
      if (filtro === 'Día') {
        const inicioDia = new Date(hoy.setHours(0,0,0,0)).toISOString();
        const finDia = new Date(hoy.setHours(23,59,59,999)).toISOString();
        query = query.gte('fecha_inicio', inicioDia).lte('fecha_inicio', finDia);
      } else if (filtro === 'Semana') {
        const primero = hoy.getDate() - hoy.getDay() + 1;
        const inicioSemana = new Date(hoy.setDate(primero)).toISOString();
        const finSemana = new Date(hoy.setDate(primero + 6)).toISOString();
        query = query.gte('fecha_inicio', inicioSemana).lte('fecha_inicio', finSemana);
      } else if (filtro === 'Mes') {
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1).toISOString();
        const finMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0, 23, 59, 59).toISOString();
        query = query.gte('fecha_inicio', inicioMes).lte('fecha_inicio', finMes);
      }

      const { data: eventosData } = await query;
      
      if (eventosData) {
        // Obtener conteo de inscripciones para todos los eventos
        const { data: inscripcionesData } = await supabase
          .from('inscripciones')
          .select('evento_id');

        const conteo: Record<number, number> = {};
        (inscripcionesData || []).forEach((ins) => {
          conteo[ins.evento_id] = (conteo[ins.evento_id] || 0) + 1;
        });
        
        setInscripcionesPorEvento(conteo);
        setEventos(eventosData);
      }
      
      setCargando(false);
    }
    obtenerEventos();
  }, [filtro]);

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
              <p className="text-xs text-slate-400">Calendario Oficial</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <a href="/admin" className="bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-medium transition" title="Administrar eventos">
              ⚙️
            </a>
            <a href="/registro" className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition shadow-lg">
              Inscribirse
            </a>
          </div>
        </header>

        <div className="flex space-x-2 mb-6 bg-slate-800 p-1.5 rounded-lg w-fit border border-slate-700">
          {(['Día', 'Semana', 'Mes'] as const).map((tipo) => (
            <button
              key={tipo}
              onClick={() => setFiltro(tipo)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                filtro === tipo ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {tipo}
            </button>
          ))}
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          {cargando ? (
            <p className="text-slate-400 text-center py-8">Buscando torneos...</p>
          ) : eventos.length === 0 ? (
            <p className="text-slate-400 text-center py-8">No hay eventos para este periodo.</p>
          ) : (
            <div className="space-y-4">
              {eventos.map((evento) => {
                const registrados = inscripcionesPorEvento[evento.id] || 0;
                const capacidad = evento.capacidad || 8;
                const semaforo = obtenerColorSemaforo(registrados, capacidad);
                const porcentaje = Math.round((registrados / capacidad) * 100);
                const fechaEvento = new Date(evento.fecha_inicio);
                if (evento.hora) {
                  const [horas, minutos] = evento.hora.split(':').map(Number);
                  fechaEvento.setHours(horas, minutos, 0, 0);
                }
                const eventoFinalizado = fechaEvento < new Date();

                return (
                  <div key={evento.id} className={`bg-slate-700/30 p-4 rounded-lg border ${eventoFinalizado ? 'border-slate-700/50 opacity-75' : 'border-slate-600'}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${
                            evento.juego === 'Pokémon' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-purple-500/20 text-purple-400'
                          }`}>{evento.juego}</span>
                          
                          {eventoFinalizado ? (
                            /* Evento finalizado */
                            <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border bg-slate-500/20 text-slate-400 border-slate-500/50">
                              ⚪ Finalizado
                            </span>
                          ) : (
                            /* Semáforo de capacidad */
                            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${semaforo.fondo}`}>
                              <span className="relative flex h-2.5 w-2.5">
                                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${semaforo.color}`}></span>
                                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${semaforo.color}`}></span>
                              </span>
                              {semaforo.emoji} {semaforo.texto} · {registrados}/{capacidad}
                            </span>
                          )}
                        </div>
                        
                        <h3 className="text-lg font-bold">{evento.titulo}</h3>
                        
                        {/* Descripción del evento */}
                        {evento.descripcion && (
                          <p className="text-sm text-slate-300 mt-1 italic">
                            📋 {evento.descripcion}
                          </p>
                        )}
                        
                        <p className="text-sm text-slate-400 mt-1">
                          📅 {new Date(evento.fecha_inicio).toLocaleDateString()}
                          {!eventoFinalizado && <span className="text-slate-500"> · Próximamente</span>}
                        </p>

                        {/* Barra de progreso (solo si no ha finalizado) */}
                        {!eventoFinalizado && (
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                              <span>Capacidad</span>
                              <span>{registrados}/{capacidad}</span>
                            </div>
                            <div className="w-full h-2 bg-slate-600/50 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${semaforo.color}`}
                                style={{ width: `${Math.min(porcentaje, 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-4 flex flex-col items-end gap-2">
                        {eventoFinalizado ? (
                          <span className="text-xs text-slate-500 whitespace-nowrap">✅ Realizado</span>
                        ) : (
                          <>
                            <span className="text-xs text-slate-400 whitespace-nowrap">
                              {registrados > 0 ? `${registrados} inscritos` : 'Sin inscritos'}
                            </span>
                            <a href={`/registro?evento=${evento.id}`} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md text-sm transition">
                              Inscribirse
                            </a>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Leyenda del semáforo */}
        <div className="mt-4 bg-slate-800/60 rounded-lg p-3 border border-slate-700 flex items-center justify-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
            Disponible
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 inline-block"></span>Más de la mitad
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            ¡Casi lleno!
          </span>
        </div>
      </div>
    </div>
  );
}
