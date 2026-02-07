import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type GameYear = 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026;

export interface GameProgress {
  [key: number]: {
    completed: boolean;
    attempts: number;
    lastPlayed?: string; // ISO timestamp
  };
}

interface GameStore {
  progress: GameProgress;
  completeGame: (year: GameYear) => void;
  failGame: (year: GameYear) => void;
  resetGame: (year: GameYear) => void;
  resetAllGames: () => void;
  isGameCompleted: (year: GameYear) => boolean;
  getAttempts: (year: GameYear) => number;
}

const initialProgress: GameProgress = {
  2019: { completed: false, attempts: 0 },
  2020: { completed: false, attempts: 0 },
  2021: { completed: false, attempts: 0 },
  2022: { completed: false, attempts: 0 },
  2023: { completed: false, attempts: 0 },
  2024: { completed: false, attempts: 0 },
  2025: { completed: false, attempts: 0 },
  2026: { completed: false, attempts: 0 },
};

export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      progress: initialProgress,

      // 게임 성공
      completeGame: (year: GameYear) => {
        set((state) => ({
          progress: {
            ...state.progress,
            [year]: {
              ...state.progress[year],
              completed: true,
              lastPlayed: new Date().toISOString(),
            },
          },
        }));
      },

      // 게임 실패 (시도 횟수 증가)
      failGame: (year: GameYear) => {
        set((state) => ({
          progress: {
            ...state.progress,
            [year]: {
              ...state.progress[year],
              attempts: state.progress[year].attempts + 1,
              lastPlayed: new Date().toISOString(),
            },
          },
        }));
      },

      // 특정 게임 리셋
      resetGame: (year: GameYear) => {
        set((state) => ({
          progress: {
            ...state.progress,
            [year]: {
              completed: false,
              attempts: 0,
            },
          },
        }));
      },

      // 전체 리셋
      resetAllGames: () => {
        set({ progress: initialProgress });
      },

      // 게임 완료 여부 확인
      isGameCompleted: (year: GameYear) => {
        return get().progress[year]?.completed || false;
      },

      // 시도 횟수 가져오기
      getAttempts: (year: GameYear) => {
        return get().progress[year]?.attempts || 0;
      },
    }),
    {
      name: 'hyeseung-game-progress', // sessionStorage 키 이름
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);