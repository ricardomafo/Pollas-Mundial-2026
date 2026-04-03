// =====================================================
// MUNDIAL 2026 - Sistema de puntuación
// =====================================================

window.scoring = {
  PUNTOS_CAMPEON: 10,

  // Bonus por acertar el equipo que avanza en cada fase eliminatoria
  BONUS_FASE: {
    'octavos':       2,  // 16avos
    'cuartos':       3,  // 8vos
    'semis':         4,  // 4tos
    'tercer_puesto': 5,  // Semis (SF-1, SF-2)
    'tercer_puesto_3': 6, // 3er puesto
    'final':         7,  // Campeón y subcampeón
  },

  /**
   * Devuelve el resultado de un partido: 'L' local, 'V' visitante, 'E' empate
   */
  getResultado(local, visitante) {
    if (local == null || visitante == null) return null;
    const l = parseInt(local);
    const v = parseInt(visitante);
    if (l > v) return 'L';
    if (l < v) return 'V';
    return 'E';
  },

  /**
   * Devuelve el bonus de fase para un partido
   */
  getBonusFase(partido) {
    if (!partido || partido.fase === 'grupos') return 0;
    if (partido.fase === 'tercer_puesto') {
      return partido.grupo === '3er Puesto'
        ? this.BONUS_FASE['tercer_puesto_3']
        : this.BONUS_FASE['tercer_puesto'];
    }
    return this.BONUS_FASE[partido.fase] || 0;
  },

  /**
   * Calcula los puntos de una predicción comparada con el resultado real
   *
   * Puntos base (todos los partidos):
   *   Caso 1: Acierta resultado + ambos marcadores → 4 pts
   *   Caso 2: Acierta resultado + al menos un marcador → 3 pts
   *   Caso 3: Acierta solo el resultado → 2 pts
   *   Caso 4: Acierta un marcador pero no el resultado → 1 pt
   *   Caso 5: Ninguna → 0 pts
   *
   * Bonus por avance en fases eliminatorias (si acertó el resultado):
   *   16avos → +2 · 8vos → +3 · 4tos → +4 · Semis → +5
   *   3er Puesto → +6 · Final → +7
   */
  calcularPuntos(pred, partido) {
    if (!partido || !partido.jugado) return 0;
    if (pred == null) return 0;

    const realLocal     = parseInt(partido.goles_local);
    const realVisitante = parseInt(partido.goles_visitante);
    const predLocal     = parseInt(pred.goles_local);
    const predVisitante = parseInt(pred.goles_visitante);

    if (isNaN(realLocal) || isNaN(realVisitante)) return 0;
    if (isNaN(predLocal) || isNaN(predVisitante)) return 0;

    const resultadoReal    = this.getResultado(realLocal, realVisitante);
    const resultadoPred    = this.getResultado(predLocal, predVisitante);
    const resultadoCorrecto = resultadoReal && resultadoPred && resultadoReal === resultadoPred;

    const aciertaLocal     = predLocal === realLocal;
    const aciertaVisitante = predVisitante === realVisitante;
    const aciertaAlguno    = aciertaLocal || aciertaVisitante;

    let pts = 0;

    if (aciertaLocal && aciertaVisitante) pts = 4;
    else if (resultadoCorrecto && aciertaAlguno) pts = 3;
    else if (resultadoCorrecto) pts = 2;
    else if (aciertaAlguno) pts = 1;

    // Bonus por acertar el equipo que avanza (solo fases eliminatorias)
    if (resultadoCorrecto) {
      pts += this.getBonusFase(partido);
    }

    return pts;
  },

  /**
   * Calcula si acertó el campeón
   */
  calcularPuntosCampeon(campeonPredicho, campeonReal) {
    if (!campeonPredicho || !campeonReal) return 0;
    if (campeonPredicho.trim().toLowerCase() === campeonReal.trim().toLowerCase()) {
      return this.PUNTOS_CAMPEON;
    }
    return 0;
  },

  /**
   * Describe el tipo de acierto para mostrar el badge
   */
  getTipoAcierto(pred, partido) {
    if (!partido || !partido.jugado || !pred) return null;

    const realLocal     = parseInt(partido.goles_local);
    const realVisitante = parseInt(partido.goles_visitante);
    const predLocal     = parseInt(pred.goles_local);
    const predVisitante = parseInt(pred.goles_visitante);

    if (isNaN(realLocal) || isNaN(realVisitante)) return null;
    if (isNaN(predLocal) || isNaN(predVisitante)) return null;

    const resultadoReal    = this.getResultado(realLocal, realVisitante);
    const resultadoPred    = this.getResultado(predLocal, predVisitante);
    const resultadoCorrecto = resultadoReal && resultadoPred && resultadoReal === resultadoPred;

    const aciertaLocal     = predLocal === realLocal;
    const aciertaVisitante = predVisitante === realVisitante;
    const aciertaAlguno    = aciertaLocal || aciertaVisitante;

    if (aciertaLocal && aciertaVisitante) return 'exacto';
    if (resultadoCorrecto && aciertaAlguno) return 'parcial';
    if (resultadoCorrecto) return 'correcto';
    if (aciertaAlguno) return 'marcador';
    return 'fallo';
  }
};
