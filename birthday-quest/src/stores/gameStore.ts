import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { GamePhase, MinigameId, DatePlan } from '../types';

interface GameState {
  // Navigation
  phase: GamePhase;
  setPhase: (phase: GamePhase) => void;

  // Minigames
  currentMinigame: MinigameId;
  setCurrentMinigame: (id: MinigameId) => void;
  completedGames: string[];
  markGameComplete: (id: string) => void;

  // Avatar
  avatarPosition: [number, number, number]; // Target position from joystick
  avatarActualPosition: [number, number, number]; // Actual visual position
  setAvatarPosition: (pos: [number, number, number]) => void;
  setAvatarActualPosition: (pos: [number, number, number]) => void;

  // Scanner
  catDetected: boolean;
  setCatDetected: (val: boolean) => void;

  // Date Plan (Proposal)
  datePlan: DatePlan;
  acceptDate: () => void;
  selectMovie: (movieId: string) => void;

  // Helpers
  allGamesCompleted: () => boolean;
  isGameCompleted: (id: string) => boolean;
  resetProgress: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      phase: 'landing',
      setPhase: (phase) => set({ phase }),

      currentMinigame: null,
      setCurrentMinigame: (id) => set({ currentMinigame: id }),

      completedGames: [],
      markGameComplete: (id) => {
        if (!id) return;
        const current = get().completedGames;
        if (!current.includes(id)) {
          set({ completedGames: [...current, id] });
        }
      },

      avatarPosition: [0, 0.5, 0],
      avatarActualPosition: [0, 0.5, 0],
      setAvatarPosition: (pos) => set({ avatarPosition: pos }),
      setAvatarActualPosition: (pos) => set({ avatarActualPosition: pos }),

      catDetected: false,
      setCatDetected: (val) => set({ catDetected: val }),

      datePlan: {
        accepted: false,
        selectedMovie: null,
        acceptedAt: null,
      },
      acceptDate: () =>
        set({
          datePlan: {
            ...get().datePlan,
            accepted: true,
            acceptedAt: new Date().toISOString(),
          },
        }),
      selectMovie: (movieId) =>
        set({
          datePlan: {
            ...get().datePlan,
            selectedMovie: movieId,
          },
        }),

      // Helper functions
      allGamesCompleted: () => get().completedGames.length >= 4,
      isGameCompleted: (id) => get().completedGames.includes(id),

      resetProgress: () =>
        set({
          phase: 'landing',
          currentMinigame: null,
          completedGames: [],
          avatarPosition: [0, 0.5, 0],
          avatarActualPosition: [0, 0.5, 0],
          catDetected: false,
          datePlan: {
            accepted: false,
            selectedMovie: null,
            acceptedAt: null,
          },
        }),
    }),
    {
      name: 'birthday-quest-storage',
      partialize: (state) => ({
        completedGames: state.completedGames,
        phase: state.phase,
        datePlan: state.datePlan,
        catDetected: state.catDetected,
      }),
    }
  )
);
