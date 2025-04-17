export const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

import type { User } from '../types/user';
import type { Quiz } from '../types/quiz';
import type { AuditLog } from '@/types/audit'; // This might need adjustment based on your tsconfig paths
import type { AdminSettings } from '../types/settings.d'; // Added import for AdminSettings

export const fetchQuizStats = async () => {
  const response = await fetch(`${API_URL}/results/stats`);
  if (!response.ok) throw new Error('Failed to fetch quiz stats');
  return response.json();
};

export const fetchQuestionStats = async () => {
  const response = await fetch(`${API_URL}/questions/stats`);
  if (!response.ok) throw new Error('Failed to fetch question stats');
  return response.json();
};

export const fetchUserResults = async (userId: string) => {
  const response = await fetch(`${API_URL}/results/user/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user results');
  return response.json();
};

export const fetchSettings = async () => {
  const response = await fetch(`${API_URL}/admin/settings`);
  if (!response.ok) throw new Error('Failed to fetch settings');
  return response.json();
};

export const updateSettings = async (settingsData: AdminSettings) => {
  const response = await fetch(`${API_URL}/admin/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    // Wrap settingsData in a 'settings' object as expected by the server
    body: JSON.stringify({ settings: settingsData })
  });
  
  if (!response.ok) {
    let errorData: { error: string; details?: any } = { error: 'Failed to update settings' };
    try {
      errorData = await response.json();
      if (errorData.details) {
        console.error('Server validation errors:', errorData.details);
      }
    } catch (e) {
      console.error('Could not parse error response from server');
    }
    throw new Error(errorData.error || 'Failed to update settings');
  }
  
  return response.json();
};

export const resetSettings = async () => {
  const response = await fetch(`${API_URL}/admin/settings/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to reset settings');
  }
  
  return response.json();
};

export const fetchUsers = async () => {
  const response = await fetch(`${API_URL}/admin/users`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const updateUser = async (userId: string, userData: Record<string, any>) => {
  const response = await fetch(`${API_URL}/admin/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!response.ok) throw new Error('Failed to update user');
  return response.json();
};

export const adminApi = {
  // Users
  async getUsers() {
    const response = await fetch(`${API_URL}/users`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async createUser(userData: any) {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Failed to create user');
    return response.json();
  },

  async deleteUser(userId: string) {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete user');
    return response.json();
  },

  async getUser(id: string): Promise<User> {
    const response = await fetch(`${API_URL}/users/${id}`);
    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Failed to fetch user');
    }
    return response.json();
  },

  async updateUser(id: string, userData: any) {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    if (!response.ok) throw new Error('Failed to update user');
    return response.json();
  },

  // Questions
  async getQuestion(id: string): Promise<any> {
    const response = await fetch(`${API_URL}/questions/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch question');
    }
    return response.json();
  },

  // Quizzes
  async getQuizzes(): Promise<Quiz[]> {
    const response = await fetch(`${API_URL}/quizzes`);
    if (!response.ok) {
      throw new Error('Failed to fetch quizzes');
    }
    return response.json();
  },

  async getQuiz(id: string): Promise<Quiz> {
    const response = await fetch(`${API_URL}/quizzes/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch quiz');
    }
    return response.json();
  },

  async createQuiz(quizData: Partial<Quiz>): Promise<Quiz> {
    const response = await fetch(`${API_URL}/quizzes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quizData)
    });
    if (!response.ok) {
      throw new Error('Failed to create quiz');
    }
    return response.json();
  },

  async updateQuiz(quizId: string, quizData: Partial<Quiz>): Promise<Quiz> {
    const response = await fetch(`${API_URL}/quizzes/${quizId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(quizData)
    });
    if (!response.ok) throw new Error('Failed to update quiz');
    return response.json();
  },

  async deleteQuiz(quizId: string) {
    const response = await fetch(`${API_URL}/quizzes/${quizId}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete quiz');
    return response.json();
  },

  // Dashboard
  async fetchDashboardStats() {
    const response = await fetch(`${API_URL}/admin/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    return response.json();
  },

  // Audit Logs
  async getAuditLogs(): Promise<AuditLog[]> {
    // Always use the real API endpoint
    const response = await fetch(`${API_URL}/admin/audit-logs`); // Corrected endpoint
    if (!response.ok) {
      throw new Error('Failed to fetch audit logs');
    }
    return response.json();
  },
};

// Fix the named export by binding the method
export const getDashboardStats = adminApi.fetchDashboardStats.bind(adminApi);
