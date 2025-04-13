import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { LoadingSpinner } from '@/components/admin/LoadingSpinner';
import { RiUserAddLine, RiFilterLine } from 'react-icons/ri';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
          <p className="text-gray-600 mt-2">Manage user accounts and permissions</p>
        </div>
        <button className="btn-primary flex items-center">
          <RiUserAddLine className="mr-2" />
          Add User
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard title="Quick Stats">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Total Users</span>
              <span className="text-2xl font-bold text-primary-600">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Users</span>
              <span className="text-2xl font-bold text-success-600">0</span>
            </div>
          </div>
        </DashboardCard>
      </div>

      <DashboardCard title="User List" className="overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Search users..."
              className="input-field"
            />
            <button className="btn-secondary">
              <RiFilterLine className="mr-2" />
              Filter
            </button>
          </div>
        </div>

        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Name</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Email</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Role</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {/* User rows will be mapped here */}
          </tbody>
        </table>
      </DashboardCard>
    </motion.div>
  );
}
