import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { fetchQuestions, submitQuizResults } from '../api/quiz';
import { Timer, ChevronRight, Award } from 'lucide-react';
import { QuizQuestion } from '../types';

const QuizPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { studentName, questions: initialQuestions } = location.state || {};

  // Redirect if no student name is provided
  useEffect(() => {
    if (!studentName) {
      navigate('/', { replace: true });
    }
  }, [studentName, navigate]);

  const [questions, setQuestions] = useState<QuizQuestion[]>(initialQuestions || []);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (!questions.length) {
      fetchQuestions()
        .then((fetchedQuestions) => {
          setQuestions(fetchedQuestions);
          setAnswers(new Array(fetchedQuestions.length).fill(''));
        })
        .catch(console.error);
    } else {
      setAnswers(new Array(questions.length).fill(''));
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
      await submitQuizResults({
        studentName,
        score,
        totalQuestions: questions.length,
        answers,
        timestamp: Date.now()
      });
      navigate('/results', { 
        state: { 
          studentName,
          score, 
          totalQuestions: questions.length,
          answers,
          questions
        } 
      });
    } catch (error) {
      console.error('Failed to submit quiz results:', error);
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary-light p-8">
      <div className="max-w-4xl mx-auto">
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
