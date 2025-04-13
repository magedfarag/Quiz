import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, BarChart, DoughnutChart } from '@/components/Charts';
import AdminLayout from '@components/AdminLayout';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { Calendar, Users, Award, Clock } from 'lucide-react';

export default function AdminAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/results/stats').then(res => res.json()),
      fetch('/api/questions/stats').then(res => res.json())
    ]).then(([results, questions]) => {
      setAnalyticsData({ results, questions });
    });
  }, []);

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Analytics</h1>
          <p className="text-gray-600 mt-2">Detailed insights and statistics</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <DashboardCard>
            <div className="flex items-center">
              <Users className="w-12 h-12 text-primary-600 mr-4" />
              <div>
                <p className="text-gray-600">Total Attempts</p>
                <h3 className="text-2xl font-bold">{analyticsData?.results?.totalAttempts || 0}</h3>
              </div>
            </div>
          </DashboardCard>
          {/* Add more stat cards */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <DashboardCard title="Score Distribution">
            <BarChart 
              data={analyticsData?.results?.scoreDistribution || []}
              xAxis="score"
              yAxis="count"
            />
          </DashboardCard>

          <DashboardCard title="Question Performance">
            <DoughnutChart 
              data={analyticsData?.questions?.map(q => ({
                label: `Q${q.id}`,
                value: q.accuracy
              })) || []}
            />
          </DashboardCard>
        </div>

        <DashboardCard title="Completion Trends">
          <LineChart 
            data={analyticsData?.results?.completionTrend || []}
            xAxis="date"
            yAxis="completions"
          />
        </DashboardCard>
      </motion.div>
    </AdminLayout>
  );
}
