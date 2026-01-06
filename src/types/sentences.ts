export type SentenceWord = {
  /** Optional dictionary identifier when the word exists in the lexicon */
  wordId?: string;
  /** Hebrew word text */
  hebrew: string;
  /** Inclusive start index within the original Hebrew sentence */
  start: number;
  /** Inclusive end index within the original Hebrew sentence */
  end: number;
  /** Optional explicit surface slice (defaults to the Hebrew word) */
  surface?: string;
};

export interface Sentence {
  id: string;
  hebrew: string;
  english: string;
  theme: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  grammarPoints: string[];
  words: SentenceWord[];
}

export type SentenceResult = 'correct' | 'partial' | 'incorrect';

export interface SentenceProgressEntry {
  sentenceId: string;
  theme: string;
  lastResult: SentenceResult | null;
  attempts: number;
  updatedAt: string;
  /** Placeholder for future spaced repetition scheduling */
  nextReviewAt?: string | null;
}
