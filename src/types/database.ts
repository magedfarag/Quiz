export interface DatabaseSchema {
  users: User[];
  quizzes: Quiz[];
  results: QuizResult[];
  settings: AppSettings;
}

export interface AppSettings {
  quizTimeLimit: number;
  passingScore: number;
  allowRetakes: boolean;
}

// ...existing interfaces...
