import { motion } from 'framer-motion';
import { Clock, Book, Award, AlertCircle } from 'lucide-react';

export default function QuizOverview() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto py-8"
    >
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">JavaScript Basics Quiz</h1>
        <p className="text-gray-600 mt-2">Get ready to test your knowledge</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Time Limit</p>
              <p className="font-semibold">30 minutes</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Award className="w-5 h-5 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Passing Score</p>
              <p className="font-semibold">70%</p>
            </div>
          </div>
        </div>

        <button 
          className="w-full btn-primary py-3 text-lg font-semibold"
          onClick={() => {/* Start quiz */}}
        >
          Start Quiz
        </button>
      </div>
    </motion.div>
  );
}
