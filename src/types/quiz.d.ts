export interface Quiz {
  id: string;
  title: string;
  category: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
}

export interface QuizStats {
  totalAttempts: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  completionRate: number;
}
