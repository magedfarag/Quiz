import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import type { Quiz } from '../../types/quiz';
import QuizEngine from '../../components/QuizEngine';

export default function QuizQuestion() {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentName, quizId } = location.state || {};
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

  if (!quiz || quiz.questions.length === 0) return null;

  // Use the shared QuizEngine component
  return (
    <QuizEngine 
      quiz={quiz}
      studentName={studentName}
      onQuizComplete={(results) => {
        navigate('/quiz-results', { 
          state: { 
            studentName, 
            quizId,
            results
          } 
        });
      }}
      renderQuestion={({ 
        currentQuestion, 
        currentQuestionIndex, 
        totalQuestions, 
        selectedAnswer, 
        setSelectedAnswer, 
        handlePrevious, 
        handleNext,
        timeRemaining
      }) => (
        <motion.div className="max-w-3xl mx-auto py-8">
          <header className="flex justify-between items-center mb-8">
            <div className="flex items-center space-x-4">
              <div className="bg-primary-50 text-primary-700 px-4 py-2 rounded-full">
                Question {currentQuestionIndex + 1}/{totalQuestions}
              </div>
              {timeRemaining !== undefined && (
                <div className="flex items-center text-gray-600">
                  <span>{Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}</span>
                </div>
              )}
            </div>
          </header>

          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6">
              {currentQuestion.text}
            </h2>

            <div className="space-y-3">
              {currentQuestion.options.map((answer, index) => (
                <button
                  key={index}
                  className={`w-full text-left p-4 rounded-lg border transition-all ${
                    selectedAnswer === index
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-primary-200 hover:bg-primary-50/30'
                  }`}
                  onClick={() => setSelectedAnswer(index)}
                >
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                      selectedAnswer === index
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : 'border-gray-300'
                    }`}>
                      {selectedAnswer === index && (
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                          <path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span>{answer}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              className="btn-secondary flex items-center"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="none" d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Previous
            </button>

            <button
              className="btn-primary flex items-center"
              onClick={handleNext}
            >
              {currentQuestionIndex < totalQuestions - 1 ? (
                <>
                  Next
                  <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24">
                    <path fill="none" d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </>
              ) : (
                'Finish Quiz'
              )}
            </button>
          </div>
        </motion.div>
      )}
    />
  );
}
