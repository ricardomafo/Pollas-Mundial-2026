// =====================================================
// MUNDIAL 2026 - Sistema de puntuación
// =====================================================

window.scoring = {
  PUNTOS_CAMPEON: 10,

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
   * Calcula los puntos de una predicción comparada con el resultado real
   * Caso 1: Acierta resultado + ambos marcadores → 4 pts
   * Caso 2: Acierta resultado + al menos un marcador → 3 pts
   * Caso 3: Acierta solo el resultado → 2 pts
   * Caso 4: Acierta un marcador pero no el resultado → 1 pt
   * Caso 5: Ninguna → 0 pts
   */
  calcularPuntos(pred, partido) {
    if (!partido || !partido.jugado) return 0;
    if (pred == null) return 0;

    const realLocal = parseInt(partido.goles_local);
    const realVisitante = parseInt(partido.goles_visitante);
    const predLocal = parseInt(pred.goles_local);
    const predVisitante = parseInt(pred.goles_visitante);

    if (isNaN(realLocal) || isNaN(realVisitante)) return 0;
    if (isNaN(predLocal) || isNaN(predVisitante)) return 0;

    const resultadoReal = this.getResultado(realLocal, realVisitante);
    const resultadoPred = this.getResultado(predLocal, predVisitante);
    const resultadoCorrecto = resultadoReal && resultadoPred && resultadoReal === resultadoPred;

    const aciertaLocal = predLocal === realLocal;
    const aciertaVisitante = predVisitante === realVisitante;
    const aciertaAlguno = aciertaLocal || aciertaVisitante;

    // Caso 1: marcador exacto (implica resultado correcto)
    if (aciertaLocal && aciertaVisitante) return 4;

    // Caso 2: resultado correcto + al menos un marcador
    if (resultadoCorrecto && aciertaAlguno) return 3;

    // Caso 3: solo resultado correcto
    if (resultadoCorrecto) return 2;

    // Caso 4: un marcador correcto pero resultado incorrecto
    if (aciertaAlguno) return 1;

    return 0;
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
   * 'exacto'   → 4 pts (marcador exacto)
   * 'parcial'  → 3 pts (resultado + un marcador)
   * 'correcto' → 2 pts (solo resultado)
   * 'marcador' → 1 pt  (un marcador, resultado incorrecto)
   * 'fallo'    → 0 pts
   */
  getTipoAcierto(pred, partido) {
    if (!partido || !partido.jugado || !pred) return null;

    const realLocal = parseInt(partido.goles_local);
    const realVisitante = parseInt(partido.goles_visitante);
    const predLocal = parseInt(pred.goles_local);
    const predVisitante = parseInt(pred.goles_visitante);

    if (isNaN(realLocal) || isNaN(realVisitante)) return null;
    if (isNaN(predLocal) || isNaN(predVisitante)) return null;

    const resultadoReal = this.getResultado(realLocal, realVisitante);
    const resultadoPred = this.getResultado(predLocal, predVisitante);
    const resultadoCorrecto = resultadoReal && resultadoPred && resultadoReal === resultadoPred;

    const aciertaLocal = predLocal === realLocal;
    const aciertaVisitante = predVisitante === realVisitante;
    const aciertaAlguno = aciertaLocal || aciertaVisitante;

    if (aciertaLocal && aciertaVisitante) return 'exacto';
    if (resultadoCorrecto && aciertaAlguno) return 'parcial';
    if (resultadoCorrecto) return 'correcto';
    if (aciertaAlguno) return 'marcador';
    return 'fallo';
  }
};
