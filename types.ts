export interface Question {
  id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export interface PracticeSet {
  part: number;
  passage?: string;
  questions: Question[];
}

export interface UserAnswers {
  [questionId: string]: string;
}

export interface WordInfo {
  translation: string;
  example: string;
  phonetic: string;
  visualDescription: string; // Description for image generation
  imageUrl: string;
}

export interface SavedWord extends WordInfo {
  word: string;
  level: number;
  nextReviewAt: string; // ISO 8601 date string
}

export interface MistakeAnalysis {
  analysis: string;
}

export interface DailyQuestStatus {
  loggedIn: boolean;
  savedWord: boolean;
  reviewedVocab: boolean;
  completedPart5: boolean;
  completedPart6: boolean;
  completedPart7: boolean;
}