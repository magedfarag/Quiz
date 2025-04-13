export interface DashboardStats {
  totalQuizzes: number;
  activeUsers: number;
  averageScore: number;
  completionRate: number;
  recentActivity: {
    type: string;
    user: string;
    score: number;
    timestamp: string;
  }[];
  performanceTrend: {
    date: string;
    score: number;
  }[];
}
