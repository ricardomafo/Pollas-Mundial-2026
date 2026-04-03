// =====================================================
// MUNDIAL 2026 - Lógica del bracket y clasificaciones
// =====================================================

window.bracket = {

  // =====================================================
  // CLASIFICACIÓN DE UN GRUPO
  // equiposGrupo: array de nombres de equipos
  // partidosGrupo: array de partidos del DB
  // =====================================================
  calcularClasificacionGrupo(equiposGrupo, partidosGrupo) {
    const tabla = {};
    equiposGrupo.forEach(e => {
      tabla[e] = { nombre: e, pj: 0, pg: 0, pe: 0, pp: 0, gf: 0, gc: 0, dg: 0, pts: 0 };
    });

    partidosGrupo.filter(p => p.jugado).forEach(p => {
      const local = p.equipo_local;
      const visita = p.equipo_visitante;
      const gl = parseInt(p.goles_local);
      const gv = parseInt(p.goles_visitante);
      if (!tabla[local] || !tabla[visita] || isNaN(gl) || isNaN(gv)) return;

      tabla[local].pj++;  tabla[visita].pj++;
      tabla[local].gf += gl;  tabla[local].gc += gv;  tabla[local].dg += (gl - gv);
      tabla[visita].gf += gv; tabla[visita].gc += gl; tabla[visita].dg += (gv - gl);

      if (gl > gv)      { tabla[local].pg++;  tabla[local].pts += 3;  tabla[visita].pp++; }
      else if (gl < gv) { tabla[visita].pg++; tabla[visita].pts += 3; tabla[local].pp++;  }
      else              { tabla[local].pe++;   tabla[local].pts++;     tabla[visita].pe++; tabla[visita].pts++; }
    });

    return Object.values(tabla).sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg  !== a.dg)  return b.dg  - a.dg;
      if (b.gf  !== a.gf)  return b.gf  - a.gf;
      return a.nombre.localeCompare(b.nombre);
    });
  },

  // =====================================================
  // CLASIFICACIÓN DE TODOS LOS GRUPOS
  // Devuelve { A: [...], B: [...], ... }
  // =====================================================
  async calcularTodosLosGrupos() {
    const [equipos, partidos] = await Promise.all([
      db.getEquipos(),
      db.getPartidos('grupos')
    ]);

    const grupos = {};
    equipos.forEach(e => {
      if (!grupos[e.grupo]) grupos[e.grupo] = [];
      grupos[e.grupo].push(e.nombre);
    });

    const result = {};
    for (const g of Object.keys(grupos).sort()) {
      const ps = partidos.filter(p => p.grupo === g);
      result[g] = this.calcularClasificacionGrupo(grupos[g], ps);
    }
    return result;
  },

  // =====================================================
  // VERIFICAR SI TODOS LOS GRUPOS ESTÁN COMPLETOS
  // =====================================================
  async gruposCompletos() {
    const partidos = await db.getPartidos('grupos');
    return partidos.length > 0 && partidos.every(p => p.jugado);
  },

  // =====================================================
  // MEJORES 8 TERCEROS
  // =====================================================
  getMejoresTerceros(clasificacionesPorGrupo) {
    const terceros = [];
    for (const [grupo, tabla] of Object.entries(clasificacionesPorGrupo)) {
      if (tabla.length >= 3) terceros.push({ ...tabla[2], grupo });
    }
    terceros.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.dg  !== a.dg)  return b.dg  - a.dg;
      if (b.gf  !== a.gf)  return b.gf  - a.gf;
      return a.nombre.localeCompare(b.nombre);
    });
    return terceros.slice(0, 8);
  },

  // =====================================================
  // ESTRUCTURA DEL BRACKET (16avos de final)
  // Grupos A-F → lado izquierdo, G-L → lado derecho
  // =====================================================
  BRACKET_R32: [
    // Lado izquierdo
    { id: 1,  label: 'R32-1',  home_slot: '1A', away_slot: '2B', r16: 'R16-1', orden: 101 },
    { id: 2,  label: 'R32-2',  home_slot: '1C', away_slot: '3rd-1', r16: 'R16-1', orden: 102 },
    { id: 3,  label: 'R32-3',  home_slot: '2A', away_slot: '3rd-2', r16: 'R16-2', orden: 103 },
    { id: 4,  label: 'R32-4',  home_slot: '2C', away_slot: '1B',  r16: 'R16-2', orden: 104 },
    { id: 5,  label: 'R32-5',  home_slot: '1D', away_slot: '2E',  r16: 'R16-3', orden: 105 },
    { id: 6,  label: 'R32-6',  home_slot: '1F', away_slot: '3rd-3', r16: 'R16-3', orden: 106 },
    { id: 7,  label: 'R32-7',  home_slot: '2D', away_slot: '3rd-4', r16: 'R16-4', orden: 107 },
    { id: 8,  label: 'R32-8',  home_slot: '2F', away_slot: '1E',  r16: 'R16-4', orden: 108 },
    // Lado derecho
    { id: 9,  label: 'R32-9',  home_slot: '1G', away_slot: '2H',  r16: 'R16-5', orden: 109 },
    { id: 10, label: 'R32-10', home_slot: '1I', away_slot: '3rd-5', r16: 'R16-5', orden: 110 },
    { id: 11, label: 'R32-11', home_slot: '2G', away_slot: '3rd-6', r16: 'R16-6', orden: 111 },
    { id: 12, label: 'R32-12', home_slot: '2I', away_slot: '1H',  r16: 'R16-6', orden: 112 },
    { id: 13, label: 'R32-13', home_slot: '1J', away_slot: '2K',  r16: 'R16-7', orden: 113 },
    { id: 14, label: 'R32-14', home_slot: '1L', away_slot: '3rd-7', r16: 'R16-7', orden: 114 },
    { id: 15, label: 'R32-15', home_slot: '2J', away_slot: '3rd-8', r16: 'R16-8', orden: 115 },
    { id: 16, label: 'R32-16', home_slot: '2L', away_slot: '1K',  r16: 'R16-8', orden: 116 },
  ],

  R16_ESTRUCTURA: [
    { label: 'R16-1', from: ['R32-1','R32-2'],   qf: 'QF-1', orden: 201 },
    { label: 'R16-2', from: ['R32-3','R32-4'],   qf: 'QF-1', orden: 202 },
    { label: 'R16-3', from: ['R32-5','R32-6'],   qf: 'QF-2', orden: 203 },
    { label: 'R16-4', from: ['R32-7','R32-8'],   qf: 'QF-2', orden: 204 },
    { label: 'R16-5', from: ['R32-9','R32-10'],  qf: 'QF-3', orden: 205 },
    { label: 'R16-6', from: ['R32-11','R32-12'], qf: 'QF-3', orden: 206 },
    { label: 'R16-7', from: ['R32-13','R32-14'], qf: 'QF-4', orden: 207 },
    { label: 'R16-8', from: ['R32-15','R32-16'], qf: 'QF-4', orden: 208 },
  ],

  QF_ESTRUCTURA: [
    { label: 'QF-1', from: ['R16-1','R16-2'], sf: 'SF-1', orden: 301 },
    { label: 'QF-2', from: ['R16-3','R16-4'], sf: 'SF-1', orden: 302 },
    { label: 'QF-3', from: ['R16-5','R16-6'], sf: 'SF-2', orden: 303 },
    { label: 'QF-4', from: ['R16-7','R16-8'], sf: 'SF-2', orden: 304 },
  ],

  SF_ESTRUCTURA: [
    { label: 'SF-1', from: ['QF-1','QF-2'], orden: 401 },
    { label: 'SF-2', from: ['QF-3','QF-4'], orden: 402 },
  ],

  // =====================================================
  // GENERAR TODOS LOS PARTIDOS ELIMINATORIOS
  // =====================================================
  async generarEliminatorias() {
    const clasificaciones = await this.calcularTodosLosGrupos();
    const mejoresTerceros = this.getMejoresTerceros(clasificaciones);

    // Mapear slots → equipos reales
    const slotMap = {};
    for (const [grupo, tabla] of Object.entries(clasificaciones)) {
      if (tabla[0]) slotMap[`1${grupo}`] = tabla[0].nombre;
      if (tabla[1]) slotMap[`2${grupo}`] = tabla[1].nombre;
    }
    mejoresTerceros.forEach((t, i) => { slotMap[`3rd-${i+1}`] = t.nombre; });

    const partidos = [];

    // 16avos (R32)
    this.BRACKET_R32.forEach(m => {
      partidos.push({
        fase: 'octavos',
        grupo: m.label,
        equipo_local:     slotMap[m.home_slot] || `[${m.home_slot}]`,
        equipo_visitante: slotMap[m.away_slot] || `[${m.away_slot}]`,
        orden: m.orden, numero: m.id, jugado: false
      });
    });

    // Octavos (R16)
    this.R16_ESTRUCTURA.forEach(m => {
      partidos.push({ fase: 'cuartos', grupo: m.label, equipo_local: `[${m.from[0]}]`, equipo_visitante: `[${m.from[1]}]`, orden: m.orden, jugado: false });
    });

    // Cuartos (QF)
    this.QF_ESTRUCTURA.forEach(m => {
      partidos.push({ fase: 'semis', grupo: m.label, equipo_local: `[${m.from[0]}]`, equipo_visitante: `[${m.from[1]}]`, orden: m.orden, jugado: false });
    });

    // Semis (SF)
    this.SF_ESTRUCTURA.forEach(m => {
      partidos.push({ fase: 'tercer_puesto', grupo: m.label, equipo_local: `[${m.from[0]}]`, equipo_visitante: `[${m.from[1]}]`, orden: m.orden, jugado: false });
    });

    // 3er puesto + Final
    partidos.push({ fase: 'tercer_puesto', grupo: '3er Puesto', equipo_local: '[Perdedor SF-1]', equipo_visitante: '[Perdedor SF-2]', orden: 490, jugado: false });
    partidos.push({ fase: 'final', grupo: 'Final', equipo_local: '[Ganador SF-1]', equipo_visitante: '[Ganador SF-2]', orden: 500, jugado: false });

    await db.borrarEliminatorias();
    await db.insertarPartidos(partidos);

    return { clasificaciones, mejoresTerceros, slotMap };
  },

  // =====================================================
  // PROPAGAR GANADOR AL SIGUIENTE PARTIDO
  // Llamar después de guardar resultado de un partido eliminatorio
  // =====================================================
  async propagarGanador(partido) {
    if (!partido.grupo || !partido.jugado) return;
    const label = partido.grupo;

    const gl = parseInt(partido.goles_local);
    const gv = parseInt(partido.goles_visitante);
    if (isNaN(gl) || isNaN(gv)) return;

    const ganador = gl > gv ? partido.equipo_local : partido.equipo_visitante;

    // Buscar en R16
    const r16 = this.R16_ESTRUCTURA.find(m => m.from.includes(label));
    if (r16) {
      const slot = r16.from.indexOf(label) === 0 ? 'local' : 'visitante';
      await db.actualizarEquipoEnPartido(r16.label, slot, ganador);
      return;
    }

    // Buscar en QF
    const qf = this.QF_ESTRUCTURA.find(m => m.from.includes(label));
    if (qf) {
      const slot = qf.from.indexOf(label) === 0 ? 'local' : 'visitante';
      await db.actualizarEquipoEnPartido(qf.label, slot, ganador);
      return;
    }

    // Buscar en SF
    const sf = this.SF_ESTRUCTURA.find(m => m.from.includes(label));
    if (sf) {
      const slot = sf.from.indexOf(label) === 0 ? 'local' : 'visitante';
      // Ganador va a Final, perdedor va a 3er puesto
      await db.actualizarEquipoEnPartido('Final', slot, ganador);
      const perdedor = gl > gv ? partido.equipo_visitante : partido.equipo_local;
      await db.actualizarEquipoEnPartido('3er Puesto', slot, perdedor);
    }
  }
};
