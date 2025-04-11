import { QuizResultData } from '../types';

const API_BASE_URL = 'http://localhost:3001/api';

export const sendQuizResults = async (email: string, resultData: QuizResultData): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/email/quiz-results`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, resultData })
  });

  if (!response.ok) {
    throw new Error('Failed to send quiz results email');
  }
};

export const sendVerificationEmail = async (email: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/email/verification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, token })
  });

  if (!response.ok) {
    throw new Error('Failed to send verification email');
  }
};

export const sendPasswordResetEmail = async (email: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/email/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, token })
  });

  if (!response.ok) {
    throw new Error('Failed to send password reset email');
  }
};