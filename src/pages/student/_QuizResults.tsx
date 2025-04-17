import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import type { Quiz } from '../../types/quiz';
import ResultsEngine from '../../components/ResultsEngine';

export default function QuizResults() {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentName, quizId, results: initialResults } = location.state || {};
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Redirect if no student name or quizId is provided
    if (!studentName || !quizId) {
      navigate('/', { replace: true });
      return;
    }

    const loadQuizData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch quiz data from the server
        const quizData = await adminApi.getQuiz(quizId);
        
        setQuiz(quizData);
        console.log('Loaded quiz data from server:', quizData);
      } catch (error) {
        console.error('Error loading quiz data:', error);
        setError('Failed to load quiz data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadQuizData();
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

  if (!quiz) return null;

  // Prepare the quiz results to pass to ResultsEngine
  const quizResults = initialResults || {
    studentName,
    quizId,
    quiz,
    score: 85, // This would normally come from the actual results
    totalQuestions: quiz.questions.length,
    passed: 85 >= (quiz.passingScore || 70),
    timeSpent: "12:45", // This would normally be calculated based on actual quiz time
  };

  // Define a custom render function for the ResultsEngine
  const renderStudentResults = (resultProps) => {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto py-8 px-4"
      >
        {/* Use the ResultsEngine's renderContent function for consistent UI */}
        {resultProps.renderContent()}
        
        <div className="space-y-4 mt-8">
          <motion.button
            className="w-full btn-primary py-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            onClick={() => navigate('/quiz-overview', { 
              state: { studentName, quizId } 
            })}
          >
            {resultProps.renderReviewButton()}
          </motion.button>
          
          <motion.button 
            className="w-full btn-secondary py-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            onClick={() => navigate('/quiz-overview', { 
              state: { studentName, quizId } 
            })}
          >
            {resultProps.renderRetryButton()}
          </motion.button>
        </div>
      </motion.div>
    );
  };

  return (
    <ResultsEngine
      results={quizResults}
      showConfetti={true}
      allowSharing={false}
      showAchievements={false}
      renderResults={renderStudentResults}
      onRetry={() => navigate('/quiz-overview', { state: { studentName, quizId } })}
      onReview={() => navigate('/quiz-overview', { state: { studentName, quizId } })}
    />
  );
}
