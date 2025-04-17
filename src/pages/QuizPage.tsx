import React, { useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import QuizEngine, { QuizQuestionProps, QuizResults, QuizProgressProps } from '../components/QuizEngine';
import ErrorBoundary from '../components/ErrorBoundary';
import { formatTime } from '../utils/formatters';

const QuizPage: React.FC = () => {
  const { quizId = '' } = useParams();
  const navigate = useNavigate();
  const location = useLocation<{ studentName?: string }>();
  const initialName = location.state?.studentName || '';
  const [studentName, setStudentName] = useState(initialName);
  const [isStarted, setIsStarted] = useState(!!initialName);

  const handleQuizComplete = (results: QuizResults) => {
    // Navigate to results page with the quiz results
    navigate('/results', { 
      state: { 
        results,
        quizId 
      }
    });
  };

  const renderQuestion = ({
    question,
    currentIndex,
    totalQuestions,
    selectedAnswer,
    onAnswerSelect,
    onNext,
    onPrevious,
    timeRemaining
  }: QuizQuestionProps) => (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-3xl w-full mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-primary-800">
          Question {currentIndex + 1} of {totalQuestions}
        </h2>
        <div className="text-lg font-medium">
          Time: <span className="text-primary-800">{formatTime(timeRemaining)}</span>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-medium text-gray-800 mb-4">{question.questionText}</h3>
        
        <div className="space-y-3">
          {question.options.map((option, idx) => (
            <div 
              key={idx}
              onClick={() => onAnswerSelect(option)}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                selectedAnswer === option 
                  ? 'border-primary-500 bg-primary-50' 
                  : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50/30'
              }`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 flex items-center justify-center rounded-full mr-3 ${
                  selectedAnswer === option 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 text-gray-700'
                }`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <span className="text-gray-800">{option}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className={`px-6 py-2 rounded-md border border-gray-300 text-gray-700 ${
            currentIndex === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
          }`}
          disabled={currentIndex === 0}
        >
          Previous
        </button>
        
        <button
          onClick={onNext}
          className={`px-6 py-2 rounded-md bg-primary-600 text-white ${
            !selectedAnswer ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700'
          }`}
          disabled={!selectedAnswer}
        >
          {currentIndex === totalQuestions - 1 ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  );

  const renderProgress = ({ 
    currentIndex, 
    totalQuestions, 
    timeRemaining 
  }: QuizProgressProps) => (
    <div className="bg-white/80 backdrop-blur-sm w-full py-4 px-6 mb-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <span className="font-medium">Progress:</span>
          <div className="w-64 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 rounded-full"
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            ></div>
          </div>
          <span className="text-sm text-gray-600">
            {currentIndex + 1}/{totalQuestions}
          </span>
        </div>
        
        <div className="text-base font-medium text-gray-800">
          Time Remaining: <span className="text-primary-700">{formatTime(timeRemaining)}</span>
        </div>
      </div>
    </div>
  );

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-primary-light p-8 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full">
          <h2 className="text-2xl font-bold text-primary-800 mb-6">Quiz Information</h2>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Enter your name</label>
            <input
              type="text"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Full Name"
            />
          </div>
          
          <button
            onClick={() => setIsStarted(true)}
            className={`w-full py-3 rounded-md bg-primary-600 text-white font-medium ${
              !studentName.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-700'
            }`}
            disabled={!studentName.trim()}
          >
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-b from-background to-primary-light p-8">
        <div className="container mx-auto">
          <QuizEngine
            studentName={studentName}
            quizId={quizId}
            onComplete={handleQuizComplete}
            renderQuestion={renderQuestion}
            renderProgress={renderProgress}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default QuizPage;
