'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

interface Evento {
  id: number;
  titulo: string;
  juego: string;
  fecha_inicio: string;
}

export default function CalendarioPage() {
  const [filtro, setFiltro] = useState<'Día' | 'Semana' | 'Mes'>('Mes');
  const [eventos, setEventos] = useState<Evento[]>([]);
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

      const { data } = await query;
      setEventos(data || []);
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
              {eventos.map((evento) => (
                <div key={evento.id} className="flex justify-between items-center bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                  <div>
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded mb-2 ${
                      evento.juego === 'Pokémon' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-purple-500/20 text-purple-400'
                    }`}>{evento.juego}</span>
                    <h3 className="text-lg font-bold">{evento.titulo}</h3>
                    <p className="text-sm text-slate-400">Fecha: {new Date(evento.fecha_inicio).toLocaleDateString()}</p>
                  </div>
                  <a href={`/registro?evento=${evento.id}`} className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-md text-sm transition">
                    Inscribirse
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

