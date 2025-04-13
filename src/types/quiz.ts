import { QuestionType, DifficultyLevel } from '../types';

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

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
}
