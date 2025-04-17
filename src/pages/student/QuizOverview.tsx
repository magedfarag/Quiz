import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Book, Award, AlertCircle, Rocket, Star, Brain } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchSettings } from '../../api/admin';
import { adminApi } from '../../api/admin';
import type { AdminSettings } from '../../types/settings';
import type { Quiz } from '../../types/quiz';

const QuizOverview: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentName, quizId } = location.state || {};
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Redirect if no student name or quizId is provided
    if (!studentName || !quizId) {
      navigate('/', { replace: true });
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch settings and quiz data in parallel for better performance
        const [adminSettings, quizData] = await Promise.all([
          fetchSettings(),
          adminApi.getQuiz(quizId)
        ]);
        
        setSettings(adminSettings);
        setQuiz(quizData);
        console.log('Loaded quiz data from server:', quizData);
      } catch (error) {
        console.error('Error loading quiz data:', error);
        setError('Failed to load quiz data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, [studentName, quizId, navigate]);

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

  if (!settings || !quiz) return null;

  const heroIcons = [
    { icon: Brain, color: 'text-purple-500', delay: 0 },
    { icon: Star, color: 'text-yellow-500', delay: 0.1 },
    { icon: Rocket, color: 'text-blue-500', delay: 0.2 }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100 py-8 px-4"
    >
      <div className="max-w-2xl mx-auto">
        {/* Animated Hero Section */}
        <header className="text-center mb-12">
          <div className="flex justify-center gap-6 mb-6">
            {heroIcons.map(({ icon: Icon, color, delay }) => (
              <motion.div
                key={color}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay,
                  type: "spring",
                  stiffness: 260,
                  damping: 20 
                }}
                className={`p-4 bg-white rounded-full shadow-lg ${color}`}
              >
                <Icon className="w-8 h-8" />
              </motion.div>
            ))}
          </div>
          <motion.h1 
            className="text-4xl font-bold text-primary-800 mb-3"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
          >
            {quiz.title}
          </motion.h1>
          <motion.p 
            className="text-xl text-primary-600"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Hi {studentName}! Let's see what you can do! 🌟
          </motion.p>
          {quiz.description && (
            <motion.p
              className="mt-4 text-lg text-gray-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {quiz.description}
            </motion.p>
          )}
        </header>

        {/* Quiz Info Card */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl p-8 mb-8 relative overflow-hidden"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {/* Background Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
            <Brain className="w-full h-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <motion.div 
              className="p-6 bg-blue-50 rounded-xl border-2 border-blue-100 hover:border-blue-300 transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-blue-600">Time Limit</p>
                  <p className="text-2xl font-bold text-blue-800">{quiz.timeLimit || settings.quizTimeLimit} min</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="p-6 bg-purple-50 rounded-xl border-2 border-purple-100 hover:border-purple-300 transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Award className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-600">To Pass</p>
                  <p className="text-2xl font-bold text-purple-800">{quiz.passingScore || settings.passingScore}%</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="p-6 bg-green-50 rounded-xl border-2 border-green-100 hover:border-green-300 transition-colors"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full">
                  <Book className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-green-600">Questions</p>
                  <p className="text-2xl font-bold text-green-800">{quiz.questions.length}</p>
                </div>
              </div>
            </motion.div>

            {settings.maxAttempts && (
              <motion.div 
                className="p-6 bg-yellow-50 rounded-xl border-2 border-yellow-100 hover:border-yellow-300 transition-colors"
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Star className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-yellow-600">Attempts</p>
                    <p className="text-2xl font-bold text-yellow-800">{settings.maxAttempts}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Special Features */}
          <div className="space-y-4 mb-8">
            {settings.allowRetakes && (
              <motion.div 
                className="flex items-center gap-3 text-green-600"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-lg">You can try again if needed! 🎯</span>
              </motion.div>
            )}
            {settings.showResults && (
              <motion.div 
                className="flex items-center gap-3 text-blue-600"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse"></div>
                <span className="text-lg">See how well you did right away! 🌟</span>
              </motion.div>
            )}
          </div>

          {/* Start Button */}
          <motion.button 
            className="w-full py-4 px-8 bg-gradient-to-r from-accent-blue to-accent-purple text-white text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transform transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
            onClick={() => navigate('/quiz', { state: { studentName, quizId }})}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Rocket className="w-6 h-6" />
            Let's Begin Your Adventure!
          </motion.button>
        </motion.div>

        {settings.requireEmailVerification && (
          <motion.div 
            className="bg-yellow-50 border-2 border-yellow-100 text-yellow-700 p-6 rounded-xl text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-lg">
              📧 Don't forget to verify your email to save your amazing results!
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default QuizOverview;
