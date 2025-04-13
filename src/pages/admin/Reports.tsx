import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { RiFileDownloadLine, RiCalendarLine } from 'react-icons/ri';

export default function Reports() {
  const [dateRange, setDateRange] = useState('week');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Reports</h1>
          <p className="text-gray-600 mt-2">Generate and download detailed reports</p>
        </div>
        <div className="flex space-x-3">
          <select 
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input-field"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Performance Summary">
          {/* Performance metrics implementation */}
        </DashboardCard>

        <DashboardCard title="Available Reports">
          <div className="space-y-4">
            {['Quiz Performance', 'User Activity', 'Question Analysis'].map((report) => (
              <motion.div
                key={report}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-gray-800">{report}</h3>
                    <p className="text-sm text-gray-600">Export detailed analytics</p>
                  </div>
                  <RiFileDownloadLine className="w-6 h-6 text-primary-600" />
                </div>
              </motion.div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </motion.div>
  );
}
