import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { RiSaveLine, RiEyeLine } from 'react-icons/ri';

export default function QuestionEditor() {
  const [showPreview, setShowPreview] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Question Editor</h1>
          <p className="text-gray-600 mt-2">Create or edit quiz questions</p>
        </div>
        <div className="flex space-x-3">
          <button 
            className="btn-secondary"
            onClick={() => setShowPreview(!showPreview)}
          >
            <RiEyeLine className="mr-2" />
            Preview
          </button>
          <button className="btn-primary">
            <RiSaveLine className="mr-2" />
            Save
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Question Details">
          <form className="space-y-6">
            <div>
              <label className="label">Question Text</label>
              <textarea 
                className="input-field h-32"
                placeholder="Enter your question..."
              />
            </div>
            
            <div>
              <label className="label">Options</label>
              <div className="space-y-3">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="radio"
                      name="correct"
                      className="w-4 h-4 text-primary-600"
                    />
                    <input
                      type="text"
                      className="input-field flex-1"
                      placeholder={`Option ${index}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          </form>
        </DashboardCard>

        {showPreview && (
          <DashboardCard title="Preview">
            {/* Question preview implementation */}
          </DashboardCard>
        )}
      </div>
    </motion.div>
  );
}
