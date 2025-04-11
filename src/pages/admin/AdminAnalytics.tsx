import { useState, useEffect } from 'react';
import { fetchQuizStats, fetchQuestionStats } from '@/api/admin';
import { BarChart, PieChart } from '@/components/Charts';

export default function AdminAnalytics() {
  const [quizStats, setQuizStats] = useState(null);
  const [questionStats, setQuestionStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [quizData, questionData] = await Promise.all([
          fetchQuizStats(),
          fetchQuestionStats()
        ]);
        setQuizStats(quizData);
        setQuestionStats(questionData);
      } catch (error) {
        console.error('Failed to load analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Analytics Dashboard</h1>
      
      {quizStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Quiz Performance</h2>
            <BarChart
              data={[
                { label: 'Avg Score', value: quizStats.averageScore },
                { label: 'Completion Rate', value: quizStats.completionRate }
              ]}
            />
          </div>
          
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Question Accuracy</h2>
            <PieChart
              data={questionStats.map(q => ({
                label: q.questionText,
                value: q.correctPercentage
              }))}
            />
          </div>
        </div>
      )}

      {/* Top Scorers Table */}
      {quizStats?.topScorers && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Top Scorers</h2>
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left">Name</th>
                <th className="text-left">Score</th>
                <th className="text-left">Percentage</th>
              </tr>
            </thead>
            <tbody>
              {quizStats.topScorers.map((scorer, index) => (
                <tr key={index}>
                  <td>{scorer.name}</td>
                  <td>{scorer.score}</td>
                  <td>{scorer.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AdminLayout>
  );
}
