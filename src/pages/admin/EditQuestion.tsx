import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Eye, Image, Plus, Trash2 } from 'lucide-react';
import { DashboardCard } from '@/components/admin/DashboardCard';

export default function EditQuestion() {
  const [showPreview, setShowPreview] = useState(false);
  const [question, setQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    points: 1,
    timeLimit: 30,
    media: null
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Edit Question</h1>
          <p className="text-gray-600 mt-2">Modify question content and settings</p>
        </div>
        <div className="flex space-x-3">
          <button className="btn-secondary" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </button>
          <button className="btn-primary">
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <DashboardCard title="Question Content">
            {/* Rich text editor implementation */}
          </DashboardCard>

          <DashboardCard title="Options">
            {question.options.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center space-x-3 mb-3"
              >
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={index === question.correctAnswer}
                  onChange={() => setQuestion({ ...question, correctAnswer: index })}
                  className="w-4 h-4 text-primary-600"
                />
                <input
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...question.options];
                    newOptions[index] = e.target.value;
                    setQuestion({ ...question, options: newOptions });
                  }}
                  className="flex-1 input-field"
                  placeholder={`Option ${index + 1}`}
                />
                <button className="p-2 hover:bg-red-50 text-red-500 rounded-full">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </DashboardCard>
        </div>

        {showPreview ? (
          <DashboardCard title="Preview">
            {/* Question preview implementation */}
          </DashboardCard>
        ) : (
          <DashboardCard title="Settings">
            {/* Question settings form */}
          </DashboardCard>
        )}
      </div>
    </motion.div>
  );
}
