import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { RiDownloadLine, RiFilterLine } from 'react-icons/ri';

export default function QuizResults() {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Quiz Results</h1>
          <p className="text-gray-600 mt-2">View and analyze quiz performance</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary">
            <RiFilterLine className="mr-2" />
            Filter
          </button>
          <button className="btn-primary">
            <RiDownloadLine className="mr-2" />
            Export
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6">
        <DashboardCard title="Results Overview" className="overflow-x-auto">
          <div className="mb-4 flex justify-end">
            <select 
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-field w-48"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
            </select>
          </div>
          
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Quiz</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Participants</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Avg. Score</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Pass Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Results rows will be mapped here */}
            </tbody>
          </table>
        </DashboardCard>
      </div>
    </motion.div>
  );
}
