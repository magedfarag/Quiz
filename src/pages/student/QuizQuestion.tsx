import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Flag, ChevronLeft, ChevronRight } from 'lucide-react';

export default function QuizQuestion() {
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);

  return (
    <motion.div className="max-w-3xl mx-auto py-8">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center space-x-4">
          <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-full">
            Question 1/10
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="w-4 h-4 mr-2" />
            <span>25:30</span>
          </div>
        </div>
        <button className="btn-secondary">
          <Flag className="w-4 h-4 mr-2" />
          Flag Question
        </button>
      </header>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">
          What is the output of console.log(typeof typeof 1)?
        </h2>

        <div className="space-y-3">
          {['number', 'string', 'undefined', 'object'].map((answer, index) => (
            <motion.button
              key={index}
              className={`w-full p-4 text-left rounded-lg border-2 transition-all ${
                selectedAnswer === index 
                  ? 'border-primary-600 bg-primary-50' 
                  : 'border-gray-200 hover:border-primary-200'
              }`}
              onClick={() => setSelectedAnswer(index)}
              whileHover={{ scale: 1.01 }}
            >
              <span className="font-medium">{answer}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <button className="btn-secondary">
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </button>
        <div className="flex space-x-2">
          {/* Question navigation dots */}
        </div>
        <button className="btn-primary">
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </motion.div>
  );
}
