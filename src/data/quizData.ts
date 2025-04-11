export const quizQuestions = [
  {
    id: 1,
    question: "What is 2 + 2?",
    options: ["3", "4", "5", "6"],
    correctAnswer: "4",
  },
  {
    id: 2,
    question: "What is the capital of France?",
    options: ["Berlin", "Madrid", "Paris", "Rome"],
    correctAnswer: "Paris",
  },
  {
    id: 3,
    question: "Which planet is known as the Red Planet?",
    options: ["Venus", "Mars", "Jupiter", "Saturn"],
    correctAnswer: "Mars",
  },
  {
    id: 4,
    question: "What is the largest mammal in the world?",
    options: ["African Elephant", "Blue Whale", "Giraffe", "Hippopotamus"],
    correctAnswer: "Blue Whale",
  }
];

export const achievements = [
  { id: 1, name: "First Step", description: "Completed the first quiz." },
  { id: 2, name: "Perfect Score", description: "Achieved a perfect score in a quiz." },
];

export const userData = [
  { id: 1, name: "John Doe", quizzesCompleted: 5, averageScore: 80 },
  { id: 2, name: "Jane Smith", quizzesCompleted: 3, averageScore: 90 },
];

export const adminStats = {
  totalQuizzes: 10,
  activeUsers: 25,
  averageScore: 85,
};
