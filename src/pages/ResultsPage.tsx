import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Award, Download, Mail, Home, Star, Trophy, Target, ChevronDown, Check, X, Zap, Brain } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateQuizReport } from '../api/reports';
import { sendQuizResults } from '../services/emailService';
import { useSoundEffects } from '../utils/sounds';
import { AdminSettings } from '../types/settings';

interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  conditions: {
    quizzes_completed?: number;
    time_remaining_percent?: number;
    score_percent?: number;
    passed_quizzes?: number;
    min_average?: number;
    min_quizzes?: number;
  };
}

interface LocationState {
  studentName: string;
  score: number;
  totalQuestions: number;
  answers: string[];
  questions: any[];
  isPreview: boolean;
  passed: boolean;
  settings: AdminSettings | null;
  remainingAttempts: number | null;
  timeRemaining: number | null; // Added timeRemaining
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

const ResultsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    studentName = '', 
    score = 0, 
    totalQuestions = 0, 
    answers = [], 
    questions = [], 
    isPreview = false,
    passed = false,
    settings = null,
    remainingAttempts = null,
    timeRemaining = null // Added timeRemaining
  } = (location.state as LocationState) || {};

  // Calculate percentage early to avoid reference error
  const percentage = Math.round((score / totalQuestions) * 100) || 0;

  useEffect(() => {
    // Redirect if quiz data is missing or if showResults is disabled
    if (!studentName || score === undefined || !totalQuestions || !answers || !questions) {
      navigate('/', { replace: true });
      return;
    }

    if (!isPreview && settings && !settings.showResults) {
      navigate('/', { replace: true });
      return;
    }
  }, [studentName, score, totalQuestions, answers, questions, navigate, settings, isPreview]);

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [earnedAchievements, setEarnedAchievements] = useState<Achievement[]>([]);
  
  useEffect(() => {
    if (!isPreview) {
      fetch('http://localhost:3001/api/achievements')
        .then(res => res.json())
        .then(data => setAchievements(data))
        .catch(console.error);
    }
  }, [isPreview]);

  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [email, setEmail] = useState('');
  const [showingAchievement, setShowingAchievement] = useState<number | null>(null);
  const { playSuccess, playAchievement, playClick } = useSoundEffects();

  const memoizedPlayAchievement = useCallback(playAchievement, [playAchievement]);

  useEffect(() => {
    if (!isPreview) {
      // Check which achievements were earned
      const checkAchievements = async () => {
        try {
          const response = await fetch('http://localhost:3001/api/achievements');
          const allAchievements = await response.json();
          
          const earned = allAchievements.filter((achievement: Achievement) => {
            const conditions = achievement.conditions;
            
            if (conditions.score_percent && percentage >= conditions.score_percent) {
              return true;
            }
            
            if (conditions.time_remaining_percent && timeRemaining) {
              const totalTime = settings?.quizTimeLimit || 30;
              const remainingPercent = (timeRemaining / (totalTime * 60)) * 100;
              if (remainingPercent >= conditions.time_remaining_percent) {
                return true;
              }
            }
            
            // Other conditions will be checked against user profile data
            return false;
          });
          
          setEarnedAchievements(earned);
          if (earned.length > 0) {
            memoizedPlayAchievement();
          }
        } catch (error) {
          console.error('Error fetching achievements:', error);
        }
      };
      
      checkAchievements();
    }
  }, [isPreview, percentage, timeRemaining, settings, memoizedPlayAchievement]);

  useEffect(() => {
    // Trigger celebration animation and sound on load
    const triggerCelebration = () => {
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
    };

    triggerCelebration();
  }, [playSuccess]);

  const handleGenerateReport = async () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary-light p-8">
      <div className="max-w-4xl mx-auto">
        {/* Preview Mode Banner */}
        {isPreview && (
          <div className="mb-8 p-4 bg-yellow-50 text-yellow-700 rounded-lg flex items-center justify-between">
            <span>Preview Mode - These results are not saved</span>
            <button 
              onClick={() => navigate('/admin/quiz-management')}
              className="px-4 py-2 bg-yellow-100 rounded-lg hover:bg-yellow-200"
            >
              Back to Quiz Management
            </button>
          </div>
        )}

        {/* Main Result Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 animate-pop">
          <div className="text-center mb-8">
            <GradeIcon className={`w-16 h-16 mx-auto mb-4 ${grade.color} animate-bounce-slow`} />
            <h1 className="text-4xl font-bold mb-2">{grade.text}</h1>
            <p className="text-2xl text-gray-600">
              You scored <span className={`font-bold ${grade.color}`}>{score}/{totalQuestions}</span>
            </p>
            <p className="mt-2 text-lg text-gray-600">{grade.message}</p>
            <div className="mt-4 relative h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`absolute top-0 left-0 h-full transition-all duration-1000 ${
                  passed ? 'bg-accent-green' : 'bg-accent-orange'
                }`}
                style={{ width: `${percentage}%` }}
              />
            </div>
            <p className="mt-2 text-xl font-bold">{percentage}%</p>
            {!passed && settings?.maxAttempts && remainingAttempts !== null && (
              <p className="mt-2 text-sm text-gray-600">
                Attempts remaining: {remainingAttempts}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button
              onClick={handleGenerateReport}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-accent-blue text-white rounded-xl
                hover:bg-blue-600 transition transform hover:scale-105"
            >
              <Download className="w-5 h-5" />
              Download Certificate
            </button>
            {!isPreview && (
              <button
                onClick={handleEmailClick}
                className="flex items-center justify-center gap-2 px-6 py-3 bg-accent-green text-white rounded-xl
                  hover:bg-green-600 transition transform hover:scale-105"
              >
                <Mail className="w-5 h-5" />
                Email Results
              </button>
            )}
          </div>

          {/* Achievements */}
          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Award className="text-accent-purple" />
              Achievements Unlocked
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {earnedAchievements.map((achievement) => {
                const Icon = getAchievementIcon(achievement.icon);
                return (
                  <motion.div
                    key={achievement.id}
                    className={`bg-white rounded-xl p-6 shadow-lg transform transition
                      ${showingAchievement === achievement.id ? 'scale-105 ring-2 ring-accent-purple' : ''}
                      hover:scale-105 cursor-pointer`}
                    onClick={() => handleAchievementClick(achievement.id)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${
                        achievement.id === showingAchievement ? 'bg-accent-purple/10' : 'bg-gray-100'
                      }`}>
                        <Icon className={`w-6 h-6 ${
                          achievement.id === showingAchievement ? 'text-accent-purple' : 'text-gray-600'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{achievement.name}</h3>
                        <p className="text-gray-600">{achievement.description}</p>
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

          {/* Answer Review Section - Only show if settings allow */}
          {(settings?.feedbackMode !== 'never' || isPreview) && (
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <ChevronDown className="text-accent-purple" />
                Question Review
              </h2>
              <div className="space-y-8">
                {questions?.map((question: any, index: number) => (
                  <div key={index} className="border-b pb-6 last:border-b-0">
                    <div className="flex items-start gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white
                        ${answers[index] === question.correctAnswer ? 'bg-accent-green' : 'bg-secondary'}`}>
                        {answers[index] === question.correctAnswer ? 
                          <Check className="w-5 h-5" /> : 
                          <X className="w-5 h-5" />
                        }
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold mb-2">
                          Question {index + 1}: {question.question}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
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
                                {option === answers[index] && option !== question.correctAnswer && (
                                  <X className="w-5 h-5 text-secondary" />
                                )}
                                <span>{option}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-lg
                hover:bg-gray-50 transition transform hover:scale-105"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </Link>
            {canRetake && !isPreview && (
              <button
                onClick={() => navigate('/quiz', { state: { studentName } })}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-xl shadow-lg
                  hover:bg-gray-50 transition transform hover:scale-105"
              >
                Try Again
                <Award className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Email Dialog */}
        {showEmailDialog && !isPreview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <h3 className="text-xl font-bold mb-4">Send Results via Email</h3>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full p-2 border rounded-lg mb-4"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEmailDialog(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Fun Facts */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold mb-2">🎯 Fun Fact!</h3>
          <p className="text-gray-600">Did you know? The more quizzes you take, the stronger your brain becomes! 
            Just like exercising makes your muscles stronger! 💪</p>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
