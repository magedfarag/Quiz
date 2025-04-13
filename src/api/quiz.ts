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
