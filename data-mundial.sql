-- =====================================================
-- MUNDIAL 2026 - Datos reales de equipos y partidos
-- =====================================================

-- 1. Insertar los 48 equipos (12 grupos x 4 equipos)
INSERT INTO equipos (nombre, grupo) VALUES
  ('México', 'A'), ('Sudáfrica', 'A'), ('Corea del Sur', 'A'), ('Chequia', 'A'),
  ('Canadá', 'B'), ('Bosnia y Herzegovina', 'B'), ('Qatar', 'B'), ('Suiza', 'B'),
  ('Brasil', 'C'), ('Marruecos', 'C'), ('Haití', 'C'), ('Escocia', 'C'),
  ('Estados Unidos', 'D'), ('Paraguay', 'D'), ('Australia', 'D'), ('Turquía', 'D'),
  ('Alemania', 'E'), ('Curazao', 'E'), ('Costa de Marfil', 'E'), ('Ecuador', 'E'),
  ('Países Bajos', 'F'), ('Japón', 'F'), ('Suecia', 'F'), ('Túnez', 'F'),
  ('Bélgica', 'G'), ('Egipto', 'G'), ('Irán', 'G'), ('Nueva Zelanda', 'G'),
  ('España', 'H'), ('Cabo Verde', 'H'), ('Arabia Saudita', 'H'), ('Uruguay', 'H'),
  ('Francia', 'I'), ('Senegal', 'I'), ('Irak', 'I'), ('Noruega', 'I'),
  ('Argentina', 'J'), ('Argelia', 'J'), ('Austria', 'J'), ('Jordania', 'J'),
  ('Portugal', 'K'), ('RD Congo', 'K'), ('Uzbekistán', 'K'), ('Colombia', 'K'),
  ('Inglaterra', 'L'), ('Croacia', 'L'), ('Ghana', 'L'), ('Panamá', 'L')
ON CONFLICT (nombre) DO NOTHING;

-- 2. Borrar partidos de fase de grupos existentes
DELETE FROM partidos WHERE fase = 'grupos';

-- 3. Insertar los 72 partidos de grupos (6 por grupo, 12 grupos)
-- Orden: jornada 1 grupos A-L (orden 1-24), jornada 2 grupos A-L (25-48), jornada 3 grupos A-L (49-72)

INSERT INTO partidos (fase, grupo, equipo_local, equipo_visitante, orden) VALUES

-- ===================== JORNADA 1 =====================
-- Grupo A (orden 1-2)
('grupos', 'A', 'México', 'Sudáfrica', 1),
('grupos', 'A', 'Corea del Sur', 'Chequia', 2),
-- Grupo B (orden 3-4)
('grupos', 'B', 'Canadá', 'Bosnia y Herzegovina', 3),
('grupos', 'B', 'Qatar', 'Suiza', 4),
-- Grupo C (orden 5-6)
('grupos', 'C', 'Brasil', 'Marruecos', 5),
('grupos', 'C', 'Haití', 'Escocia', 6),
-- Grupo D (orden 7-8)
('grupos', 'D', 'Estados Unidos', 'Paraguay', 7),
('grupos', 'D', 'Australia', 'Turquía', 8),
-- Grupo E (orden 9-10)
('grupos', 'E', 'Alemania', 'Curazao', 9),
('grupos', 'E', 'Costa de Marfil', 'Ecuador', 10),
-- Grupo F (orden 11-12)
('grupos', 'F', 'Países Bajos', 'Japón', 11),
('grupos', 'F', 'Suecia', 'Túnez', 12),
-- Grupo G (orden 13-14)
('grupos', 'G', 'Bélgica', 'Egipto', 13),
('grupos', 'G', 'Irán', 'Nueva Zelanda', 14),
-- Grupo H (orden 15-16)
('grupos', 'H', 'España', 'Cabo Verde', 15),
('grupos', 'H', 'Arabia Saudita', 'Uruguay', 16),
-- Grupo I (orden 17-18)
('grupos', 'I', 'Francia', 'Senegal', 17),
('grupos', 'I', 'Irak', 'Noruega', 18),
-- Grupo J (orden 19-20)
('grupos', 'J', 'Argentina', 'Argelia', 19),
('grupos', 'J', 'Austria', 'Jordania', 20),
-- Grupo K (orden 21-22)
('grupos', 'K', 'Portugal', 'RD Congo', 21),
('grupos', 'K', 'Uzbekistán', 'Colombia', 22),
-- Grupo L (orden 23-24)
('grupos', 'L', 'Inglaterra', 'Croacia', 23),
('grupos', 'L', 'Ghana', 'Panamá', 24),

-- ===================== JORNADA 2 =====================
-- Grupo A (orden 25-26)
('grupos', 'A', 'México', 'Corea del Sur', 25),
('grupos', 'A', 'Sudáfrica', 'Chequia', 26),
-- Grupo B (orden 27-28)
('grupos', 'B', 'Canadá', 'Qatar', 27),
('grupos', 'B', 'Bosnia y Herzegovina', 'Suiza', 28),
-- Grupo C (orden 29-30)
('grupos', 'C', 'Brasil', 'Haití', 29),
('grupos', 'C', 'Marruecos', 'Escocia', 30),
-- Grupo D (orden 31-32)
('grupos', 'D', 'Estados Unidos', 'Australia', 31),
('grupos', 'D', 'Paraguay', 'Turquía', 32),
-- Grupo E (orden 33-34)
('grupos', 'E', 'Alemania', 'Costa de Marfil', 33),
('grupos', 'E', 'Curazao', 'Ecuador', 34),
-- Grupo F (orden 35-36)
('grupos', 'F', 'Países Bajos', 'Suecia', 35),
('grupos', 'F', 'Japón', 'Túnez', 36),
-- Grupo G (orden 37-38)
('grupos', 'G', 'Bélgica', 'Irán', 37),
('grupos', 'G', 'Egipto', 'Nueva Zelanda', 38),
-- Grupo H (orden 39-40)
('grupos', 'H', 'España', 'Arabia Saudita', 39),
('grupos', 'H', 'Cabo Verde', 'Uruguay', 40),
-- Grupo I (orden 41-42)
('grupos', 'I', 'Francia', 'Irak', 41),
('grupos', 'I', 'Senegal', 'Noruega', 42),
-- Grupo J (orden 43-44)
('grupos', 'J', 'Argentina', 'Austria', 43),
('grupos', 'J', 'Argelia', 'Jordania', 44),
-- Grupo K (orden 45-46)
('grupos', 'K', 'Portugal', 'Uzbekistán', 45),
('grupos', 'K', 'RD Congo', 'Colombia', 46),
-- Grupo L (orden 47-48)
('grupos', 'L', 'Inglaterra', 'Ghana', 47),
('grupos', 'L', 'Croacia', 'Panamá', 48),

-- ===================== JORNADA 3 =====================
-- Grupo A (orden 49-50)
('grupos', 'A', 'México', 'Chequia', 49),
('grupos', 'A', 'Sudáfrica', 'Corea del Sur', 50),
-- Grupo B (orden 51-52)
('grupos', 'B', 'Canadá', 'Suiza', 51),
('grupos', 'B', 'Bosnia y Herzegovina', 'Qatar', 52),
-- Grupo C (orden 53-54)
('grupos', 'C', 'Brasil', 'Escocia', 53),
('grupos', 'C', 'Marruecos', 'Haití', 54),
-- Grupo D (orden 55-56)
('grupos', 'D', 'Estados Unidos', 'Turquía', 55),
('grupos', 'D', 'Paraguay', 'Australia', 56),
-- Grupo E (orden 57-58)
('grupos', 'E', 'Alemania', 'Ecuador', 57),
('grupos', 'E', 'Curazao', 'Costa de Marfil', 58),
-- Grupo F (orden 59-60)
('grupos', 'F', 'Países Bajos', 'Túnez', 59),
('grupos', 'F', 'Japón', 'Suecia', 60),
-- Grupo G (orden 61-62)
('grupos', 'G', 'Bélgica', 'Nueva Zelanda', 61),
('grupos', 'G', 'Egipto', 'Irán', 62),
-- Grupo H (orden 63-64)
('grupos', 'H', 'España', 'Uruguay', 63),
('grupos', 'H', 'Cabo Verde', 'Arabia Saudita', 64),
-- Grupo I (orden 65-66)
('grupos', 'I', 'Francia', 'Noruega', 65),
('grupos', 'I', 'Senegal', 'Irak', 66),
-- Grupo J (orden 67-68)
('grupos', 'J', 'Argentina', 'Jordania', 67),
('grupos', 'J', 'Argelia', 'Austria', 68),
-- Grupo K (orden 69-70)
('grupos', 'K', 'Portugal', 'Colombia', 69),
('grupos', 'K', 'RD Congo', 'Uzbekistán', 70),
-- Grupo L (orden 71-72)
('grupos', 'L', 'Inglaterra', 'Panamá', 71),
('grupos', 'L', 'Croacia', 'Ghana', 72);
