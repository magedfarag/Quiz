import React from 'react';
import { userData } from '../../data/quizData';

const AdminUserManagement: React.FC = () => {
  return (
    <div className="admin-user-management">
      <h1 className="text-2xl font-bold">User Management</h1>
      <table className="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Quizzes Completed</th>
            <th>Average Score</th>
          </tr>
        </thead>
        <tbody>
          {userData.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.quizzesCompleted}</td>
              <td>{user.averageScore}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUserManagement;
