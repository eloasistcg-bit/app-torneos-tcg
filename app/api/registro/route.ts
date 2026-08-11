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