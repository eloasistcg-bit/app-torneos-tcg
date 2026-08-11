-- ============================================
-- LIMPIAR DATOS DE PRUEBA (inscripciones + jugadores demo)
-- Ejecutar en Supabase SQL Editor cuando quieras limpiar
-- ============================================

-- 1) Eliminar inscripciones de jugadores demo
DELETE FROM public.inscripciones
WHERE correo LIKE 'jugador.demo%@gmail.com'
   OR correo LIKE 'test.%@gmail.com'
   OR correo LIKE 'verificacion.%@gmail.com';

-- 2) Eliminar jugadores demo de la base de jugadores
DELETE FROM public.jugadores
WHERE correo LIKE 'jugador.demo%@gmail.com'
   OR correo LIKE 'test.%@gmail.com'
   OR correo LIKE 'verificacion.%@gmail.com';

-- 3) Verificar resultado
SELECT 'Inscripciones restantes' AS tabla, COUNT(*) AS total FROM public.inscripciones
UNION ALL
SELECT 'Jugadores restantes', COUNT(*) FROM public.jugadores;
