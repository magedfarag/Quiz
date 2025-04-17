import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminApi } from '../api/admin';
import type { QuizQuestion } from '../types/quiz';
import { LoadingSpinner } from './LoadingSpinner';
import ErrorBoundary from './ErrorBoundary';
import { motion } from 'framer-motion';

const QuizEngine: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { studentName, quiz } = location.state || {}; // Updated to expect quiz object instead of quizId

  const [quizData, setQuizData] = useState(null); // Renamed from 'quiz' to 'quizData'
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(quiz?.timeLimit * 60 || 0); // Initialize timer with quiz time limit
  const [showFeedback, setShowFeedback] = useState(false); // State for immediate feedback
  const [isPassed, setIsPassed] = useState(false); // State to track if passing score is achieved

  useEffect(() => {
    if (!studentName || !quiz) {
      setError('Missing student name or quiz data. Please try again.');
      return;
    }

    const fetchQuizData = async () => {
      try {
        setIsLoading(true);
        console.log('Using provided quiz data:', quiz);

        if (!quiz.questions || quiz.questions.length === 0) {
          throw new Error('Quiz data is incomplete or has no questions.');
        }

        const questionData = await Promise.all(
          quiz.questions.map(async (question) => {
            if (typeof question === 'string') {
              const fetchedQuestion = await adminApi.getQuestion(question);
              console.log('Fetched question data:', fetchedQuestion);
              return fetchedQuestion;
            }
            return question;
          })
        );

        setQuizData(quiz);
        setQuestions(questionData);
        setAnswers(new Array(questionData.length).fill(''));
      } catch (err) {
        setError('Failed to process quiz data. Please try again later.');
        console.error('Error processing quiz data:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchQuizData();
  }, [studentName, quiz]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      console.log('Time is up!');
    }
  }, [timer]);

  const handleAnswerSelect = useCallback(
    (answer: string) => {
      if (!quiz?.allowRetakes && answers[currentQuestionIndex]) {
        return; // Prevent changing answer if retakes are not allowed
      }
      const updatedAnswers = [...answers];
      updatedAnswers[currentQuestionIndex] = answer;
      setAnswers(updatedAnswers);

      if (quiz?.showImmediateFeedback) {
        setShowFeedback(true);
        setTimeout(() => setShowFeedback(false), 2000); // Hide feedback after 2 seconds
      }
    },
    [answers, currentQuestionIndex, quiz]
  );

  const calculateScore = () => {
    const correctAnswers = questions.filter((q, i) => q.correctAnswer === answers[i]).length;
    const score = (correctAnswers / questions.length) * 100;
    setIsPassed(score >= quiz?.passingScore);
    return score;
  };

  const handleNext = useCallback(() => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      const finalScore = calculateScore();
      console.log('Final Score:', finalScore);
      navigate('/results', {
        state: { studentName, quizId: quiz.id, answers, finalScore, isPassed },
      });
    }
  }, [currentQuestionIndex, questions.length, navigate, studentName, quiz, answers]);

  const handlePrevious = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  }, [currentQuestionIndex]);

  if (isLoading) {
    return <LoadingSpinner message="Loading quiz..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={() => navigate('/quiz-selection')}>Go Back</button>
      </div>
    );
  }

  if (!questions.length || !questions[currentQuestionIndex]) {
    return <p>No questions available for this quiz.</p>;
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-background to-primary-light p-8">
        <div className="max-w-4xl mx-auto bg-white/80 rounded-3xl shadow-xl p-8 relative">
          <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden mb-6">
            <motion.div
              className="absolute top-0 left-0 h-full bg-accent-purple"
              initial={{ width: 0 }}
              animate={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
              transition={{ duration: 0.5 }}
            ></motion.div>
          </div>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-4xl font-extrabold text-primary-dark">{quizData?.title || 'Quiz'}</h1>
            <div className="text-lg font-medium text-gray-700">Time Left: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</div>
          </div>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-800">{`Question ${currentQuestionIndex + 1} of ${questions.length}`}</h2>
            <p className="text-lg text-gray-600 mt-4">{currentQuestion?.text || 'No question text available'}</p>
          </div>
          <div className="grid grid-cols-1 gap-4 mb-8">
            {currentQuestion?.options?.map((option: string, index: number) => (
              <motion.button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full p-4 border rounded-xl text-left transition-all ${
                  answers[currentQuestionIndex] === option
                    ? 'bg-accent-purple/10 border-accent-purple text-accent-purple'
                    : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                }`}
                whileHover={{ scale: 1.05 }}
              >
                {option}
              </motion.button>
            ))}
          </div>
          {showFeedback && (
            <motion.div
              className={`p-4 rounded-lg text-center mb-6 ${{
                true: 'bg-green-100 text-green-700',
                false: 'bg-red-100 text-red-700',
              }[answers[currentQuestionIndex] === currentQuestion?.correctAnswer]}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {answers[currentQuestionIndex] === currentQuestion?.correctAnswer
                ? 'Correct! 🎉'
                : 'Incorrect. Try again!'}
            </motion.div>
          )}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`px-6 py-3 rounded-lg border text-gray-700 transition-all ${
                currentQuestionIndex === 0
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-gray-200'
              }`}
            >
              Previous
            </button>
            <button
              onClick={handleNext}
              disabled={!answers[currentQuestionIndex]}
              className={`px-6 py-3 rounded-lg text-white font-bold transition-all ${
                answers[currentQuestionIndex]
                  ? 'bg-accent-purple hover:bg-accent-purple-dark'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              {currentQuestionIndex === questions.length - 1 ? 'Submit' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default QuizEngine;