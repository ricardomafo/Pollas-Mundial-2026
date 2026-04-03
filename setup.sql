-- =====================================================
-- MUNDIAL 2026 - Schema Supabase
-- Ejecuta este script en el SQL Editor de Supabase
-- =====================================================

-- Extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLA: participantes
-- =====================================================
CREATE TABLE IF NOT EXISTS participantes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT UNIQUE NOT NULL,
  creado_en TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TABLA: equipos
-- =====================================================
CREATE TABLE IF NOT EXISTS equipos (
  id SERIAL PRIMARY KEY,
  nombre TEXT UNIQUE NOT NULL,
  grupo TEXT NOT NULL
);

-- =====================================================
-- TABLA: partidos
-- =====================================================
CREATE TABLE IF NOT EXISTS partidos (
  id SERIAL PRIMARY KEY,
  numero INT,
  fase TEXT NOT NULL, -- 'grupos', 'octavos', 'cuartos', 'semis', 'tercer_puesto', 'final'
  grupo TEXT,         -- solo para fase de grupos (A-L)
  equipo_local TEXT NOT NULL DEFAULT 'Por definir',
  equipo_visitante TEXT NOT NULL DEFAULT 'Por definir',
  fecha DATE,
  goles_local INT,
  goles_visitante INT,
  jugado BOOLEAN DEFAULT FALSE,
  orden INT DEFAULT 0
);

-- =====================================================
-- TABLA: predicciones
-- =====================================================
CREATE TABLE IF NOT EXISTS predicciones (
  id SERIAL PRIMARY KEY,
  participante_id UUID NOT NULL REFERENCES participantes(id) ON DELETE CASCADE,
  partido_id INT NOT NULL REFERENCES partidos(id) ON DELETE CASCADE,
  goles_local INT NOT NULL,
  goles_visitante INT NOT NULL,
  UNIQUE (participante_id, partido_id)
);

-- =====================================================
-- TABLA: campeon_predicho
-- =====================================================
CREATE TABLE IF NOT EXISTS campeon_predicho (
  participante_id UUID PRIMARY KEY REFERENCES participantes(id) ON DELETE CASCADE,
  equipo TEXT NOT NULL
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_predicciones_participante ON predicciones(participante_id);
CREATE INDEX IF NOT EXISTS idx_predicciones_partido ON predicciones(partido_id);
CREATE INDEX IF NOT EXISTS idx_partidos_fase ON partidos(fase);
CREATE INDEX IF NOT EXISTS idx_partidos_jugado ON partidos(jugado);
CREATE INDEX IF NOT EXISTS idx_partidos_orden ON partidos(orden);
CREATE INDEX IF NOT EXISTS idx_equipos_grupo ON equipos(grupo);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) - Acceso público para la familia
-- =====================================================
ALTER TABLE participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE partidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE predicciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE campeon_predicho ENABLE ROW LEVEL SECURITY;

-- Políticas: lectura y escritura pública (app familiar sin auth)
CREATE POLICY "Lectura publica participantes" ON participantes FOR SELECT USING (true);
CREATE POLICY "Insertar participantes" ON participantes FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar participantes" ON participantes FOR UPDATE USING (true);

CREATE POLICY "Lectura publica equipos" ON equipos FOR SELECT USING (true);
CREATE POLICY "Insertar equipos" ON equipos FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar equipos" ON equipos FOR UPDATE USING (true);
CREATE POLICY "Eliminar equipos" ON equipos FOR DELETE USING (true);

CREATE POLICY "Lectura publica partidos" ON partidos FOR SELECT USING (true);
CREATE POLICY "Insertar partidos" ON partidos FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar partidos" ON partidos FOR UPDATE USING (true);
CREATE POLICY "Eliminar partidos" ON partidos FOR DELETE USING (true);

CREATE POLICY "Lectura publica predicciones" ON predicciones FOR SELECT USING (true);
CREATE POLICY "Insertar predicciones" ON predicciones FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar predicciones" ON predicciones FOR UPDATE USING (true);

CREATE POLICY "Lectura publica campeon" ON campeon_predicho FOR SELECT USING (true);
CREATE POLICY "Insertar campeon" ON campeon_predicho FOR INSERT WITH CHECK (true);
CREATE POLICY "Actualizar campeon" ON campeon_predicho FOR UPDATE USING (true);
