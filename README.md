# Obstetricia: Vínculo y Vida — Simulador 3D

Simulador educativo en 3D para celular y computadora, hecho con Next.js y React Three Fiber.

## 1. Cómo abrir el juego

### Opción A: en tu computadora (necesitas Node.js 18 o superior)
1. Descomprime `obstetricia-3d.zip`.
2. Abre una terminal dentro de la carpeta `obstetricia-3d`.
3. Ejecuta:
       npm install
       npm run dev
4. Abre en el navegador: http://localhost:3000

### Opción B: en el celular
Solo funciona con enlace público: primero publícalo en Vercel (sección 3) y abre el enlace en el teléfono. Gíralo a horizontal.

## 2. Controles
| Computadora | Celular (horizontal) |
|---|---|
| W / S: avanzar y retroceder | Joystick izquierdo |
| A / D: girar | Joystick izquierdo (izq./der. gira) |
| Shift: correr | — (el joystick corre al empujarlo a fondo) |
| E: hablar / realizar el paso | Botón E (derecha) |
| C: centrar cámara | Arrastra con un dedo en la pantalla para mirar |
| Mouse arrastrando: mirar | Arrastrar con un dedo: mirar |

## 3. Cómo publicarlo en Vercel (enlace para compartir)

Vercel es gratis para proyectos así. Necesitas una cuenta (puedes entrar con tu cuenta de GitHub o de Google).

### Método 1: arrastrar la carpeta (sin programar)
1. Entra a https://vercel.com y crea una cuenta.
2. Ve a https://vercel.com/new.
3. Si pide instalar la herramienta de importación de GitHub, sigue el paso; si no, busca la opción **"Deploy from folder"** o usa el Método 2.
4. Sube la carpeta `obstetricia-3d`. Vercel detecta **Next.js** automáticamente. No cambies nada en la configuración.
5. Pulsa **Deploy**. En 1–3 minutos te da un enlace como `https://obstetricia-3d-xxxx.vercel.app`.

### Método 2: con GitHub (recomendado para actualizar después)
1. Crea una cuenta en https://github.com y un repositorio nuevo (por ejemplo `obstetricia-3d`).
2. Sube el contenido de la carpeta `obstetricia-3d` al repositorio (puedes arrastrarla en la página de GitHub con "Add file → Upload files").
3. Entra a https://vercel.com/new, elige **Import** en el repositorio `obstetricia-3d` y pulsa **Deploy**.
4. Cada vez que subas cambios a GitHub, Vercel publica la nueva versión sola.

### Método 3: con la terminal (Vercel CLI)
    npm install -g vercel
    cd obstetricia-3d
    vercel login        # sigue las instrucciones en el navegador
    vercel --prod       # responde a las preguntas con Enter para los valores por defecto

Al final te muestra la URL pública.

## 4. Dónde está el código
- `app/page.js`: punto de entrada (carga el juego).
- `app/layout.js`: título de la página y configuración de pantalla para celular.
- `app/globals.css`: estilos de la interfaz (HUD, joystick, botón E, aviso de girar).
- `components/Game.js`: lógica principal: niveles, diálogos, pasos del procedimiento, misiones y controles táctiles.
- `components/Procedures.js`: **los pasos de los niveles 2 y 3** (atención del parto y reanimación neonatal). Aquí puedes cambiar textos, estaciones y número de pulsaciones.
- `components/Player.js`: personaje principal, animaciones (caminar, correr, reposo) y movimiento.
- `components/ThirdPersonCamera.js`: cámara en tercera persona.
- `components/Hospital.js`: pasillo, letreros, puertas, camillas y decoración.
- `components/Characters.js`: paciente y bebé.
- `components/textures.js`: texturas del piso, paredes y letreros.
- `public/models/Xbot.glb`: modelo 3D animado (ver licencias abajo).

## 5. Niveles
1. **Recorrido:** saluda a la paciente, pregúntale por sus síntomas y llega a la sala de ecografía.
2. **Atención del parto:** lavado de manos, bata y guantes, verificar dilatación, pujo, recibir al recién nacido, clampeo del cordón y piel a piel. Ve a cada punto marcado en el piso y pulsa E en el orden correcto.
3. **Reanimación neonatal:** secar y abrigar, vía aérea, estimulación, evaluación, ventilación con ambú, compresiones 3:1 y registro.

Si pulsas E en un punto que no corresponde al paso actual, el juego te dice cuál es el siguiente.

## 6. Limitaciones conocidas
- El personaje y la paciente usan un modelo genérico (Mixamo) con colores cambiados, no un personaje de estilo anime.
- El bebé es un modelo reducido de placeholder.
- Los procedimientos son educativos y simplificados. Conviene que un docente los revise antes de usarlos en clase.

## 7. Licencias
El modelo `public/models/Xbot.glb` proviene de los ejemplos de three.js (personaje Mixamo). Revisa sus términos antes de publicar el juego con fines comerciales.
