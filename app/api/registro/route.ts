import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nombre, correo, juego, playerId, eventoId } = body

    const esPokemon = juego === 'Pokémon'
    if (!nombre || !correo || !juego || !eventoId) {
      return NextResponse.json(
        { error: 'Todos los campos son obligatorios' },
        { status: 400 }
      )
    }

    if (esPokemon && !playerId) {
      return NextResponse.json(
        { error: 'El Player ID es obligatorio para Pokémon' },
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
      const datosJugador: Record<string, unknown> = {
        nombre,
        correo,
        juego,
      }
      if (playerId) {
        datosJugador.player_id = playerId
      }

      const { data: jugadorNuevo, error: errorInsertar } = await supabase
        .from('jugadores')
        .insert([datosJugador])
      .select()
      .single()

      if (errorInsertar) {
        console.error('Error al insertar jugador:', errorInsertar)
        if (errorInsertar.code === '23505') {
          const { data: existente } = await supabase
            .from('jugadores')
            .select('id')
            .eq('correo', correo)
            .eq('juego', juego)
            .maybeSingle()
          if (existente) jugadorId = existente.id
  }
        if (!jugadorId) {
    return NextResponse.json(
            { error: 'No se pudo completar la inscripción' },
            { status: 500 }
    )
        }
      } else {
        jugadorId = jugadorNuevo.id
      }
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
    const datosInscripcion: Record<string, unknown> = {
      nombre,
      correo,
      juego,
      evento_id: eventoId,
}
    if (playerId) {
      datosInscripcion.player_id = playerId
    }

    const { data, error } = await supabase
      .from('inscripciones')
      .insert([datosInscripcion])
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

