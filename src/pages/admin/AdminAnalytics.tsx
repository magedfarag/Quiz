import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, BarChart, DoughnutChart } from '../../components/Charts';
import AdminLayout from '../../components/AdminLayout';
import { DashboardCard } from '../../components/admin/DashboardCard';
import { Calendar, Users, Award, Clock, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

interface AnalyticsData {
  results: {
    totalAttempts: number;
    averageScore: number;
    completionRate: number;
    scoreDistribution: { score: number; count: number; }[];
    completionTrend: { date: string; completions: number; }[];
  };
  questions: {
    id: string;
    text: string;
    totalAttempts: number;
    correctAnswers: number;
    accuracy: number;
  }[];
}

export default function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('week');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const [results, questions] = await Promise.all([
        fetch(`${API_URL}/results/stats`).then(res => {
          if (!res.ok) throw new Error('Failed to fetch results stats');
          return res.json();
        }),
        fetch(`${API_URL}/questions/stats`).then(res => {
          if (!res.ok) throw new Error('Failed to fetch questions stats');
          return res.json();
        })
      ]);
      setAnalyticsData({ results, questions });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load analytics data';
      setError(message);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
            <p className="text-gray-600 mt-2">Detailed insights and statistics</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <button 
              onClick={fetchAnalytics}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </header>

        {error ? (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-8">
            {error}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <DashboardCard title="Quiz Attempts">
                <div className="flex items-center p-4">
                  <Users className="w-12 h-12 text-primary-600 mr-4" />
                  <div>
                    <p className="text-gray-600">Total Attempts</p>
                    <h3 className="text-2xl font-bold">{analyticsData?.results?.totalAttempts || 0}</h3>
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard title="Performance">
                <div className="flex items-center p-4">
                  <Award className="w-12 h-12 text-primary-600 mr-4" />
                  <div>
                    <p className="text-gray-600">Average Score</p>
                    <h3 className="text-2xl font-bold">{analyticsData?.results?.averageScore?.toFixed(1) || 0}%</h3>
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard title="Completion">
                <div className="flex items-center p-4">
                  <Clock className="w-12 h-12 text-primary-600 mr-4" />
                  <div>
                    <p className="text-gray-600">Completion Rate</p>
                    <h3 className="text-2xl font-bold">{analyticsData?.results?.completionRate?.toFixed(1) || 0}%</h3>
                  </div>
                </div>
              </DashboardCard>

              <DashboardCard title="Quiz Content">
                <div className="flex items-center p-4">
                  <Calendar className="w-12 h-12 text-primary-600 mr-4" />
                  <div>
                    <p className="text-gray-600">Active Quizzes</p>
                    <h3 className="text-2xl font-bold">{analyticsData?.questions?.length || 0}</h3>
                  </div>
                </div>
              </DashboardCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <DashboardCard title="Score Distribution">
                <div className="p-4 h-80">
                  {analyticsData?.results?.scoreDistribution && (
                    <BarChart 
                      data={analyticsData.results.scoreDistribution}
                      xAxis="score"
                      yAxis="count"
                    />
                  )}
                </div>
              </DashboardCard>

              <DashboardCard title="Question Performance">
                <div className="p-4 h-80">
                  {analyticsData?.questions && (
                    <DoughnutChart 
                      data={analyticsData.questions.map(q => ({
                        label: q.text.substring(0, 20) + '...',
                        value: q.accuracy
                      }))}
                    />
                  )}
                </div>
              </DashboardCard>
            </div>

            <DashboardCard title="Completion Trends">
              <div className="p-4 h-80">
                {analyticsData?.results?.completionTrend && (
                  <LineChart 
                    data={analyticsData.results.completionTrend}
                    xAxis="date"
                    yAxis="completions"
                  />
                )}
              </div>
            </DashboardCard>
          </>
        )}
      </motion.div>
    </AdminLayout>
  );
}
