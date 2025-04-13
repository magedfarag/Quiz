import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, UserPlus, Mail, Edit, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '@components/AdminLayout';
import { DashboardCard } from '@/components/admin/DashboardCard';
import type { User } from '@/types/user';
import '@/styles/animations.css';
import { adminApi } from '@/api/admin';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const MAX_RETRIES = 3;

const AdminUserManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (retry = false) => {
    try {
      if (retry) {
        if (retryCount >= MAX_RETRIES) {
          setError('Maximum retry attempts reached. Please try again later.');
          return;
        }
        setRetryCount(prev => prev + 1);
      } else {
        setRetryCount(0);
      }
      
      setIsLoading(true);
      setError('');
      const data = await adminApi.getUsers();
      setUsers(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users';
      setError(`Error loading users: ${errorMessage}`);
      console.error('Error fetching users:', err);
      
      // Auto-retry after 2 seconds
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => fetchUsers(true), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminApi.deleteUser(userId);
      await fetchUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(`Error deleting user: ${errorMessage}`);
      console.error('Error deleting user:', err);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-full space-y-4">
          <LoadingSpinner />
          {retryCount > 0 && (
            <div className="text-gray-600">
              Retry attempt {retryCount}/{MAX_RETRIES}...
            </div>
          )}
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
        <div className="animate-fade-in">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
              <p className="text-gray-600 mt-2">Manage and monitor user activities</p>
            </div>
            <button className="btn-primary">
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <DashboardCard>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-primary-600">{users.length}</h3>
                <p className="text-gray-600">Total Users</p>
              </div>
            </DashboardCard>
            {/* Add more stat cards */}
          </div>

          <DashboardCard>
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex space-x-3">
                <button className="btn-secondary">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex justify-between items-center">
                <span>{error}</span>
                <button 
                  onClick={fetchUsers}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Quizzes</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Avg. Score</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 animate-slide-in"
                      style={{ animationDelay: `${user.id * 0.1}s` }}
                    >
                      <td className="px-4 py-3">{user.name}</td>
                      <td className="px-4 py-3">{user.quizzesCompleted}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          user.averageScore >= 70 ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {user.averageScore}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 rounded-full bg-primary-100 text-primary-700 text-sm">
                          Active
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => navigate(`/admin/users/${user.id}/edit`)}
                            className="p-1 hover:bg-gray-100 rounded"
                          >
                            <Edit className="w-4 h-4 text-gray-600" />
                          </button>
                          <button 
                            onClick={() => handleDeleteUser(user.id)}
                            className="p-1 hover:bg-red-100 rounded"
                          >
                            <Trash2 className="w-4 h-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DashboardCard>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminUserManagement;
