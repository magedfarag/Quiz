import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { LoadingSpinner } from '@/components/admin/LoadingSpinner';
import { RiAddLine, RiEditLine, RiDeleteBinLine } from 'react-icons/ri';

export default function AdminQuestions() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Questions Management</h1>
          <p className="text-gray-600 mt-2">Create and manage quiz questions</p>
        </div>
        <button className="btn-primary flex items-center">
          <RiAddLine className="mr-2" />
          Add Question
        </button>
      </header>

      <DashboardCard title="Question List" className="overflow-hidden">
        {/* Question list implementation */}
      </DashboardCard>
    </motion.div>
  );
}
