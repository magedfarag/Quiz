import type { Quiz, QuizQuestion } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const fetchQuiz = async (quizId: string): Promise<Quiz> => {
  const response = await fetch(`${API_BASE_URL}/quizzes/${quizId}`);
  if (!response.ok) throw new Error('Failed to fetch quiz');
  return response.json();
};

export const fetchQuestions = async (quizId?: string): Promise<QuizQuestion[]> => {
  const url = quizId 
    ? `${API_BASE_URL}/quizzes/${quizId}/questions`
    : `${API_BASE_URL}/questions`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch questions');
  return response.json();
};

export const submitQuizResults = async (resultData: Record<string, any>) => {
  try {
    const response = await fetch(`${API_BASE_URL}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit quiz');
    }
    return response.json();
  } catch (error) {
    console.error('Error submitting quiz:', error);
    throw error;
  }
};

export const deleteQuestion = async (questionId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete question');
    }
    return response.json();
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};

// API service for quiz management
import { QuizQuestion } from './data';

const API_URL = 'http://localhost:3001';

// Type definitions
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

// API functions
export const quizService = {
  // Get all quizzes
  async getQuizzes(): Promise<Quiz[]> {
    const response = await fetch(`${API_URL}/quizzes`);
    if (!response.ok) throw new Error('Failed to fetch quizzes');
    return response.json();
  },

  // Get a single quiz by id
  async getQuizById(id: string): Promise<Quiz> {
    const response = await fetch(`${API_URL}/quizzes/${id}`);
    if (!response.ok) throw new Error('Failed to fetch quiz');
    return response.json();
  },

  // Get questions for a quiz
  async getQuizWithQuestions(id: string): Promise<{quiz: Quiz, questions: QuizQuestion[]}> {
    try {
      // Fetch the quiz
      const quizResponse = await fetch(`${API_URL}/quizzes/${id}`);
      if (!quizResponse.ok) throw new Error('Failed to fetch quiz');
      const quiz: Quiz = await quizResponse.json();
      
      // Fetch all questions
      const questionsResponse = await fetch(`${API_URL}/questions`);
      if (!questionsResponse.ok) throw new Error('Failed to fetch questions');
      const allQuestions: QuizQuestion[] = await questionsResponse.json();
      
      // Filter questions for this quiz
      const quizQuestions = allQuestions.filter(question => 
        quiz.questions.includes(question.id)
      );
      
      return { quiz, questions: quizQuestions };
    } catch (error) {
      console.error('Error fetching quiz with questions:', error);
      throw error;
    }
  },

  // Create a new quiz
  async createQuiz(quiz: Omit<Quiz, 'id' | 'createdAt' | 'updatedAt'>): Promise<Quiz> {
    const now = new Date().toISOString();
    const newQuiz = {
      ...quiz,
      attempts: 0,
      averageScore: 0,
      createdAt: now,
      updatedAt: now
    };

    const response = await fetch(`${API_URL}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newQuiz)
    });

    if (!response.ok) throw new Error('Failed to create quiz');
    return response.json();
  },

  // Update a quiz
  async updateQuiz(id: string, quiz: Partial<Quiz>): Promise<Quiz> {
    const updatedQuiz = {
      ...quiz,
      updatedAt: new Date().toISOString()
    };

    const response = await fetch(`${API_URL}/quizzes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedQuiz)
    });

    if (!response.ok) throw new Error('Failed to update quiz');
    return response.json();
  },

  // Delete a quiz
  async deleteQuiz(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/quizzes/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete quiz');
  },

  // Get all questions
  async getQuestions(): Promise<QuizQuestion[]> {
    const response = await fetch(`${API_URL}/questions`);
    if (!response.ok) throw new Error('Failed to fetch questions');
    return response.json();
  },

  // Get a single question by id
  async getQuestionById(id: string): Promise<QuizQuestion> {
    const response = await fetch(`${API_URL}/questions/${id}`);
    if (!response.ok) throw new Error('Failed to fetch question');
    return response.json();
  },

  // Create a new question
  async createQuestion(question: Omit<QuizQuestion, 'id'>): Promise<QuizQuestion> {
    const response = await fetch(`${API_URL}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question)
    });

    if (!response.ok) throw new Error('Failed to create question');
    return response.json();
  },

  // Update a question
  async updateQuestion(id: string, question: Partial<QuizQuestion>): Promise<QuizQuestion> {
    const response = await fetch(`${API_URL}/questions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(question)
    });

    if (!response.ok) throw new Error('Failed to update question');
    return response.json();
  },

  // Delete a question
  async deleteQuestion(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/questions/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) throw new Error('Failed to delete question');
  },

  // Submit a quiz
  async submitQuiz(quizResult: any): Promise<any> {
    // Generate current timestamp
    const timestamp = Date.now();
    
    // Prepare the result with ID and timestamp
    const result = {
      ...quizResult,
      id: timestamp.toString(),
      timestamp
    };

    // Save the result
    const resultResponse = await fetch(`${API_URL}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(result)
    });

    if (!resultResponse.ok) throw new Error('Failed to submit quiz');
    const savedResult = await resultResponse.json();

    // Create audit log entry
    const auditLog = {
      id: timestamp.toString(),
      userId: 'system',
      action: 'QUIZ_SUBMISSION',
      details: {
        studentId: result.studentName,
        score: `${result.score}/${result.totalQuestions}`,
        percentage: `${result.percentage.toFixed(1)}%`,
        completed: result.completed,
        timeRemaining: result.timeRemaining
      },
      timestamp: new Date(timestamp).toISOString(),
      ipAddress: '',
      userAgent: ''
    };

    await fetch(`${API_URL}/auditLogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(auditLog)
    });

    return savedResult;
  }
};
