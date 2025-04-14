export interface AdminSettings {
  quizTimeLimit: number;
  passingScore: number;
  maxQuestions: number;
  requireEmailVerification: boolean;
  allowRetakes: boolean;
  showResults: boolean;
  maxAttempts: number;
  feedbackMode: 'immediate' | 'afterSubmission' | 'never';
  gradingScheme: 'percentage' | 'points' | 'custom';
}
