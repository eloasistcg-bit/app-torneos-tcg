-- ============================================
-- CORRECCIÓN: TABLAS DE JUGADORES
-- Elimina tablas incompletas y las recrea
-- ============================================

-- 1) Eliminar tablas existentes incompletas
DROP TABLE IF EXISTS public.evento_jugadores CASCADE;
DROP TABLE IF EXISTS public.jugadores CASCADE;

-- 2) Crear tabla jugadores (con player_id)
CREATE TABLE public.jugadores (
  id BIGSERIAL PRIMARY KEY,
  nombre TEXT NOT NULL,
  correo TEXT NOT NULL,
  juego TEXT NOT NULL,
  player_id TEXT,
  creado_en TIMESTAMPTZ DEFAULT now(),
  UNIQUE(correo, juego)
);

-- 3) Crear tabla evento_jugadores
CREATE TABLE public.evento_jugadores (
  id BIGSERIAL PRIMARY KEY,
  evento_id BIGINT REFERENCES public.eventos(id) ON DELETE CASCADE,
  jugador_id BIGINT REFERENCES public.jugadores(id) ON DELETE CASCADE,
  inscrito_en TIMESTAMPTZ DEFAULT now(),
  UNIQUE(evento_id, jugador_id)
);

-- 4) Índices
CREATE INDEX IF NOT EXISTS idx_jugadores_correo ON public.jugadores(correo);
CREATE INDEX IF NOT EXISTS idx_jugadores_player_id ON public.jugadores(player_id);
CREATE INDEX IF NOT EXISTS idx_evento_jugadores_evento ON public.evento_jugadores(evento_id);
CREATE INDEX IF NOT EXISTS idx_evento_jugadores_jugador ON public.evento_jugadores(jugador_id);

-- 5) Políticas RLS
ALTER TABLE public.jugadores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Jugadores lectura publica" ON public.jugadores;
CREATE POLICY "Jugadores lectura publica" ON public.jugadores
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Jugadores insert publico" ON public.jugadores;
CREATE POLICY "Jugadores insert publico" ON public.jugadores
  FOR INSERT WITH CHECK (true);

ALTER TABLE public.evento_jugadores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Evento jugadores lectura" ON public.evento_jugadores;
CREATE POLICY "Evento jugadores lectura" ON public.evento_jugadores
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Evento jugadores insert" ON public.evento_jugadores;
CREATE POLICY "Evento jugadores insert" ON public.evento_jugadores
  FOR INSERT WITH CHECK (true);

