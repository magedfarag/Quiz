import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, User, Clock, Search, Filter } from 'lucide-react';
import AdminLayout from '@components/AdminLayout';
import { DashboardCard } from '@/components/admin/DashboardCard';

export default function AdminAuditLogs() {
  const [filter, setFilter] = useState('');
  const logs = [
    { id: 1, action: "Created new quiz", user: "Admin", timestamp: "2023-10-15 14:30" },
    { id: 2, action: "Updated user permissions", user: "Admin", timestamp: "2023-10-14 09:15" }
  ];

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Audit Logs</h1>
            <p className="text-gray-600 mt-2">Track system activities and changes</p>
          </div>
          <div className="flex space-x-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            <button className="btn-secondary">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
          </div>
        </header>

        <DashboardCard>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Action</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">User</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-600">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-primary-600" />
                      {log.action}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <User className="w-4 h-4 mr-2 text-gray-400" />
                        {log.user}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-400" />
                        {log.timestamp}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </DashboardCard>
      </motion.div>
    </AdminLayout>
  );
}
