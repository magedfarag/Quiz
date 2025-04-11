import React from 'react';
import { adminStats } from '../../data/quizData';
import AdminLayout from '../../components/AdminLayout';

const AdminDashboard: React.FC = () => {
  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <div className="grid grid-cols-3 gap-4">
        <div className="stat-card">
          <h2>Total Quizzes</h2>
          <p>{adminStats.totalQuizzes}</p>
        </div>
        <div className="stat-card">
          <h2>Active Users</h2>
          <p>{adminStats.activeUsers}</p>
        </div>
        <div className="stat-card">
          <h2>Average Score</h2>
          <p>{adminStats.averageScore}%</p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
