import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Book, Award, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchSettings } from '../api/admin';
import type { AdminSettings } from '../types/settings';

const QuizOverview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentName, quizId } = location.state || {};
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if no student name is provided
    if (!studentName) {
      navigate('/', { replace: true });
      return;
    }

    const loadSettings = async () => {
      try {
        const adminSettings = await fetchSettings();
        setSettings(adminSettings);
      } catch (error) {
        setError('Failed to load quiz settings');
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [studentName, navigate]);

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center h-64"
      >
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl mx-auto py-8"
      >
        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      </motion.div>
    );
  }

  if (!settings) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-2xl mx-auto py-8"
    >
      <header className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Quiz Overview</h1>
        <p className="text-gray-600 mt-2">Make sure you're ready before starting</p>
      </header>

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Clock className="w-5 h-5 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Time Limit</p>
              <p className="font-semibold">{settings.quizTimeLimit} minutes</p>
            </div>
          </div>
          
          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Award className="w-5 h-5 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Passing Score</p>
              <p className="font-semibold">{settings.passingScore}%</p>
            </div>
          </div>

          <div className="flex items-center p-4 bg-gray-50 rounded-lg">
            <Book className="w-5 h-5 text-primary-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Questions</p>
              <p className="font-semibold">Up to {settings.maxQuestions}</p>
            </div>
          </div>

          {settings.maxAttempts && (
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <Award className="w-5 h-5 text-primary-600 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Maximum Attempts</p>
                <p className="font-semibold">{settings.maxAttempts}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4 mb-6">
          {settings.allowRetakes && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>You can retake this quiz if needed</span>
            </div>
          )}
          {settings.showResults && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Results will be shown after completion</span>
            </div>
          )}
          {settings.feedbackMode === 'immediate' && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Immediate feedback after each answer</span>
            </div>
          )}
        </div>

        <button 
          className="w-full btn-primary py-3 text-lg font-semibold"
          onClick={() => navigate('/quiz', { state: { studentName, quizId } })}
        >
          Start Quiz
        </button>
      </div>

      {settings.requireEmailVerification && (
        <div className="bg-yellow-50 text-yellow-700 p-4 rounded-lg">
          <p className="text-sm">
            Note: Email verification is required to save your results.
          </p>
        </div>
      )}
    </motion.div>
  );
};

export default QuizOverview;