export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question?: string;
  text?: string;
  options?: string[]; // For multiple choice
  correctAnswer?: string; // For short answer and true/false
  answer?: boolean; // For true/false
  category?: string;
  difficulty?: DifficultyLevel;
}

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  timeLimit: number;
  passingScore: number;
  questions: {
    id: string;
    text: string;
    options: string[];
    correctAnswer: string;
    type?: QuestionType;
    difficulty?: DifficultyLevel;
  }[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface QuizResultData {
  studentName: string;
  timestamp: number;
  score: number;
  totalQuestions: number;
  answers: {
    questionText: string;
    selectedAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
}
