import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchQuiz, fetchQuestions, submitQuizResults } from '../api/quiz';
import { Timer, ChevronRight, Award } from 'lucide-react';
import { QuizQuestion, Quiz } from '../types';

const QuizPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentName, quizId, isPreview } = location.state || {};
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  // Redirect if no student name is provided and not in preview mode
  useEffect(() => {
    if (!studentName && !isPreview) {
      navigate('/', { replace: true });
    }
  }, [studentName, isPreview, navigate]);

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const loadQuizData = async (retry = false) => {
    try {
      setIsLoading(true);
      setError(null);
      if (quizId) {
        const [quizData, questions] = await Promise.all([
          fetchQuiz(quizId),
          fetchQuestions(quizId)
        ]);
        setQuiz(quizData);
        setQuestions(questions);
      } else {
        const questions = await fetchQuestions();
        setQuestions(questions);
      }
      setAnswers(new Array(questions.length).fill(''));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load questions';
      setError(message);
      console.error('Error fetching questions:', err);
      if (retry && retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          loadQuizData(true);
        }, 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!questions.length) {
      loadQuizData();
    } else {
      setAnswers(new Array(questions.length).fill(''));
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          handleNext();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdown);
  }, [currentQuestionIndex]);

  const handleAnswerSelection = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = option;
    setAnswers(newAnswers);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    
    if (isCorrect) {
      setScore(prev => prev + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setTimer(30);
    } else {
      handleQuizComplete();
    }
  };

  const handleQuizComplete = async () => {
    // Ensure all questions are answered
    if (answers.some(answer => !answer)) {
      alert('Please answer all questions before completing the quiz.');
      return;
    }

    try {
      if (!isPreview) {
        await submitQuizResults({
          studentName,
          score,
          totalQuestions: questions.length,
          answers,
          timestamp: Date.now()
        });
      }
      navigate('/results', { 
        state: { 
          studentName: isPreview ? 'Preview Mode' : studentName,
          score, 
          totalQuestions: questions.length,
          answers,
          questions,
          isPreview
        } 
      });
    } catch (error) {
      console.error('Failed to submit quiz results:', error);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-primary-light p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz questions...</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">Retry attempt {retryCount}/3...</p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-primary-light p-8 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Quiz</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setRetryCount(0);
              loadQuizData(true);
            }}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary-light p-8">
      <div className="max-w-4xl mx-auto">
        {isPreview && (
          <div className="mb-8 p-4 bg-yellow-50 text-yellow-700 rounded-lg flex items-center justify-between">
            <span>Preview Mode - Responses won't be saved</span>
            <button 
              onClick={() => navigate('/admin/quiz-management')}
              className="px-4 py-2 bg-yellow-100 rounded-lg hover:bg-yellow-200"
            >
              Exit Preview
            </button>
          </div>
        )}
        {quiz && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">{quiz.title}</h1>
            {quiz.description && (
              <p className="text-gray-600 mt-2">{quiz.description}</p>
            )}
          </div>
        )}
        {/* Progress and Score */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <div className="bg-white rounded-xl shadow-lg p-4">
              <p className="text-sm text-gray-600">Question</p>
              <p className="text-2xl font-bold text-primary-dark">
                {currentQuestionIndex + 1}/{questions.length}
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-4">
              <p className="text-sm text-gray-600">Score</p>
              <p className="text-2xl font-bold text-accent-green">{score}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-4 flex items-center gap-2">
            <Timer className="text-accent-orange" />
            <span className="text-2xl font-bold">{timer}s</span>
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-pop">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {currentQuestion.question}
          </h2>

          <div className="grid grid-cols-2 gap-4">
            {currentQuestion.options?.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => handleAnswerSelection(option)}
                className={`p-4 text-lg font-medium rounded-xl transition transform hover:scale-105
                  ${answers[currentQuestionIndex] === option
                    ? 'bg-accent-blue text-white'
                    : 'bg-gray-100 hover:bg-primary-light text-gray-700'
                  }
                  ${answers[currentQuestionIndex] === option ? 'animate-pop' : ''}
                `}
                disabled={!!answers[currentQuestionIndex]}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-end">
          <button
            onClick={handleNext}
            disabled={!answers[currentQuestionIndex]}
            className={`flex items-center gap-2 px-6 py-3 text-white rounded-xl shadow-lg
              ${currentQuestionIndex === questions.length - 1 ? 'bg-accent-green hover:bg-green-600' : 'bg-accent-blue hover:bg-blue-600'}
              disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {currentQuestionIndex === questions.length - 1 ? (
              <>
                Finish Quiz
                <Award />
              </>
            ) : (
              <>
                Next
                <ChevronRight />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizPage;
