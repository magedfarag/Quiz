import React, { useState, useEffect } from 'react';
import { AdminSettings } from '../types/settings';
import type { QuizQuestion } from '../types';
import { playSoundEffect } from '../utils/sounds';

export interface QuizResultsProps {
  studentName: string;
  score: number;
  totalQuestions: number;
  answers: string[];
  questions: QuizQuestion[];
  isPreview?: boolean;
  passed: boolean;
  settings: AdminSettings | null;
  remainingAttempts: number | null;
  timeRemaining?: number;
}

interface ResultsEngineProps extends QuizResultsProps {
  renderResults: (props: ResultsRenderProps) => React.ReactNode;
  renderDetailsSection?: (props: ResultsDetailProps) => React.ReactNode;
  onRetry?: () => void;
  onFinish?: () => void;
  sendReport?: boolean;
}

export interface ResultsRenderProps {
  percentage: number;
  isPassing: boolean;
  resultMessage: string;
  hasRetryOption: boolean;
  onRetry: () => void;
  onFinish: () => void;
  showDetails: boolean;
  toggleDetails: () => void;
}

export interface ResultsDetailProps {
  questions: QuizQuestion[];
  answers: string[];
  percentage: number;
  timeElapsed: string | null;
}

const ResultsEngine: React.FC<ResultsEngineProps> = ({
  studentName,
  score,
  totalQuestions,
  answers,
  questions,
  isPreview = false,
  passed,
  settings,
  remainingAttempts,
  timeRemaining,
  renderResults,
  renderDetailsSection,
  onRetry,
  onFinish,
  sendReport = false
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isReportSent, setIsReportSent] = useState(false);
  const [isProcessingReport, setIsProcessingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);
  
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;
  const isPassing = percentage >= (settings?.passingScore || 70);
  
  // Play sound on component mount
  useEffect(() => {
    // Play success sound if passed, failure sound if failed
    const soundName = isPassing ? 'success' : 'failure';
    playSoundEffect(soundName);
  }, [isPassing]);
  
  // Calculate time spent
  const timeElapsed = timeRemaining !== undefined 
    ? formatTimeElapsed((settings?.quizTimeLimit || 30) * 60 - timeRemaining)
    : null;

  // Generate result message based on score
  const getResultMessage = (): string => {
    if (isPassing) {
      if (percentage >= 90) {
        return "Excellent work! You've mastered this topic!";
      } else if (percentage >= 80) {
        return "Great job! You have a strong understanding of the material.";
      } else {
        return "Good job! You've successfully passed the quiz!";
      }
    } else {
      if (percentage >= 60) {
        return "Almost there! Just a little more studying and you'll pass next time.";
      } else if (percentage >= 40) {
        return "Keep practicing. Review the material and try again.";
      } else {
        return "More review needed. Don't give up, keep studying!";
      }
    }
  };
  
  // Handle report sending
  useEffect(() => {
    if (sendReport && !isReportSent && !isPreview) {
      const sendResultsReport = async () => {
        try {
          setIsProcessingReport(true);
          
          // TODO: Implement actual report sending logic
          await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
          
          setIsReportSent(true);
        } catch (error) {
          console.error('Error sending quiz results report:', error);
          setReportError('Failed to send results report. Please try again later.');
        } finally {
          setIsProcessingReport(false);
        }
      };
      
      sendResultsReport();
    }
  }, [sendReport, isReportSent, isPreview]);

  // Format time elapsed
  function formatTimeElapsed(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }
  
  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    }
  };
  
  const handleFinish = () => {
    if (onFinish) {
      onFinish();
    }
  };
  
  const toggleDetails = () => {
    setShowDetails(prev => !prev);
  };
  
  const hasRetryOption = !isPreview && 
    settings?.allowRetakes === true && 
    (remainingAttempts === null || remainingAttempts > 0) && 
    !isPassing;

  return (
    <>
      {renderResults({
        percentage,
        isPassing,
        resultMessage: getResultMessage(),
        hasRetryOption,
        onRetry: handleRetry,
        onFinish: handleFinish,
        showDetails,
        toggleDetails,
      })}
      
      {showDetails && renderDetailsSection && renderDetailsSection({
        questions,
        answers,
        percentage,
        timeElapsed,
      })}
    </>
  );
};

export default ResultsEngine;