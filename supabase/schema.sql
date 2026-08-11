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
-- TABLA: inscripciones
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

-- Inscripciones: cualquier persona puede insertar
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Inscripciones insert publico" ON public.inscripciones;
CREATE POLICY "Inscripciones insert publico" ON public.inscripciones
  FOR INSERT WITH CHECK (true);

-- ============================================
-- DATOS DE EJEMPLO (opcional - descomenta si quieres)
-- ============================================
-- INSERT INTO public.eventos (titulo, descripcion, juego, fecha_inicio, hora, ubicacion, capacidad) VALUES
-- ('Torneo Local Pokémon', 'Torneo semanal estándar', 'Pokémon', now() + interval '3 days', '18:00', 'El Oasis TCG', 8),
-- ('League Night Magic', 'Noche de liga Modern', 'Magic', now() + interval '5 days', '19:00', 'El Oasis TCG', 8);