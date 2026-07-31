export const REFERENCE_SENTENCES = [
  "Che, ¿vamos a tomar unos mates a la plaza?",
  "Boludo, no puedo creer que perdimos el partido de nuevo.",
  "Está re bueno este lugar, tenemos que volver.",
  "¿Posta que se mudó a Buenos Aires el mes pasado?",
  "Tengo un quilombo bárbaro en el laburo esta semana.",
  "Perdí el bondi y llegué re tarde a todos lados.",
  "Ni en pedo salgo con este frío, quedate en casa.",
  "¿Vos querés que pidamos un asado para el domingo?",
];

export function randomReferenceSentence(): string {
  return REFERENCE_SENTENCES[Math.floor(Math.random() * REFERENCE_SENTENCES.length)];
}
