
export type SemaphorePosition = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface SignalMapping {
  char: string;
  left: SemaphorePosition;
  right: SemaphorePosition;
  description?: string;
}

export interface TrainingSession {
  id: string;
  date: number;
  accuracy: number;
  speedMs: number;
  phrase: string;
  userPhrase: string;
  type: 'Short' | 'Long' | 'Custom';
}

export type AppMode = 'HOME' | 'LEARN' | 'PRACTICE' | 'STATS' | 'DICTIONARY';
