import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const TEAM_MAP: Record<string, string> = {
  'Mexico': 'México', 'South Africa': 'Sudáfrica', 'Korea Republic': 'Corea del Sur',
  'South Korea': 'Corea del Sur', 'Czech Republic': 'Chequia', 'Czechia': 'Chequia',
  'Bosnia and Herzegovina': 'Bosnia y Herzegovina', 'Bosnia-Herzegovina': 'Bosnia y Herzegovina',
  'Switzerland': 'Suiza', 'Brazil': 'Brasil', 'Morocco': 'Marruecos', 'Haiti': 'Haití',
  'Scotland': 'Escocia', 'USA': 'Estados Unidos', 'United States': 'Estados Unidos',
  'Paraguay': 'Paraguay', 'Australia': 'Australia', 'Türkiye': 'Turquía', 'Turkey': 'Turquía',
  'Germany': 'Alemania', 'Curaçao': 'Curazao', "Côte d'Ivoire": 'Costa de Marfil',
  'Ivory Coast': 'Costa de Marfil', 'Ecuador': 'Ecuador', 'Netherlands': 'Países Bajos',
  'Japan': 'Japón', 'Sweden': 'Suecia', 'Tunisia': 'Túnez', 'Belgium': 'Bélgica',
  'Egypt': 'Egipto', 'Iran': 'Irán', 'New Zealand': 'Nueva Zelanda', 'Spain': 'España',
  'Cape Verde': 'Cabo Verde', 'Cape Verde Islands': 'Cabo Verde', 'Saudi Arabia': 'Arabia Saudita',
  'Uruguay': 'Uruguay', 'France': 'Francia', 'Senegal': 'Senegal', 'Iraq': 'Irak',
  'Norway': 'Noruega', 'Argentina': 'Argentina', 'Algeria': 'Argelia', 'Austria': 'Austria',
  'Jordan': 'Jordania', 'Portugal': 'Portugal', 'DR Congo': 'RD Congo', 'Congo DR': 'RD Congo',
  'Democratic Republic of Congo': 'RD Congo', 'Uzbekistan': 'Uzbekistán', 'Colombia': 'Colombia',
  'England': 'Inglaterra', 'Croatia': 'Croacia', 'Ghana': 'Ghana', 'Panama': 'Panamá',
  'Canada': 'Canadá', 'Qatar': 'Qatar',
}

// Mapeo de stages de la API → fases en nuestra DB
const STAGE_TO_FASE: Record<string, string> = {
  'ROUND_OF_32': 'octavos',
  'LAST_32': 'octavos',
  'ROUND_OF_16': 'cuartos',
  'LAST_16': 'cuartos',
  'QUARTER_FINALS': 'semis',
  'SEMI_FINALS': 'tercer_puesto',
  'THIRD_PLACE': 'tercer_puesto',
  'FINAL': 'final',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const footballKey = Deno.env.get('FOOTBALL_DATA_API_KEY') ?? ''

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Traer todos los partidos del Mundial desde football-data.org
    const res = await fetch('https://api.football-data.org/v4/competitions/WC/matches', {
      headers: { 'X-Auth-Token': footballKey }
    })
    if (!res.ok) throw new Error(`football-data.org HTTP ${res.status}`)
    const data = await res.json()
    const apiMatches: any[] = data.matches ?? []

    // Traer todos nuestros partidos
    const { data: todosPartidos } = await supabase.from('partidos').select('*')
    const partidos: any[] = todosPartidos ?? []

    let actualizados = 0
    const sinEncontrar: string[] = []

    // ── 1. FASE DE GRUPOS: emparejar por nombre de equipo ──────────────────
    const gruposApi = apiMatches.filter(m => m.stage === 'GROUP_STAGE')
    const gruposDB  = partidos.filter(p => p.fase === 'grupos')

    for (const match of gruposApi) {
      const utcDate = match.utcDate ? new Date(match.utcDate) : null
      const fecha = utcDate ? utcDate.toISOString().slice(0, 10) : null
      const hora  = utcDate ? utcDate.toISOString().slice(11, 19) : null

      const localNombre  = TEAM_MAP[match.homeTeam?.name] ?? match.homeTeam?.name
      const visitaNombre = TEAM_MAP[match.awayTeam?.name] ?? match.awayTeam?.name

      if (!localNombre || !visitaNombre) continue

      let partido = gruposDB.find(p =>
        p.equipo_local === localNombre && p.equipo_visitante === visitaNombre
      )
      let invertido = false
      if (!partido) {
        partido = gruposDB.find(p =>
          p.equipo_local === visitaNombre && p.equipo_visitante === localNombre
        )
        if (partido) invertido = true
      }

      if (partido) {
        const update: Record<string, any> = { fecha, hora }
        if (match.status === 'FINISHED') {
          const gl = match.score?.fullTime?.home
          const gv = match.score?.fullTime?.away
          if (gl != null && gv != null) {
            update.goles_local    = invertido ? gv : gl
            update.goles_visitante = invertido ? gl : gv
            update.jugado = true
          }
        }
        await supabase.from('partidos').update(update).eq('id', partido.id)
        actualizados++
      } else {
        sinEncontrar.push(`${localNombre} vs ${visitaNombre}`)
      }
    }

    // ── 2. FASES ELIMINATORIAS: emparejar por stage + orden cronológico ────
    const fasesElim = [...new Set(
      apiMatches
        .filter(m => m.stage !== 'GROUP_STAGE' && STAGE_TO_FASE[m.stage])
        .map(m => m.stage)
    )]

    for (const stage of fasesElim) {
      const fase = STAGE_TO_FASE[stage]

      // Partidos de la API para este stage, ordenados por fecha
      let apiStage = apiMatches
        .filter(m => m.stage === stage)
        .sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())

      // Si es tercer_puesto mezclamos SEMI_FINALS y THIRD_PLACE: semis van primero
      let dbStage: any[]
      if (stage === 'THIRD_PLACE') {
        // Solo el partido de 3er puesto (grupo = '3er Puesto')
        dbStage = partidos.filter(p => p.fase === 'tercer_puesto' && p.grupo === '3er Puesto')
          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      } else if (stage === 'SEMI_FINALS') {
        // Solo los partidos SF (grupo empieza por 'SF')
        dbStage = partidos.filter(p => p.fase === 'tercer_puesto' && p.grupo?.startsWith('SF'))
          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      } else {
        dbStage = partidos.filter(p => p.fase === fase)
          .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0))
      }

      for (let i = 0; i < Math.min(apiStage.length, dbStage.length); i++) {
        const match   = apiStage[i]
        const partido = dbStage[i]

        const utcDate = match.utcDate ? new Date(match.utcDate) : null
        const fecha = utcDate ? utcDate.toISOString().slice(0, 10) : null
        const hora  = utcDate ? utcDate.toISOString().slice(11, 19) : null

        const update: Record<string, any> = { fecha, hora }

        if (match.status === 'FINISHED') {
          const gl = match.score?.fullTime?.home
          const gv = match.score?.fullTime?.away
          if (gl != null && gv != null) {
            update.goles_local     = gl
            update.goles_visitante = gv
            update.jugado = true
            // También actualizar equipos si ya son conocidos
            const localNombre  = TEAM_MAP[match.homeTeam?.name] ?? match.homeTeam?.name
            const visitaNombre = TEAM_MAP[match.awayTeam?.name] ?? match.awayTeam?.name
            if (localNombre)  update.equipo_local     = localNombre
            if (visitaNombre) update.equipo_visitante = visitaNombre
          }
        }

        await supabase.from('partidos').update(update).eq('id', partido.id)
        actualizados++
      }
    }

    return new Response(JSON.stringify({ ok: true, actualizados, sinEncontrar }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
