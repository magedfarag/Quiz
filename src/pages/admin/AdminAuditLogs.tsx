import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, AlertCircle } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { adminApi } from '@/api/admin';
import type { AuditLog } from '@/types/audit';

const MAX_RETRIES = 3;

const AdminAuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  const fetchLogs = async (retry = false) => {
    try {
      if (retry && retryCount >= MAX_RETRIES) {
        setError('Maximum retry attempts reached. Please try again later.');
        return;
      }

      setIsLoading(true);
      setError('');
      const data = await adminApi.getAuditLogs();
      setLogs(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch audit logs';
      setError(`Error fetching audit logs: ${errorMessage}`);
      console.error('Error fetching audit logs:', err);
      
      if (retry) {
        setRetryCount(prev => prev + 1);
      }
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => fetchLogs(true), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const query = searchQuery.toLowerCase();
    return (
      log.action.toLowerCase().includes(query) ||
      log.userId.toString().includes(query) ||
      log.details?.toLowerCase().includes(query) ||
      new Date(log.timestamp).toLocaleString().toLowerCase().includes(query)
    );
  });

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
              <h1 className="text-3xl font-bold text-gray-800">Audit Logs</h1>
              <p className="text-gray-600 mt-2">Track and monitor system activities</p>
            </div>
          </header>

          <DashboardCard>
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
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
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>{error}</span>
                </div>
                <button 
                  onClick={() => fetchLogs()}
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
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Timestamp</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">User ID</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Action</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Details</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">IP Address</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-gray-50 animate-slide-in"
                    >
                      <td className="px-4 py-3 text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">{log.userId}</td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                          {log.action}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{log.details}</td>
                      <td className="px-4 py-3 text-sm font-mono">{log.ipAddress}</td>
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

export default AdminAuditLogs;
