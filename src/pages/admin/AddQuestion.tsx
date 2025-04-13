import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, Plus, Trash2 } from 'lucide-react';
import { DashboardCard } from '@/components/admin/DashboardCard';

export default function AddQuestion() {
  const [showPreview, setShowPreview] = useState(false);
  const [question, setQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 1
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Add Question</h1>
          <p className="text-gray-600 mt-2">Create a new quiz question</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </button>
          <button className="btn-primary">
            <Save className="w-4 h-4 mr-2" />
            Save Question
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Question Details">
          {/* Question form implementation */}
        </DashboardCard>

        {showPreview && (
          <DashboardCard title="Preview">
            {/* Preview implementation */}
          </DashboardCard>
        )}
      </div>
    </motion.div>
  );
}
