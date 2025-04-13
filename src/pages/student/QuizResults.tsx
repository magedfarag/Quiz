import { motion } from 'framer-motion';
import { Award, Clock, BarChart2, RefreshCw } from 'lucide-react';

export default function QuizResults() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-3xl mx-auto py-8"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="inline-block p-6 bg-primary-50 rounded-full mb-4"
        >
          <Award className="w-12 h-12 text-primary-600" />
        </motion.div>
        <h1 className="text-3xl font-bold text-gray-800">Quiz Completed!</h1>
        <p className="text-gray-600 mt-2">Great job on completing the quiz</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Score cards and stats */}
      </div>

      <div className="space-y-6">
        <button className="w-full btn-primary py-3">
          Review Answers
        </button>
        <button className="w-full btn-secondary py-3">
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </button>
      </div>
    </motion.div>
  );
}
