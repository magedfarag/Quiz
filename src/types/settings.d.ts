export interface AdminSettings {
  quizTimeLimit: number;
  passingScore: number;
  allowRetakes: boolean;
  showResults: boolean;
  maxAttempts: number;
  feedbackMode: 'immediate' | 'afterSubmission' | 'never';
  gradingScheme: 'percentage' | 'points' | 'custom';
}
