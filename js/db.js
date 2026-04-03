// =====================================================
// MUNDIAL 2026 - Capa de base de datos (Supabase)
// =====================================================

// Inicializar cliente Supabase
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.db = {

  // ---------------------------------------------------
  // PARTICIPANTES
  // ---------------------------------------------------

  /**
   * Registra un participante (upsert por nombre)
   * @returns {Object} participante
   */
  async registrar(nombre) {
    const nombreLimpio = nombre.trim();
    // Comprobar si ya existe
    const { data: existe, error: errExiste } = await supabaseClient
      .from('participantes')
      .select('*')
      .ilike('nombre', nombreLimpio)
      .maybeSingle();

    if (errExiste) throw errExiste;
    if (existe) return existe;

    const { data, error } = await supabaseClient
      .from('participantes')
      .insert({ nombre: nombreLimpio })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Obtiene un participante por nombre (insensible a mayúsculas)
   */
  async getParticipante(nombre) {
    const { data, error } = await supabaseClient
      .from('participantes')
      .select('*')
      .ilike('nombre', nombre.trim())
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Obtiene todos los participantes ordenados por nombre
   */
  async getTodosParticipantes() {
    const { data, error } = await supabaseClient
      .from('participantes')
      .select('*')
      .order('nombre');

    if (error) throw error;
    return data || [];
  },

  // ---------------------------------------------------
  // PARTIDOS
  // ---------------------------------------------------

  /**
   * Obtiene partidos, opcionalmente filtrados por fase
   * @param {string|null} fase
   */
  async getPartidos(fase = null) {
    let query = supabaseClient
      .from('partidos')
      .select('*')
      .order('orden', { ascending: true });

    if (fase) {
      query = query.eq('fase', fase);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene todos los partidos
   */
  async getTodosPartidos() {
    return this.getPartidos(null);
  },

  /**
   * Guarda el resultado real de un partido
   */
  async guardarResultado(partidoId, golesLocal, golesVisitante) {
    const { data, error } = await supabaseClient
      .from('partidos')
      .update({
        goles_local: parseInt(golesLocal),
        goles_visitante: parseInt(golesVisitante),
        jugado: true,
        fecha: new Date().toISOString().split('T')[0]
      })
      .eq('id', partidoId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // ---------------------------------------------------
  // PREDICCIONES
  // ---------------------------------------------------

  /**
   * Guarda o actualiza una predicción (upsert)
   */
  async guardarPrediccion(participanteId, partidoId, golesLocal, golesVisitante) {
    const { data, error } = await supabaseClient
      .from('predicciones')
      .upsert({
        participante_id: participanteId,
        partido_id: parseInt(partidoId),
        goles_local: parseInt(golesLocal),
        goles_visitante: parseInt(golesVisitante)
      }, { onConflict: 'participante_id,partido_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Obtiene todas las predicciones de un participante, con info del partido
   */
  async getPrediccionesPorParticipante(participanteId) {
    const { data, error } = await supabaseClient
      .from('predicciones')
      .select(`
        *,
        partidos (*)
      `)
      .eq('participante_id', participanteId);

    if (error) throw error;
    return data || [];
  },

  /**
   * Obtiene todas las predicciones con info de participante y partido
   */
  async getTodasPredicciones() {
    const { data, error } = await supabaseClient
      .from('predicciones')
      .select(`
        *,
        participantes (id, nombre),
        partidos (*)
      `);

    if (error) throw error;
    return data || [];
  },

  // ---------------------------------------------------
  // CAMPEÓN
  // ---------------------------------------------------

  /**
   * Guarda o actualiza el campeón predicho por un participante
   */
  async guardarCampeon(participanteId, equipo) {
    const { data, error } = await supabaseClient
      .from('campeon_predicho')
      .upsert({
        participante_id: participanteId,
        equipo: equipo.trim()
      }, { onConflict: 'participante_id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * Obtiene el campeón predicho por un participante
   */
  async getCampeon(participanteId) {
    const { data, error } = await supabaseClient
      .from('campeon_predicho')
      .select('*')
      .eq('participante_id', participanteId)
      .maybeSingle();

    if (error) throw error;
    return data;
  },

  /**
   * Obtiene todos los campeones predichos con info del participante
   */
  async getTodosCampeones() {
    const { data, error } = await supabaseClient
      .from('campeon_predicho')
      .select(`
        *,
        participantes (id, nombre)
      `);

    if (error) throw error;
    return data || [];
  },

  // ---------------------------------------------------
  // EQUIPOS
  // ---------------------------------------------------

  /**
   * Obtiene todos los equipos ordenados por grupo y nombre
   */
  async getEquipos() {
    const { data, error } = await supabaseClient
      .from('equipos')
      .select('*')
      .order('grupo')
      .order('nombre');

    if (error) throw error;
    return data || [];
  },

  /**
   * Guarda array de equipos (upsert por nombre)
   * @param {Array} equiposArray - [{ nombre, grupo }]
   */
  async guardarEquipos(equiposArray) {
    // Limpiar array: filtrar vacíos
    const equiposLimpios = equiposArray.filter(e => e.nombre && e.nombre.trim() !== '');

    if (equiposLimpios.length === 0) return [];

    // Primero eliminar equipos existentes del mismo grupo para hacer upsert limpio
    const grupos = [...new Set(equiposLimpios.map(e => e.grupo))];
    for (const grupo of grupos) {
      await supabaseClient.from('equipos').delete().eq('grupo', grupo);
    }

    const { data, error } = await supabaseClient
      .from('equipos')
      .insert(equiposLimpios.map(e => ({ nombre: e.nombre.trim(), grupo: e.grupo })))
      .select();

    if (error) throw error;
    return data || [];
  },

  // ---------------------------------------------------
  // GENERACIÓN DE PARTIDOS
  // ---------------------------------------------------

  /**
   * Genera los partidos de fase de grupos (round-robin)
   * Para cada grupo de 4 equipos: 6 partidos (todos contra todos)
   * Pares: (0v1, 2v3), (0v2, 1v3), (0v3, 1v2)
   */
  async generarPartidosGrupos() {
    // Obtener todos los equipos
    const equipos = await this.getEquipos();
    if (equipos.length === 0) throw new Error('No hay equipos registrados');

    // Agrupar por grupo
    const porGrupo = {};
    for (const eq of equipos) {
      if (!porGrupo[eq.grupo]) porGrupo[eq.grupo] = [];
      porGrupo[eq.grupo].push(eq.nombre);
    }

    // Eliminar partidos de grupos existentes
    const { error: errDel } = await supabaseClient
      .from('partidos')
      .delete()
      .eq('fase', 'grupos');

    if (errDel) throw errDel;

    // Jornadas de grupos (pares predefinidos para 4 equipos, rotación estándar)
    const jornadas = [
      [[0, 1], [2, 3]],
      [[0, 2], [1, 3]],
      [[0, 3], [1, 2]]
    ];

    const grupos = Object.keys(porGrupo).sort();
    const nuevosPartidos = [];
    let orden = 1;
    let numeroPartido = 1;

    // Para cada jornada, todos los grupos
    for (let jornada = 0; jornada < 3; jornada++) {
      for (const grupo of grupos) {
        const equiposGrupo = porGrupo[grupo];
        if (equiposGrupo.length < 4) continue;

        for (const par of jornadas[jornada]) {
          nuevosPartidos.push({
            numero: numeroPartido++,
            fase: 'grupos',
            grupo: grupo,
            equipo_local: equiposGrupo[par[0]],
            equipo_visitante: equiposGrupo[par[1]],
            jugado: false,
            orden: orden++
          });
        }
      }
    }

    if (nuevosPartidos.length === 0) throw new Error('No se pudieron generar partidos');

    const { data, error } = await supabaseClient
      .from('partidos')
      .insert(nuevosPartidos)
      .select();

    if (error) throw error;
    return data || [];
  },

  /**
   * Guarda partidos de fase eliminatoria (octavos, cuartos, semis, etc.)
   * @param {string} fase
   * @param {Array} matchesArray - [{ equipo_local, equipo_visitante }]
   */
  async guardarPartidosEliminatoria(fase, matchesArray) {
    // Eliminar partidos existentes de esa fase
    await supabaseClient.from('partidos').delete().eq('fase', fase);

    // Calcular orden base según fase
    const ordenBase = {
      'octavos': 1000,
      'cuartos': 1100,
      'semis': 1200,
      'tercer_puesto': 1290,
      'final': 1300
    };

    const base = ordenBase[fase] || 1000;
    const nuevosPartidos = matchesArray
      .filter(m => m.equipo_local || m.equipo_visitante)
      .map((m, i) => ({
        fase: fase,
        equipo_local: m.equipo_local || 'Por definir',
        equipo_visitante: m.equipo_visitante || 'Por definir',
        jugado: false,
        orden: base + i
      }));

    if (nuevosPartidos.length === 0) return [];

    const { data, error } = await supabaseClient
      .from('partidos')
      .insert(nuevosPartidos)
      .select();

    if (error) throw error;
    return data || [];
  },

  // ---------------------------------------------------
  // CLASIFICACIÓN Y ESTADÍSTICAS
  // ---------------------------------------------------

  /**
   * Calcula la clasificación completa
   * @returns {Array} participantes con puntos, ordenados
   */
  async calcularClasificacion() {
    // Obtener todos los datos necesarios
    const [participantes, predicciones, campeones, partidos] = await Promise.all([
      this.getTodosParticipantes(),
      this.getTodasPredicciones(),
      this.getTodosCampeones(),
      this.getTodosPartidos()
    ]);

    // Obtener el campeón real (el equipo ganador de la final jugada)
    const final = partidos.find(p => p.fase === 'final' && p.jugado);
    let campeonReal = null;
    if (final) {
      const gl = parseInt(final.goles_local);
      const gv = parseInt(final.goles_visitante);
      if (!isNaN(gl) && !isNaN(gv)) {
        campeonReal = gl > gv ? final.equipo_local : final.equipo_visitante;
      }
    }

    // Mapa de partidos por id
    const partidosPorId = {};
    for (const p of partidos) {
      partidosPorId[p.id] = p;
    }

    // Mapa de campeones por participante_id
    const campeonPorParticipante = {};
    for (const c of campeones) {
      campeonPorParticipante[c.participante_id] = c.equipo;
    }

    // Calcular puntos por participante
    const resultado = participantes.map(part => {
      const predsParticipante = predicciones.filter(p => p.participante_id === part.id);

      let puntos = 0;
      let exactos = 0;
      let correctos = 0;

      for (const pred of predsParticipante) {
        const partido = pred.partidos || partidosPorId[pred.partido_id];
        if (!partido || !partido.jugado) continue;

        const pts = scoring.calcularPuntos(pred, partido);
        puntos += pts;

        if (pts === scoring.PUNTOS_EXACTO) exactos++;
        else if (pts === scoring.PUNTOS_CORRECTO) correctos++;
      }

      // Puntos de campeón
      const campeonPredicho = campeonPorParticipante[part.id];
      let puntosBonus = 0;
      if (campeonReal && campeonPredicho) {
        puntosBonus = scoring.calcularPuntosCampeon(campeonPredicho, campeonReal);
        puntos += puntosBonus;
      }

      return {
        id: part.id,
        nombre: part.nombre,
        puntos,
        exactos,
        correctos,
        campeon_predicho: campeonPredicho || null,
        puntos_campeon: puntosBonus
      };
    });

    // Ordenar por puntos (desc), luego exactos (desc), luego nombre
    resultado.sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos;
      if (b.exactos !== a.exactos) return b.exactos - a.exactos;
      return a.nombre.localeCompare(b.nombre);
    });

    // Asignar posición
    resultado.forEach((r, i) => {
      r.posicion = i + 1;
    });

    return resultado;
  },

  // ---------------------------------------------------
  // FUNCIONES PARA EL BRACKET ELIMINATORIO
  // ---------------------------------------------------

  async insertarPartidos(partidos) {
    const { data, error } = await supabaseClient
      .from('partidos')
      .insert(partidos)
      .select();
    if (error) throw error;
    return data || [];
  },

  async borrarEliminatorias() {
    const { error } = await supabaseClient
      .from('partidos')
      .delete()
      .neq('fase', 'grupos');
    if (error) throw error;
  },

  // Actualiza equipo_local o equipo_visitante de un partido buscado por su campo grupo (label)
  async actualizarEquipoEnPartido(label, slot, equipo) {
    const update = slot === 'local'
      ? { equipo_local: equipo }
      : { equipo_visitante: equipo };
    const { error } = await supabaseClient
      .from('partidos')
      .update(update)
      .eq('grupo', label);
    if (error) throw error;
  },

  async existenEliminatorias() {
    const { data, error } = await supabaseClient
      .from('partidos')
      .select('id')
      .eq('fase', 'octavos')
      .limit(1);
    if (error) return false;
    return data && data.length > 0;
  },

  /**
   * Calcula la evolución de puntos día a día
   * @returns {Object} { fechas: [], series: [{ nombre, data: [] }] }
   */
  async calcularEvolucion() {
    const [participantes, predicciones, partidos, campeones] = await Promise.all([
      this.getTodosParticipantes(),
      this.getTodasPredicciones(),
      this.getTodosPartidos(),
      this.getTodosCampeones()
    ]);

    // Filtrar partidos jugados con fecha
    const jugados = partidos
      .filter(p => p.jugado && p.fecha)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    if (jugados.length === 0) {
      return { fechas: [], series: [] };
    }

    // Obtener fechas únicas ordenadas
    const fechasSet = new Set(jugados.map(p => p.fecha));
    const fechas = [...fechasSet].sort();

    // Campeón real
    const final = jugados.find(p => p.fase === 'final');
    let campeonReal = null;
    if (final) {
      const gl = parseInt(final.goles_local);
      const gv = parseInt(final.goles_visitante);
      if (!isNaN(gl) && !isNaN(gv)) {
        campeonReal = gl > gv ? final.equipo_local : final.equipo_visitante;
      }
    }

    // Mapa campeón por participante
    const campeonPorParticipante = {};
    for (const c of campeones) {
      campeonPorParticipante[c.participante_id] = c.equipo;
    }

    // Para cada participante, calcular puntos acumulados por fecha
    const series = participantes.map(part => {
      const predsParticipante = predicciones.filter(p => p.participante_id === part.id);

      // Mapa predicciones por partido_id
      const predPorPartido = {};
      for (const pred of predsParticipante) {
        predPorPartido[pred.partido_id] = pred;
      }

      let puntosAcumulados = 0;
      const data = fechas.map(fecha => {
        // Partidos jugados en esta fecha
        const partidosFecha = jugados.filter(p => p.fecha === fecha);

        for (const partido of partidosFecha) {
          const pred = predPorPartido[partido.id];
          if (pred) {
            puntosAcumulados += scoring.calcularPuntos(pred, partido);
          }

          // Si este partido es la final y hay campeón
          if (partido.fase === 'final' && campeonReal) {
            const campeonPredicho = campeonPorParticipante[part.id];
            if (campeonPredicho) {
              puntosAcumulados += scoring.calcularPuntosCampeon(campeonPredicho, campeonReal);
            }
          }
        }

        return puntosAcumulados;
      });

      return {
        nombre: part.nombre,
        data
      };
    });

    return { fechas, series };
  }
};
