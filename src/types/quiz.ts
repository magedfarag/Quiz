import { QuestionType, DifficultyLevel } from '../types';

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: string[];
  timeLimit: number;
  passingScore: number;
  isPublished: boolean;
  category: string;
  difficulty: string;
  attempts: number;
  averageScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
  category: string;
  timeLimit: number;
}
