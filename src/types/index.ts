export type GameMode = 'WORDS' | 'NUMBERS' | 'LETTERS';

export interface AppConfig {
  mode: GameMode;
  palette: {
    bg: string;
    primary: string;
    accent: string;
    boxBg: string;
    boxBorder: string;
  };
  boxesPerRound: number;
  builtInTheme: string;
  soundsEnabled: boolean;
  subtleParentButtonPosition: 'top-right' | 'top-left';
}

export interface WordListItem {
  id: string;
  key: string;
  emoji?: string;
  image?: string | null;
}

export interface WordList {
  id: string;
  title: string;
  type: GameMode;
  items: WordListItem[];
  createdAt: string;
  updatedAt: string;
}

export interface BoxState {
  target: string;
  entered: string;
  locked: boolean;
  correct: boolean;
}

export interface RoundState {
  roundId: string;
  listId: string;
  boxOrder: string[];
  boxStates: Record<string, BoxState>;
  completed: boolean;
  startedAt: string;
  completedAt: string | null;
}

export interface Achievement {
  id: string;
  earnedAt: string;
}

export interface AchievementData {
  badges: Achievement[];
}

export interface GameState {
  currentRound: RoundState | null;
  selectedListId: string | null;
}