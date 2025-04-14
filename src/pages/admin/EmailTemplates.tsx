import { useState } from 'react';
import { motion } from 'framer-motion';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { RiMailLine, RiEditLine, RiTestTubeLine } from 'react-icons/ri';

export default function EmailTemplates() {
  const [selectedTemplate, setSelectedTemplate] = useState('welcome');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Email Templates</h1>
        <p className="text-gray-600 mt-2">Manage and customize email notifications</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <DashboardCard title="Template List" className="lg:col-span-1">
          <div className="space-y-2">
            {['Welcome', 'Quiz Results', 'Password Reset'].map((template) => (
              <motion.button
                key={template}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedTemplate === template.toLowerCase() 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => setSelectedTemplate(template.toLowerCase())}
                whileHover={{ x: 4 }}
              >
                <div className="flex items-center">
                  <RiMailLine className="w-5 h-5 mr-3" />
                  {template}
                </div>
              </motion.button>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard title="Template Editor" className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex justify-between">
              <div className="space-x-2">
                <button className="btn-secondary">
                  <RiTestTubeLine className="mr-2" />
                  Test
                </button>
                <button className="btn-primary">
                  <RiEditLine className="mr-2" />
                  Save
                </button>
              </div>
            </div>
            <textarea
              className="input-field h-96 font-mono"
              placeholder="Enter email template HTML..."
            />
          </div>
        </DashboardCard>
      </div>
    </motion.div>
  );
}
