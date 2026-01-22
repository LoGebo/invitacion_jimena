// Game types
export type GamePhase = 'landing' | 'plan' | 'hub' | 'minigame' | 'scanner' | 'finale';
export type MinigameId = 'scratch' | 'trivia' | 'balloons' | 'flowers' | null;

// Trivia types
export interface TriviaQuestion {
  id: string;
  question: string;
  answer: string;
}

// Gift box types
export interface GiftBoxData {
  id: string;
  position: [number, number, number];
  game: MinigameId;
  color: string;
  ribbonColor: string;
}

// Avatar types
export interface AvatarColors {
  skin: string;
  hair: string;
  dress: string;
  blush: string;
  flower1: string;
  flower2: string;
  flower3: string;
}

// Movie types for Netflix-style picker
export interface Movie {
  id: string;
  title: string;
  poster: string;
  category: string;
}

// Itinerary step types
export interface ItineraryStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

// Date plan types
export interface DatePlan {
  accepted: boolean;
  selectedMovie: string | null;
  acceptedAt: string | null;
}
