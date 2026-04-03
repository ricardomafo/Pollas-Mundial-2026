# Instrucciones para montar la Polla del Mundial 2026

¡Bienvenido! Esta guía te explica paso a paso cómo poner en marcha la quiniela familiar. No necesitas saber programar.

---

## Paso 1: Crear cuenta en Supabase (gratis)

Supabase es donde se guardan todos los datos (participantes, predicciones, resultados).

1. Ve a **[supabase.com](https://supabase.com)** y haz clic en **"Start your project"**
2. Regístrate con tu cuenta de Google o GitHub (o crea una cuenta nueva)
3. Haz clic en **"New project"**
4. Rellena:
   - **Name**: `mundial2026`
   - **Database Password**: elige una contraseña (guárdala por si acaso)
   - **Region**: elige la más cercana a vosotros (ej. EU West para España)
5. Haz clic en **"Create new project"**
6. Espera 1-2 minutos mientras se crea

---

## Paso 2: Crear la base de datos

Aquí creas todas las tablas que necesita la app.

1. En el menú izquierdo de Supabase, haz clic en **"SQL Editor"**
2. Haz clic en **"New query"**
3. Abre el archivo `setup.sql` (está en la carpeta `mundial-2026`) con el Bloc de Notas o TextEdit
4. Selecciona todo el texto (Ctrl+A o Cmd+A) y cópialo
5. Pégalo en el editor de Supabase
6. Haz clic en el botón verde **"Run"** (o pulsa Ctrl+Enter)
7. Deberías ver el mensaje **"Success. No rows returned"** — ¡perfecto!

---

## Paso 3: Obtener tus claves de acceso

1. En el menú izquierdo, haz clic en **"Settings"** (icono de engranaje, abajo del todo)
2. Luego haz clic en **"API"**
3. Verás dos cosas importantes:
   - **Project URL**: algo como `https://abcdefgh.supabase.co`
   - **anon public**: una clave larga que empieza por `eyJ...`
4. Abre el archivo `js/config.js` con el Bloc de Notas o TextEdit
5. Reemplaza `https://TU_PROYECTO.supabase.co` con tu Project URL
6. Reemplaza `TU_CLAVE_PUBLICA_AQUI` con tu anon public key
7. Guarda el archivo

El archivo `config.js` debería quedar así (con tus datos reales):
```
const SUPABASE_URL = 'https://abcdefgh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

---

## Paso 4: Publicar en internet (gratis)

Para que tu familia pueda acceder desde sus móviles, necesitas subir la app a internet.

### Opción A: Vercel (recomendado, más fácil)

1. Ve a **[github.com](https://github.com)** y crea una cuenta gratuita
2. Haz clic en el **"+"** arriba a la derecha → **"New repository"**
3. Nombre: `mundial-2026`, haz clic en **"Create repository"**
4. Sube los archivos de la carpeta `mundial-2026`:
   - En la página del repositorio, haz clic en **"uploading an existing file"**
   - Arrastra todos los archivos y carpetas de `mundial-2026` a esa ventana
   - Haz clic en **"Commit changes"**
5. Ve a **[vercel.com](https://vercel.com)** y regístrate con tu cuenta de GitHub
6. Haz clic en **"Add New Project"**
7. Selecciona el repositorio `mundial-2026`
8. Haz clic en **"Deploy"** — espera 1 minuto
9. ¡Listo! Vercel te da un enlace como `mundial-2026-tuusuario.vercel.app`
10. Comparte ese enlace con toda la familia

### Opción B: Probar en local (sin internet)

Si solo quieres probar en tu propio ordenador, puedes abrir directamente el archivo `index.html` en el navegador. Pero **no funcionará entre dispositivos** sin seguir la Opción A.

---

## Paso 5: Configurar los grupos del Mundial

1. Abre la app en el navegador (el enlace de Vercel o el archivo local)
2. Entra tu nombre y únete
3. Haz clic en **"⚙️ Configurar"**
4. Verás 12 grupos (A hasta L) con 4 campos cada uno
5. Entra el nombre de los 4 equipos de cada grupo
6. Haz clic en **"✅ Guardar equipos y generar partidos de grupos"**
7. La app crea automáticamente todos los partidos de la fase de grupos

**Los 48 equipos del Mundial 2026** (para que no tengas que buscarlos):

| Grupo A | Grupo B | Grupo C | Grupo D |
|---------|---------|---------|---------|
| México | Argentina | Brasil | España |
| ... | ... | ... | ... |

*(Nota: Los grupos oficiales se anuncian durante el sorteo. Actualiza esta tabla cuando se publiquen.)*

---

## Paso 6: Configurar fases eliminatorias

Una vez que termine la fase de grupos:

1. Ve a **⚙️ Configurar**
2. Haz clic en la pestaña **"Octavos"**
3. Entra los 16 enfrentamientos de octavos de final
4. Repite para Cuartos, Semis y Final conforme avance el torneo

---

## Paso 7: ¡A jugar!

1. Comparte el enlace con toda la familia
2. Cada persona entra su nombre y hace sus predicciones antes de que empiecen los partidos
3. Conforme se juegan partidos, cualquiera puede ir a **"📊 Resultados"** y meter el marcador real
4. La **"🏆 Clasificación"** se actualiza automáticamente

---

## Sistema de puntos

| Acierto | Puntos |
|---------|--------|
| Marcador exacto (ej: predices 2-1 y sale 2-1) | **3 puntos** |
| Solo el resultado (ej: predices 2-1 y sale 3-1 = victoria) | **1 punto** |
| Resultado incorrecto | 0 puntos |
| Acertar el campeón del Mundial | **+10 puntos extra** |

---

## Preguntas frecuentes

**¿Puedo cambiar mis predicciones?**
Sí, siempre que el partido no haya sido marcado como jugado.

**¿Quién puede meter resultados?**
Cualquiera. No hace falta estar registrado para ir a "Resultados" y meter marcadores.

**¿Y si me equivoco al meter un resultado?**
Actualmente no hay botón de editar resultados en la app. Para corregirlo, ve al SQL Editor de Supabase y ejecuta:
```sql
UPDATE partidos SET goles_local = X, goles_visitante = Y WHERE id = Z;
```
(reemplaza X, Y, Z con los valores correctos. Puedes ver los IDs en la tabla `partidos` de Supabase)

**¿La app funciona en el móvil?**
Sí, está diseñada primero para móvil.

**¿Cuántos participantes puede haber?**
Sin límite en el plan gratuito de Supabase (hasta 50.000 filas en total).

---

## Soporte

Si algo falla:
1. Comprueba que copiaste bien las claves en `js/config.js`
2. Comprueba que ejecutaste el `setup.sql` correctamente en Supabase
3. Mira la consola del navegador (F12 → Console) para ver si hay errores en rojo
