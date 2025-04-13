import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Book, Star, Trophy, Timer, Brain, AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import type { Quiz } from '../../types/quiz';

const QuizSelection: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentName } = location.state || {};
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Redirect if no student name is provided
    if (!studentName) {
      navigate('/', { replace: true });
      return;
    }

    const loadQuizzes = async () => {
      try {
        const data = await adminApi.getQuizzes();
        setQuizzes(data.filter(quiz => quiz.isPublished));
      } catch (error) {
        setError('Failed to load quizzes');
        console.error('Error loading quizzes:', error);
      } finally {
        setLoading(false);
      }
    };
    loadQuizzes();
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

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const difficultyColors = {
    easy: 'bg-green-100 text-green-700',
    medium: 'bg-yellow-100 text-yellow-700',
    hard: 'bg-red-100 text-red-700'
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-primary-50 to-primary-100 py-8 px-4"
    >
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-12">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="inline-block p-6 bg-white rounded-full shadow-lg mb-6"
          >
            <Brain className="w-12 h-12 text-primary-600" />
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold text-primary-800 mb-3"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            Welcome {studentName}! 🌟
          </motion.h1>
          <motion.p 
            className="text-xl font-semibold text-gray-800"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Choose your learning adventure!
          </motion.p>
        </header>

        <div className="mb-8">
          <div className="max-w-md mx-auto">
            <input
              type="text"
              placeholder="Search quizzes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-4 rounded-xl border-2 border-primary-100 focus:border-primary-300 focus:ring-2 focus:ring-primary-200 transition-all text-lg"
            />
          </div>
        </div>

        {filteredQuizzes.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Book className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-xl text-gray-600">
              {searchQuery ? "No quizzes match your search" : "No quizzes available yet"}
            </p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {filteredQuizzes.map((quiz) => (
              <motion.div
                key={quiz.id}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all"
                onClick={() => navigate('/quiz', { 
                  state: { 
                    studentName, 
                    quizId: quiz.id,
                    quiz: quiz
                  } 
                })}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-2">
                      {quiz.title}
                    </h2>
                    <Trophy className="w-6 h-6 text-yellow-500" />
                  </div>
                  {quiz.description && (
                    <p className="text-gray-600 mb-4">{quiz.description}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      <Timer className="w-4 h-4" />
                      {quiz.timeLimit} min
                    </div>
                    <div className="flex items-center gap-1 px-3 py-1 bg-purple-50 text-purple-700 rounded-full text-sm">
                      <Book className="w-4 h-4" />
                      {quiz.questions.length} questions
                    </div>
                    {quiz.questions.some(q => q.difficulty) && (
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm ${
                        difficultyColors[quiz.questions[0].difficulty || 'medium']
                      }`}>
                        <Star className="w-4 h-4" />
                        {quiz.questions[0].difficulty || 'medium'}
                      </div>
                    )}
                  </div>
                </div>
                <div className="px-6 py-4 bg-primary-50 border-t border-primary-100">
                  <div className="flex items-center justify-between">
                    <div className="text-primary-600">
                      Pass Score: {quiz.passingScore}%
                    </div>
                    <button className="text-primary-600 font-medium hover:text-primary-700">
                      Start Quiz →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default QuizSelection;