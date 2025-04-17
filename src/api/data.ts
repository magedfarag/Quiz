// Data service for interacting with db.json
const API_URL = 'http://localhost:3001/api';

// Type definitions
export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  difficulty: string;
  category: string;
  timeLimit: number;
}

export interface QuizResult {
  id: string;
  studentName: string;
  quizId?: string;
  score: number;
  totalQuestions: number;
  answers?: string[];
  timestamp: number;
  timeRemaining: number;
  completed: boolean;
  percentage: number;
  achievements?: string[];
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  conditions: {
    quizzes_completed?: number;
    time_remaining_percent?: number;
    score_percent?: number;
    passed_quizzes?: number;
    min_average?: number;
    min_quizzes?: number;
  };
  isActive?: boolean;
  earnedCount: number;
}

export interface Stats {
  totalAttempts: number;
  completedAttempts: number;
  totalScore: number;
  averageScore: number;
  completionRate: number;
  performanceTrend: {
    date: string;
    averageScore: number;
    attempts: number;
  }[];
}

export interface Settings {
  quizTimeLimit: number;
  passingScore: number;
  maxQuestions: number;
  requireEmailVerification: boolean;
  allowRetakes: boolean;
  showResults: boolean;
  maxAttempts: number;
  feedbackMode: string;
  gradingScheme: string;
  lastUpdated: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: Record<string, any>;
  timestamp: string;
  ipAddress: string;
  userAgent: string;
}

export interface UserAchievements {
  [username: string]: number[];
}

// API functions
export const dataService = {
  // Get all quiz results
  async getQuizResults(): Promise<QuizResult[]> {
    const response = await fetch(`${API_URL}/results`);
    if (!response.ok) throw new Error('Failed to fetch quiz results');
    return response.json();
  },

  // Get quiz results by student name
  async getQuizResultsByStudent(studentName: string): Promise<QuizResult[]> {
    const response = await fetch(`${API_URL}/results?studentName=${encodeURIComponent(studentName)}`);
    if (!response.ok) throw new Error('Failed to fetch student results');
    return response.json();
  },

  // Get all achievements
  async getAchievements(): Promise<Achievement[]> {
    const response = await fetch(`${API_URL}/achievements`);
    if (!response.ok) throw new Error('Failed to fetch achievements');
    return response.json();
  },

  // Update an achievement
  async updateAchievement(id: number, achievement: Partial<Achievement>): Promise<Achievement> {
    // Using the raw endpoint path to avoid doubling the /api prefix that's already in API_URL
    const response = await fetch(`${API_URL}/achievements/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(achievement)
    });
    
    // Log the request URL to help with debugging
    console.log(`Updating achievement at: ${API_URL}/achievements/${id}`);
    
    if (!response.ok) {
      console.error(`Error updating achievement: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to update achievement: ${response.status} ${response.statusText}`);
    }
    return response.json();
  },

  // Get system stats
  async getStats(): Promise<Stats> {
    const response = await fetch(`${API_URL}/results/stats`); // Changed endpoint from /stats to /api/results/stats
    if (!response.ok) throw new Error('Failed to fetch stats');
    return response.json();
  },

  // Get system settings
  async getSettings(): Promise<Settings> {
    const response = await fetch(`${API_URL}/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  // Update system settings
  async updateSettings(settings: Partial<Settings>): Promise<Settings> {
    // Include the lastUpdated timestamp
    const updatedSettings = {
      ...settings,
      lastUpdated: new Date().toISOString()
    };
    
    const response = await fetch(`${API_URL}/settings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedSettings)
    });
    
    if (!response.ok) throw new Error('Failed to update settings');
    return response.json();
  },

  // Get audit logs
  async getAuditLogs(): Promise<AuditLog[]> {
    const response = await fetch(`${API_URL}/admin/audit-logs`);
    if (!response.ok) throw new Error('Failed to fetch audit logs');
    return response.json();
  },

  // Get user achievements
  async getUserAchievements(): Promise<UserAchievements> {
    const response = await fetch(`${API_URL}/userAchievements`);
    if (!response.ok) throw new Error('Failed to fetch user achievements');
    return response.json();
  },

  // Update user achievements
  async updateUserAchievements(username: string, achievements: number[]): Promise<UserAchievements> {
    // First get the current user achievements
    const current = await this.getUserAchievements();
    
    // Update the specific user's achievements
    const updated = {
      ...current,
      [username]: achievements
    };
    
    const response = await fetch(`${API_URL}/userAchievements`, {
      method: 'PUT', // Replace the entire userAchievements object
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated)
    });
    
    if (!response.ok) throw new Error('Failed to update user achievements');
    return response.json();
  }
};