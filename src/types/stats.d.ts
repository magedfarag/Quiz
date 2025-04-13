export interface QuizResultStats {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  recentAttempts: QuizResult[];
  completionRate: number;
}

export interface QuestionStats {
  id: string;
  text: string;
  totalAttempts: number;
  correctAnswers: number;
  accuracy: number;
  averageTime: number;
}

export interface QuizResult {
  id: string;
  userId: string;
  score: number;
  completed: boolean;
  answers: QuizAnswer[];
  timestamp: string;
}

export interface QuizAnswer {
  questionId: string;
  correct: boolean;
  timeSpent: number;
}
