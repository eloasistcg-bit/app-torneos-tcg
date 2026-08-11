-- ============================================
-- ESQUEMA PARA EL OASIS TCG
-- Cómo usar:
-- 1. Ve a tu dashboard de Supabase
-- 2. Abre SQL Editor
-- 3. Copia TODO este script y ejecútalo
-- ============================================

-- ============================================
-- TABLA: eventos
-- ============================================
CREATE TABLE IF NOT EXISTS public.eventos (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  juego TEXT NOT NULL DEFAULT 'Pokémon' CHECK (juego IN ('Pokémon', 'Magic')),
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ,
  hora TEXT,
  ubicacion TEXT DEFAULT 'El Oasis TCG',
  capacidad INTEGER DEFAULT 8,
  nombre_participantes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLA: jugadores
-- ============================================
CREATE TABLE IF NOT EXISTS public.jugadores (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  correo TEXT NOT NULL UNIQUE,
  juego TEXT NOT NULL,
  player_id TEXT UNIQUE,
  creado_en TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- TABLA: evento_jugadores (relación muchos a muchos)
-- ============================================
CREATE TABLE IF NOT EXISTS public.evento_jugadores (
  id BIGSERIAL PRIMARY KEY,
  evento_id BIGINT REFERENCES public.eventos(id) ON DELETE CASCADE,
  jugador_id BIGINT REFERENCES public.jugadores(id) ON DELETE CASCADE,
  inscrito_en TIMESTAMPTZ DEFAULT now(),
  UNIQUE(evento_id, jugador_id)
);

-- ============================================
-- TABLA: inscripciones (historial de inscripción)
-- ============================================
CREATE TABLE IF NOT EXISTS public.inscripciones (
  id BIGSERIAL PRIMARY KEY,
  evento_id BIGINT REFERENCES public.eventos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  correo TEXT NOT NULL,
  juego TEXT NOT NULL,
  player_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Eventos: cualquier persona puede leer
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Eventos lectura publica" ON public.eventos;
CREATE POLICY "Eventos lectura publica" ON public.eventos
  FOR SELECT USING (true);

-- Jugadores: cualquier persona puede insertar (para registro público)
ALTER TABLE public.jugadores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Jugadores insert publico" ON public.jugadores;
CREATE POLICY "Jugadores insert publico" ON public.jugadores
  FOR INSERT WITH CHECK (true);

-- Jugadores: lectura pública (para verificar duplicados en registro)
DROP POLICY IF EXISTS "Jugadores lectura publica" ON public.jugadores;
CREATE POLICY "Jugadores lectura publica" ON public.jugadores
  FOR SELECT USING (true);

-- evento_jugadores: cualquier persona puede insertar
ALTER TABLE public.evento_jugadores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Evento jugadores insert" ON public.evento_jugadores;
CREATE POLICY "Evento jugadores insert" ON public.evento_jugadores
  FOR INSERT WITH CHECK (true);

-- Inscripciones: cualquier persona puede insertar
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Inscripciones insert publico" ON public.inscripciones;
CREATE POLICY "Inscripciones insert publico" ON public.inscripciones
  FOR INSERT WITH CHECK (true);

-- ============================================
-- ÍNDICES PARA BÚSQUEDA RÁPIDA
-- ============================================
CREATE INDEX IF NOT EXISTS idx_jugadores_correo ON public.jugadores(correo);
CREATE INDEX IF NOT EXISTS idx_jugadores_player_id ON public.jugadores(player_id);
CREATE INDEX IF NOT EXISTS idx_evento_jugadores_evento ON public.evento_jugadores(evento_id);
CREATE INDEX IF NOT EXISTS idx_evento_jugadores_jugador ON public.evento_jugadores(jugador_id);
CREATE INDEX IF NOT EXISTS idx_inscripciones_evento ON public.inscripciones(evento_id);

-- ============================================
-- DATOS DE EJEMPLO (opcional)
-- ============================================
-- INSERT INTO public.eventos (titulo, descripcion, juego, fecha_inicio, hora, ubicacion, capacidad) VALUES
-- ('Torneo Local Pokémon', 'Torneo semanal estándar', 'Pokémon', now() + interval '3 days', '18:00', 'El Oasis TCG', 8),
-- ('League Night Magic', 'Noche de liga Modern', 'Magic', now() + interval '5 days', '19:00', 'El Oasis TCG', 8);