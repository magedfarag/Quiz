import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchQuestions, submitQuizResults } from '../api/quiz';
import { Timer, ChevronRight, Award } from 'lucide-react';
import { QuizQuestion } from '../types';
import { AdminSettings } from '../types/settings';
import { fetchSettings } from '../api/admin';

interface QuizQuestion {
  question?: string;
  text?: string;
  options: string[];
  correctAnswer: string;
}

const QuizPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentName, quiz: initialQuiz, isPreview } = location.state || {};

  // Redirect if no student name is provided and not in preview mode
  useEffect(() => {
    if (!studentName && !isPreview) {
      navigate('/', { replace: true });
    }
  }, [studentName, isPreview, navigate]);

  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuiz?.questions || []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [settings, setSettings] = useState<AdminSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const adminSettings = await fetchSettings();
        setSettings(adminSettings);
        // Initialize timer with settings time limit
        setTimer(adminSettings?.quizTimeLimit * 60 || 1800); // Convert minutes to seconds
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Set default settings if fetch fails
        setSettings({
          quizTimeLimit: 30,
          passingScore: 70,
          maxQuestions: 10,
          requireEmailVerification: false,
          allowRetakes: true,
          showResults: true,
          maxAttempts: 3,
          feedbackMode: 'afterSubmission',
          gradingScheme: 'percentage'
        });
        setTimer(1800); // Default 30 minutes in seconds
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    const loadQuizData = async (retry = false) => {
      try {
        setIsLoading(true);
        setError(null);
        if (initialQuiz) {
          console.log('Loading initial quiz questions:', initialQuiz.questions);
          setQuestions(initialQuiz.questions);
        } else {
          const questions = await fetchQuestions();
          console.log('Fetched questions:', questions);
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
    
    if (!questions.length) {
      loadQuizData();
    } else {
      console.log('Questions already loaded:', questions);
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
    if (!settings?.allowRetakes && answers[currentQuestionIndex]) {
      return; // Prevent changing answer if retakes are not allowed
    }

    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = option;
    setAnswers(newAnswers);

    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = option === currentQuestion.correctAnswer;
    
    // Update score based on correct answers
    if (isCorrect) {
      setScore(prev => {
        // If answer was already correct, don't increment score
        const previousAnswer = answers[currentQuestionIndex];
        const wasPreviouslyCorrect = previousAnswer === currentQuestion.correctAnswer;
        if (wasPreviouslyCorrect) {
          return prev;
        }
        return prev + 1;
      });
    } else {
      // If changing from correct to incorrect answer, decrement score
      const previousAnswer = answers[currentQuestionIndex];
      const wasPreviouslyCorrect = previousAnswer === currentQuestion.correctAnswer;
      if (wasPreviouslyCorrect) {
        setScore(prev => prev - 1);
      }
    }

    // Show immediate feedback if enabled
    if (settings?.feedbackMode === 'immediate') {
      // Show visual feedback
      const feedbackTimeout = setTimeout(() => {
        handleNext();
      }, 1000);
      return () => clearTimeout(feedbackTimeout);
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
          timestamp: Date.now(),
          timeRemaining: timer
        });

        // Check if passing score was achieved
        const percentage = (score / questions.length) * 100;
        const passed = percentage >= (settings?.passingScore || 70);
        const remainingAttempts = settings?.maxAttempts 
          ? settings.maxAttempts - 1 
          : null;

        navigate('/results', { 
          state: { 
            studentName,
            score, 
            totalQuestions: questions.length,
            answers,
            questions,
            isPreview,
            passed,
            settings,
            remainingAttempts,
            timeRemaining: timer
          } 
        });
      } else {
        navigate('/results', { 
          state: { 
            studentName: 'Preview Mode',
            score, 
            totalQuestions: questions.length,
            answers,
            questions,
            isPreview: true,
            passed: (score / questions.length) * 100 >= (settings?.passingScore || 70),
            settings,
            timeRemaining: timer
          } 
        });
      }
    } catch (error) {
      console.error('Failed to submit quiz results:', error);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  console.log('Current question:', currentQuestion);
  if (!currentQuestion || !currentQuestion.options) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-primary-light p-8 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No question data available</p>
          <pre className="text-sm text-gray-500 mt-2">
            {JSON.stringify({ questions, currentQuestionIndex }, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

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
        {initialQuiz && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800">{initialQuiz.title}</h1>
            {initialQuiz.description && (
              <p className="text-gray-600 mt-2">{initialQuiz.description}</p>
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

        <div className="mb-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold">Debug Info:</h3>
          <pre className="text-sm">
            {JSON.stringify({
              questionsLoaded: questions.length > 0,
              currentIndex: currentQuestionIndex,
              currentQuestion: currentQuestion,
              answers
            }, null, 2)}
          </pre>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-pop">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">
            {currentQuestion.question || currentQuestion.text}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion?.options?.map((option: string, index: number) => (
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
