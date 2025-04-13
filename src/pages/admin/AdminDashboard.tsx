import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, BookOpen, Award, Clock, 
  TrendingUp, Activity, AlertCircle 
} from 'lucide-react';
import { DashboardCard } from '@/components/admin/DashboardCard';
import AdminLayout from '../../components/AdminLayout';
import { getDashboardStats } from '@/api/admin';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { PerformanceChart } from '@/components/admin/PerformanceChart';

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState('week');
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      </AdminLayout>
    );
  }

  const statCards = [
    { icon: Users, label: 'Active Users', value: stats?.activeUsers || 0, trend: '+12%' },
    { icon: BookOpen, label: 'Total Quizzes', value: stats?.totalQuizzes || 0, trend: '+3' },
    { icon: Award, label: 'Avg Score', value: `${Math.round(stats?.averageScore || 0)}%`, trend: '+5%' },
    { icon: Clock, label: 'Completion Rate', value: `${Math.round(stats?.completionRate || 0)}%`, trend: '-2%' }
  ];

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-600 mt-2">Overview of your quiz platform</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <DashboardCard>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center">
                    <stat.icon className="w-8 h-8 text-primary-600 mr-3" />
                    <div>
                      <p className="text-gray-600 text-sm">{stat.label}</p>
                      <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                    </div>
                  </div>
                  <div className={`text-sm ${
                    stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.trend}
                  </div>
                </div>
              </DashboardCard>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DashboardCard title="Recent Activity">
            <div className="p-4">
              <ul className="space-y-4">
                {stats?.recentActivity?.map((activity, index) => (
                  <li key={index} className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-primary-600" />
                    <div>
                      <p className="text-sm text-gray-600">
                        {activity.user} completed a quiz with score {activity.score}%
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </DashboardCard>

          <DashboardCard title="Performance Trends">
            <div className="p-4">
              {stats?.performanceTrend && (
                <PerformanceChart data={stats.performanceTrend} />
              )}
            </div>
          </DashboardCard>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
