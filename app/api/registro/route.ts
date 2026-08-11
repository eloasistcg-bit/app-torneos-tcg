import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, correo, juego, playerId, eventoId } = body

    if (!nombre || !correo || !juego || !playerId || !eventoId) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      )
    }

    // 1) Registrar jugador en tabla jugadores (si no existe)
    const { data: jugadorExistente, error: errorBuscar } = await supabase
      .from('jugadores')
      .select('*')
      .eq('correo', correo)
      .eq('juego', juego)
      .maybeSingle()

    if (errorBuscar) {
      console.error('Error al buscar jugador:', errorBuscar)
      return NextResponse.json(
        { error: 'No se pudo completar la inscripción' },
        { status: 500 }
      )
    }

    let jugadorId: number | undefined

    if (jugadorExistente) {
      jugadorId = jugadorExistente.id
    } else {
      const { data: jugadorNuevo, error: errorInsertar } = await supabase
        .from('jugadores')
        .insert([{ nombre, correo, juego, player_id: playerId }])
        .select()
        .single()

      if (errorInsertar) {
        console.error('Error al insertar jugador:', errorInsertar)
        return NextResponse.json(
          { error: 'No se pudo completar la inscripción' },
          { status: 500 }
        )
      }
      jugadorId = jugadorNuevo.id
    }

    // 2) Crear relación evento_jugadores (si no existe)
    if (jugadorId) {
      await supabase
        .from('evento_jugadores')
        .upsert(
          { evento_id: eventoId, jugador_id: jugadorId },
          { onConflict: 'evento_id,jugador_id', ignoreDuplicates: true }
        )
    }

    // 3) Registrar inscripción
    const { data, error } = await supabase
      .from('inscripciones')
      .insert([
        {
          nombre,
          correo,
          juego,
          player_id: playerId,
          evento_id: eventoId,
        },
      ])
      .select()
      .single()

    if (error) {
      console.error('Error al insertar en Supabase:', error)
      return NextResponse.json(
        { error: 'No se pudo completar la inscripción' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { mensaje: 'Inscripción exitosa', inscripcion: data },
      { status: 201 }
    )
  } catch {
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    )
  }
}