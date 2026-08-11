-- ============================================
-- REPARAR ESQUEMA PARA EL OASIS TCG
-- Este script ELIMINA y RECREA las tablas con la estructura correcta
-- ⚠️ EJECUTAR DESPUÉS DE RESPALDAR DATOS SI ES NECESARIO
-- ============================================

-- IMPORTANTE: Si tienes datos que quieras conservar,
-- haz un backup primero en Supabase (Database > Backup)

-- ============================================
-- 1. ELIMINAR TRIGGERS Y TABLAS EXISTENTES
-- ============================================

-- Eliminar políticas existentes (si hay)
DROP POLICY IF EXISTS "Eventos lectura publica" ON public.eventos;
DROP POLICY IF EXISTS "Inscripciones insert publico" ON public.inscripciones;

-- Eliminar tablas (orden correcto por FK)
DROP TABLE IF EXISTS public.inscripciones CASCADE;
DROP TABLE IF EXISTS public.eventos CASCADE;

-- ============================================
-- 2. RECREAR TABLA: eventos (con TODAS las columnas)
-- ============================================
CREATE TABLE public.eventos (
  id BIGSERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  juego TEXT NOT NULL DEFAULT 'Pokémon' CHECK (juego IN ('Pokémon', 'Magic')),
  fecha_inicio TIMESTAMPTZ NOT NULL,
  fecha_fin TIMESTAMPTZ,
  hora TEXT DEFAULT '18:00',
  ubicacion TEXT DEFAULT 'El Oasis TCG',
  capacidad INTEGER DEFAULT 8,
  nombre_participantes TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 3. RECREAR TABLA: inscripciones (con TODAS las columnas)
-- ============================================
CREATE TABLE public.inscripciones (
  id BIGSERIAL PRIMARY KEY,
  evento_id BIGINT REFERENCES public.eventos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  correo TEXT NOT NULL,
  juego TEXT NOT NULL,
  player_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- 4. POLÍTICAS DE SEGURIDAD (RLS)
-- ============================================

-- Eventos: lectura pública
ALTER TABLE public.eventos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Eventos lectura publica" ON public.eventos
  FOR SELECT USING (true);

-- Inscripciones: inserción pública
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Inscripciones insert publico" ON public.inscripciones
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 5. EVENTO DE MUESTRA (opcional)
-- ============================================
INSERT INTO public.eventos (titulo, descripcion, juego, fecha_inicio, hora, ubicacion, capacidad) VALUES
('Torneo Local Pokémon', 'Torneo semanal estándar - Bring your own deck', 'Pokémon', now() + interval '3 days', '18:00', 'El Oasis TCG', 8);

-- ============================================
-- 6. VERIFICACIÓN
-- ============================================
SELECT '✅ Tablas creadas correctamente' AS resultado;
