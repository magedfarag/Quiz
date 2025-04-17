import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, BarChart } from '../../components/Charts'; // Removed DoughnutChart
import AdminLayout from '../../components/AdminLayout';
import { DashboardCard } from '../../components/admin/DashboardCard';
import { Calendar, Users, Award, Clock, RefreshCw } from 'lucide-react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { dataService, Stats } from '../../api/data'; // Changed Stat to Stats

interface AnalyticsData {
  results: {
    totalAttempts: number;
    averageScore: number;
    completionRate: number;
    scoreDistribution: { score: number; count: number; }[];
    completionTrend: { date: string; completions: number; }[];
    performanceTrend: { date: string; score: number; }[];
  };
  // Removed questions property
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
      
      // Fetch only stats data
      const stats = await dataService.getStats();
      
      // Process stats data for charts
      const scoreDistribution = processScoreDistribution(stats);
      // Assuming completionTrend and performanceTrend are directly available or calculable from stats
      // If performanceTrend isn't directly on stats, adjust this logic
      const completionTrend = stats.performanceTrend?.map(item => ({
        date: item.date,
        completions: item.attempts
      })) || []; // Add null check and default
      
      const performanceTrend = stats.performanceTrend?.map(item => ({
        date: item.date,
        score: item.averageScore
      })) || []; // Add null check and default
      
      setAnalyticsData({
        results: {
          totalAttempts: stats.totalAttempts,
          averageScore: stats.averageScore,
          completionRate: stats.completionRate,
          scoreDistribution,
          completionTrend,
          performanceTrend
        }
        // Removed questions property assignment
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load analytics data';
      setError(message);
      console.error('Error fetching analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to generate score distribution from stats
  const processScoreDistribution = (stats: Stats) => { // Changed Stat to Stats
    // Create buckets for scores (0-10, 11-20, ..., 91-100)
    const distribution = [];
    // Example: Simple distribution based on average - replace with real logic if available
    const avgBucket = Math.floor(stats.averageScore / 10) * 10;
    for (let i = 0; i <= 90; i += 10) {
      // Placeholder logic - needs refinement based on actual data structure if available
      let count = Math.floor(stats.totalAttempts / 10);
      if (i === avgBucket) count *= 2; // More attempts around average
      if (i === 0 || i === 90) count /= 2; // Fewer at extremes
      distribution.push({
        score: i + 10, // Represents the upper bound of the bucket (e.g., 10 for 0-10)
        count: Math.max(0, Math.round(count)) // Ensure non-negative integer
      });
    }
    return distribution;
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
            {/* Keep the top row of cards, remove the "Quiz Content" card */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"> {/* Adjusted grid to 3 cols */}
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

              {/* Removed Quiz Content Card */}
            </div>

            {/* Keep Score Distribution, remove Question Performance */}
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6 mb-8"> {/* Adjusted grid to 1 col */}
              <DashboardCard title="Score Distribution">
                <div className="p-4 h-80">
                  {analyticsData?.results?.scoreDistribution && (
                    <BarChart 
                      data={analyticsData.results.scoreDistribution}
                      xAxis="score"
                      yAxis="count"
                      height={300}
                    />
                  )}
                </div>
              </DashboardCard>

              {/* Removed Question Performance Card */}
            </div>

            {/* Keep Performance Trends */}
            <DashboardCard title="Performance Trends">
              <div className="p-4 h-80">
                {analyticsData?.results?.performanceTrend && (
                  <LineChart 
                    data={analyticsData.results.performanceTrend}
                    xAxis="date"
                    yAxis="score"
                    height={300}
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
