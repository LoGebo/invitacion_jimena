import type { TriviaQuestion } from '../types';

export const TRIVIA_BANK: TriviaQuestion[] = [
  { id: 'q1', question: 'Algo que Jesús odia con su ser...', answer: '🍄' },
  { id: 'q2', question: '¿El mejor equipo de México?', answer: '🐯' },
  { id: 'q3', question: '¿Dónde fue nuestro beso?', answer: '🎄' },
  { id: 'q4', question: '¿Algo random que robé?', answer: '🥄' },
  { id: 'q5', question: 'Lo que SIEMPRE come Jimena...', answer: '🧀' },
  { id: 'q6', question: '¿Color favorito de Jimena?', answer: '💙' },
  { id: 'q7', question: '¿Princesa favorita?', answer: '👠' },
  { id: 'q8', question: 'La cosita esa del Ramen que le gusta', answer: '🍥' },
  { id: 'q9', question: '¿Animal favorito?', answer: '🐼' },
  { id: 'q10', question: '¿Mejor peli de Star Wars?', answer: '3️⃣' },
  { id: 'q11', question: 'Le gusta a Jimena pero a Jesús NO', answer: '🫒' },
  { id: 'q12', question: '¿Número favorito?', answer: '9️⃣' },
  { id: 'q13', question: 'Letra del Pokémon favorito', answer: '🅾️' },
  { id: 'q14', question: 'Inicial del libro favorito', answer: '©️' },
  { id: 'q15', question: 'Comida atemporal', answer: '🍞' },
  { id: 'q16', question: 'No le gustan por su pico', answer: '🐦' },
  { id: 'q17', question: 'Le dan miedo por una extraña razón', answer: '🪟' },
  { id: 'q18', question: 'El ídolo máximo', answer: '⚡' },
  { id: 'q19', question: 'Rick y Morty...', answer: '🥒' },
];

// Emojis distractores para el grid
export const DISTRACTOR_EMOJIS = [
  '🍕', '🎸', '🌸', '🦋', '🌈', '🎪', '🎭', '🎨',
  '🚀', '🌙', '⭐', '🔮', '🎲', '🎯', '🏆', '💎',
  '🌺', '🍀', '🦄', '🐙', '🦊', '🐸', '🦉', '🐝',
  '🍰', '🎂', '🍩', '🍪', '🧁', '🍫', '🍬', '🍭',
];

// Function to get random questions
export function getRandomQuestions(count: number = 4): TriviaQuestion[] {
  const shuffled = [...TRIVIA_BANK].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

// Function to create emoji grid with correct answers and distractors
export function createEmojiGrid(correctAnswers: string[], gridSize: number = 16): string[] {
  const distractors = DISTRACTOR_EMOJIS
    .filter(e => !correctAnswers.includes(e))
    .sort(() => Math.random() - 0.5)
    .slice(0, gridSize - correctAnswers.length);

  const grid = [...correctAnswers, ...distractors].sort(() => Math.random() - 0.5);
  return grid;
}
