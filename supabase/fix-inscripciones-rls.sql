-- ============================================
-- CORRECCIÓN: POLÍTICA RLS PARA INSCRIPCIONES
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- Asegurar que RLS esté activo
ALTER TABLE public.inscripciones ENABLE ROW LEVEL SECURITY;

-- Política para INSERT público (registro desde el formulario)
DROP POLICY IF EXISTS "Inscripciones insert publico" ON public.inscripciones;
CREATE POLICY "Inscripciones insert publico" ON public.inscripciones
  FOR INSERT WITH CHECK (true);

-- Política para SELECT público (ver inscripciones)
DROP POLICY IF EXISTS "Inscripciones lectura publica" ON public.inscripciones;
CREATE POLICY "Inscripciones lectura publica" ON public.inscripciones
  FOR SELECT USING (true);

-- Política para DELETE (admin puede eliminar)
DROP POLICY IF EXISTS "Inscripciones delete publico" ON public.inscripciones;
CREATE POLICY "Inscripciones delete publico" ON public.inscripciones
  FOR DELETE USING (true);

-- Verificar: SELECT policy_name FROM pg_policies WHERE tablename = 'inscripciones';
