// Niveles de procedimiento: pasos en orden con una estación en el piso y número de pulsaciones.
export const SPAWN = { x: 0.1, z: -12.6, yaw: Math.PI };

export const PROC = {
  2: {
    title: 'Nivel 2 · Atención del parto',
    intro: 'Dilatación completa. Atiende el nacimiento siguiendo el orden del protocolo.',
    steps: [
      { text: 'Lavado clínico de manos', at: { x: 0.6, z: -13.2 }, taps: 3, ok: 'Manos limpias. Ahora protégete.' },
      { text: 'Ponerte bata y guantes estériles', at: { x: -0.4, z: -13.2 }, taps: 2, ok: 'Campo listo.' },
      { text: 'Verificar dilatación completa (tacto)', at: { x: 0.6, z: -15.0 }, taps: 2, ok: 'Dilatación completa: 10 cm.' },
      { text: 'Pedir pujo con la contracción y proteger el periné', at: { x: -0.4, z: -15.0 }, taps: 4, ok: 'Buen pujo. La cabeza coronó.' },
      { text: 'Recibir y secar al recién nacido', at: { x: 0.6, z: -16.4 }, taps: 3, ok: 'Bebé recibido. Respira.' },
      { text: 'Clampear el cordón entre 1 y 3 minutos', at: { x: -0.4, z: -16.4 }, taps: 2, ok: 'Cordón clampeado a tiempo.' },
      { text: 'Contacto piel a piel con la madre', at: { x: 1.3, z: -14.1 }, taps: 2, ok: 'Piel a piel: favorece la lactancia.' },
    ],
  },
  3: {
    title: 'Nivel 3 · Reanimación neonatal',
    intro: 'El bebé no respira bien al nacer. Sigue el algoritmo y no te detengas.',
    steps: [
      { text: 'Secar y abrigar al bebé en la cuna de calor', at: { x: 0.6, z: -13.2 }, taps: 3, ok: 'Bien abrigado.' },
      { text: 'Posicionar la vía aérea y aspirar', at: { x: -0.4, z: -13.2 }, taps: 2, ok: 'Vía aérea libre.' },
      { text: 'Estimular: frotar la espalda', at: { x: 0.6, z: -15.0 }, taps: 3, ok: 'Estimulado.' },
      { text: 'Evaluar respiración y frecuencia cardiaca', at: { x: -0.4, z: -15.0 }, taps: 2, ok: 'FC menor de 100: iniciar ventilación.' },
      { text: 'Ventilar con ambú (5 insuflaciones)', at: { x: 0.6, z: -16.4 }, taps: 5, ok: 'La FC sube. Reevalúa.' },
      { text: 'Compresiones torácicas 3:1 (6 compresiones)', at: { x: -0.4, z: -16.4 }, taps: 6, ok: 'Compresiones registradas.' },
      { text: 'Reevaluar y registrar en la historia clínica', at: { x: 1.3, z: -14.1 }, taps: 2, ok: 'Registro completo. Caso resuelto.' },
    ],
  },
};
