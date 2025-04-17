import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Download, Mail, Home, Star, Trophy, Target, ChevronDown, Check, X, Zap, Brain, AlertCircle, RefreshCw } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateQuizReport } from '../api/reports';
import { sendQuizResults } from '../services/emailService';
import { useSoundEffects } from '../utils/sounds';
import { AdminSettings } from '../types/settings';
import { ErrorBoundary } from 'react-error-boundary';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  isActive: boolean;
  conditions: {
    quizzes_completed?: number;
    time_remaining_percent?: number;
    score_percent?: number;
    passed_quizzes?: number;
    min_average?: number;
    min_quizzes?: number;
  };
}

const getAchievementIcon = (iconName: string) => {
  switch (iconName) {
    case 'star': return Star;
    case 'zap': return Zap;
    case 'award': return Award;
    case 'brain': return Brain;
    case 'trophy': return Trophy;
    default: return Award;
  }
};

const ResultsErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ error, resetErrorBoundary }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary-light p-8 flex items-center justify-center">
      <motion.div 
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Quiz Results Error</h1>
        <p className="text-gray-600 mb-6">
          We encountered an issue while preparing your quiz results. This might be due to missing data.
        </p>
        <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
          <p className="text-sm font-mono text-red-600">{error.message}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="btn-primary flex items-center justify-center gap-2 px-6 py-3"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          <button
            onClick={() => navigate('/')}
            className="btn-secondary flex items-center justify-center gap-2 px-6 py-3"
          >
            <Home className="w-5 h-5" />
            Go Home
          </button>
        </div>
      </motion.div>
    </div>
  );
};

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { 
    results,
    studentName 
  } = (location.state || {}) as { 
    results?: any; 
    studentName?: string;
  };

  const score = results?.score ?? 0;
  const totalQuestions = results?.totalQuestions ?? 0;
  const answers = results?.answers ?? [];
  const questions = results?.quiz?.questions ?? [];
  const passed = results?.passed ?? false;
  const isPreview = results?.isPreview ?? false;
  const settings = results?.settings ?? null;
  const remainingAttempts = results?.remainingAttempts ?? null;
  const newlyEarnedAchievements = results?.earnedAchievements ?? [];

  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [showingAchievement, setShowingAchievement] = useState<number | null>(null);
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>(newlyEarnedAchievements);
  const [allAchievements, setAllAchievements] = useState<Achievement[]>([]);
  const { playClick, playSuccess, playAchievement } = useSoundEffects();
  const memoizedPlayAchievement = useCallback(playAchievement, [playAchievement]);

  useEffect(() => {
    console.log('ResultsPage received state:', location.state);
    console.log('Processed data:', { studentName, score, totalQuestions, answers, questions, passed, percentage, newlyEarnedAchievements });
  }, [location.state]);

  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  const triggerCelebration = useCallback(() => {
    playSuccess();
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    const colors = ['#FFD100', '#FF5C8D', '#4CC9F0', '#2DC653'];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
  }, [playSuccess]);

  useEffect(() => {
    const loadAllAchievements = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/achievements');
        if (!response.ok) throw new Error('Failed to fetch achievement definitions');
        const data = await response.json();
        setAllAchievements(data);
      } catch (error) {
        console.error('Error loading all achievements:', error);
      }
    };
    loadAllAchievements();
  }, []);

  useEffect(() => {
    if (earnedAchievements.length > 0) {
      triggerCelebration();
      memoizedPlayAchievement();
    }
  }, [earnedAchievements, triggerCelebration, memoizedPlayAchievement]);

  useEffect(() => {
    if (!studentName || score === undefined || !totalQuestions || !answers || !questions) {
      navigate('/', { replace: true });
      return;
    }

    if (!isPreview && settings && !settings.showResults) {
      navigate('/', { replace: true });
      return;
    }
  }, [studentName, score, totalQuestions, answers, questions, navigate, settings, isPreview]);

  const handleGenerateReport = async () => {
    if (!studentName) {
      console.error("Cannot generate report: studentName is missing.");
      return;
    }
    playClick();
    const pdfData = await generateQuizReport({
      studentName,
      timestamp: Date.now(),
      score,
      totalQuestions,
      answers: []
    });
    const link = document.createElement('a');
    link.href = pdfData;
    link.download = `quiz-results-${new Date().toISOString().split('T')[0]}.pdf`;
    link.click();
  };

  const handleAchievementClick = (achievementId: number) => {
    memoizedPlayAchievement();
    setShowingAchievement(achievementId);
  };

  const handleEmailClick = () => {
    playClick();
    setShowEmailDialog(true);
  };

  const handleSendEmail = async () => {
    if (!email) return;
    if (!studentName) {
      console.error("Cannot send email: studentName is missing.");
      return;
    }
    
    try {
      await sendQuizResults(email, {
        studentName,
        timestamp: Date.now(),
        score,
        totalQuestions,
        answers: []
      });
      setShowEmailDialog(false);
    } catch (error) {
      console.error('Failed to send email:', error);
    }
  };

  const getGrade = () => {
    const passingScore = settings?.passingScore || 70;
    
    if (percentage >= 80) return { 
      text: 'Excellent!', 
      color: 'text-accent-green', 
      icon: Trophy,
      message: 'Outstanding performance! You\'re a quiz master!' 
    };
    if (percentage >= passingScore) return { 
      text: 'Good Job!', 
      color: 'text-accent-blue', 
      icon: Star,
      message: 'Well done! Keep practicing to improve further.' 
    };
    return { 
      text: 'Keep Going!', 
      color: 'text-accent-orange', 
      icon: Target,
      message: 'Don\'t give up! Practice makes perfect.' 
    };
  };

  const canRetake = settings?.allowRetakes && 
    (!settings.maxAttempts || (remainingAttempts && remainingAttempts > 0));

  const grade = getGrade();
  const GradeIcon = grade.icon;
  
  const safeEarnedAchievements = Array.isArray(earnedAchievements) ? earnedAchievements : [];

  const renderAchievements = () => (
    <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Trophy className="text-accent-purple" />
        Achievements Unlocked
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {earnedAchievements.map((earnedAch) => {
          const achievementDetails = allAchievements.find(a => a.id === earnedAch.id) || earnedAch;
          const Icon = getAchievementIcon(achievementDetails.icon);
          return (
            <motion.div
              key={achievementDetails.id}
              className={`bg-white rounded-xl p-6 shadow-lg transform transition
                ${showingAchievement === achievementDetails.id ? 'scale-105 ring-2 ring-accent-purple' : ''}
                hover:scale-105 cursor-pointer`}
              onClick={() => handleAchievementClick(achievementDetails.id)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-full ${achievementDetails.id === showingAchievement ? 'bg-accent-purple/10' : 'bg-gray-100'}`}>
                  <Icon className={`w-6 h-6 ${achievementDetails.id === showingAchievement ? 'text-accent-purple' : 'text-gray-600'}`} />
                </div>
                <div>
                  <h3 className="font-bold text-lg">{achievementDetails.name}</h3>
                  <p className="text-gray-600">{achievementDetails.description}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
        {earnedAchievements.length === 0 && (
          <div className="col-span-2 text-center py-8 text-gray-500">
            Keep practicing to unlock achievements!
          </div>
        )}
      </div>
    </div>
  );

  const renderQuestionReview = () => {
    console.log('Rendering Question Review with:', { questions, answers });

    if (!questions || questions.length === 0) {
      return <div className="text-center text-gray-500">No questions available for review.</div>;
    }
    if (!answers || answers.length === 0) {
      return <div className="text-center text-gray-500">No answers available for review.</div>;
    }

    return (
      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ChevronDown className="text-accent-purple" />
          Question Review
        </h2>
        <div className="space-y-8">
          {questions?.map((question: any, index: number) => {
            console.log(`Reviewing Question ${index + 1}:`, { question, answer: answers[index] });

            if (!question || typeof question !== 'object') {
              console.error(`Question at index ${index} is invalid:`, question);
              return <div key={index} className="text-red-500">Error displaying question {index + 1}.</div>;
            }
            if (question.correctAnswer === undefined) {
              console.warn(`Question ${index + 1} is missing correctAnswer:`, question);
            }

            const isCorrect = answers[index] === question.correctAnswer;

            return (
              <div key={index} className="border-b pb-6 last:border-b-0">
                <div className="flex items-start gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${isCorrect ? 'bg-accent-green' : 'bg-secondary'}`}>
                    {isCorrect ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">
                      Question {index + 1}: {question.question || question.text || 'Missing question text'}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {question.options?.map((option: string, optIndex: number) => (
                        <div
                          key={optIndex}
                          className={`p-4 rounded-xl border-2 ${
                            option === question.correctAnswer
                              ? 'border-accent-green bg-green-50'
                              : option === answers[index]
                              ? 'border-secondary bg-red-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {option === question.correctAnswer && (
                              <Check className="w-5 h-5 text-accent-green" />
                            )}
                            {option === answers[index] && !isCorrect && (
                              <X className="w-5 h-5 text-secondary" />
                            )}
                            <span>{option}</span>
                          </div>
                        </div>
                      ))}
                      {!question.options && <p className="text-gray-500">No options available for this question.</p>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary-light p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-pop"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center mb-8">
            <GradeIcon className={`w-16 h-16 mx-auto mb-4 ${grade.color} animate-bounce-slow`} />
            <h1 className="text-4xl font-bold mb-2">{grade.text}</h1>
            <p className="text-2xl text-gray-600">
              You scored <span className={`font-bold ${grade.color}`}>{score}/{totalQuestions}</span>
            </p>
            <p className="mt-2 text-lg text-gray-600">{grade.message}</p>
            <div className="mt-4 relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                className={`absolute top-0 left-0 h-full ${passed ? 'bg-accent-green' : 'bg-accent-orange'}`}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1 }}
              />
            </div>
            <p className="mt-2 text-xl font-bold">{percentage}%</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={handleGenerateReport}
              className="btn-primary flex items-center justify-center gap-2 px-6 py-3"
            >
              <Download className="w-5 h-5" />
              Download Certificate
            </button>
            {!isPreview && (
              <button
                onClick={handleEmailClick}
                className="btn-primary flex items-center justify-center gap-2 px-6 py-3 bg-accent-green hover:bg-green-600"
              >
                <Mail className="w-5 h-5" />
                Email Results
              </button>
            )}
          </div>
        </motion.div>

        {renderAchievements()}

        {renderQuestionReview()}

        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="btn-secondary inline-flex items-center gap-2 px-6 py-3"
          >
            <Home className="w-5 h-5" />
            Back to Home
          </Link>
          {canRetake && !isPreview && (
            <button
              onClick={() => {
                if (studentName) {
                  navigate('/quiz', { state: { studentName } });
                } else {
                  console.error("Cannot retake quiz: studentName is missing.");
                  navigate('/'); 
                }
              }}
              className="btn-secondary inline-flex items-center gap-2 px-6 py-3"
            >
              Try Again
              <Award className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const ResultsPageWithErrorBoundary: React.FC = () => {
  return (
    <ErrorBoundary 
      FallbackComponent={ResultsErrorFallback} 
      onReset={() => {
      }}
    >
      <ResultsPage />
    </ErrorBoundary>
  );
};

export default ResultsPageWithErrorBoundary;
