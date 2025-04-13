import { useState } from 'react';
import { motion } from 'framer-motion';
import { Save, ArrowRight, Plus, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DashboardCard } from '../../components/admin/DashboardCard';
import AdminLayout from '../../components/AdminLayout';
import { adminApi } from '../../api/admin';
import type { Quiz, Question } from '../../types/quiz';

interface QuizData {
  title: string;
  description: string;
  timeLimit: number;
  passingScore: number;
  questions: Question[];
}

export default function AddQuiz() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [quizData, setQuizData] = useState<QuizData>({
    title: '',
    description: '',
    timeLimit: 30,
    passingScore: 70,
    questions: []
  });
  const [currentQuestion, setCurrentQuestion] = useState<Question>({
    id: Date.now().toString(),
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    type: 'multiple_choice',
    difficulty: 'medium'
  });

  const handleSaveQuiz = async () => {
    try {
      const transformedData = {
        ...quizData,
        questions: quizData.questions.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options,
          correctAnswer: q.correctAnswer,
          type: q.type,
          difficulty: q.difficulty
        }))
      };
      await adminApi.createQuiz(transformedData);
      navigate('/admin/quiz-management');
    } catch (error) {
      console.error('Error creating quiz:', error);
    }
  };

  const handleAddQuestion = () => {
    if (currentQuestion.text && currentQuestion.correctAnswer) {
      setQuizData(prev => ({
        ...prev,
        questions: [...prev.questions, { ...currentQuestion, id: Date.now().toString() }]
      }));
      setCurrentQuestion({
        id: Date.now().toString(),
        text: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        type: 'multiple_choice',
        difficulty: 'medium'
      });
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Create Quiz</h1>
            <p className="text-gray-600 mt-2">Step {currentStep} of 3</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => navigate('/admin/quiz-management')}
              className="btn-secondary"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button 
              onClick={handleSaveQuiz}
              className="btn-primary"
              disabled={!quizData.title || quizData.questions.length === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Quiz
            </button>
          </div>
        </header>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            {[1, 2, 3].map((step) => (
              <motion.div
                key={step}
                className={`flex-1 h-2 rounded-full mx-2 ${
                  step <= currentStep ? 'bg-primary-600' : 'bg-gray-200'
                }`}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: step * 0.1 }}
              />
            ))}
          </div>

          <DashboardCard title="Create New Quiz">
            {currentStep === 1 && (
              <div className="space-y-6 p-6">
                <h2 className="text-xl font-semibold">Quiz Details</h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quiz Title
                  </label>
                  <input
                    type="text"
                    value={quizData.title}
                    onChange={(e) => setQuizData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Enter quiz title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={quizData.description}
                    onChange={(e) => setQuizData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500 h-32"
                    placeholder="Enter quiz description"
                  />
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6 p-6">
                <h2 className="text-xl font-semibold">Quiz Settings</h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Time Limit (minutes)
                    </label>
                    <input
                      type="number"
                      value={quizData.timeLimit}
                      onChange={(e) => setQuizData(prev => ({ ...prev, timeLimit: parseInt(e.target.value) }))}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Passing Score (%)
                    </label>
                    <input
                      type="number"
                      value={quizData.passingScore}
                      onChange={(e) => setQuizData(prev => ({ ...prev, passingScore: parseInt(e.target.value) }))}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6 p-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">Questions</h2>
                  <button 
                    onClick={handleAddQuestion}
                    className="btn-secondary"
                    disabled={!currentQuestion.text || !currentQuestion.correctAnswer}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Question
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Question Text
                    </label>
                    <input
                      type="text"
                      value={currentQuestion.text}
                      onChange={(e) => setCurrentQuestion(prev => ({ ...prev, text: e.target.value }))}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter question text"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">
                      Options
                    </label>
                    {currentQuestion.options.map((option, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...currentQuestion.options];
                            newOptions[index] = e.target.value;
                            setCurrentQuestion(prev => ({ ...prev, options: newOptions }));
                          }}
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                          placeholder={`Option ${index + 1}`}
                        />
                        <button
                          onClick={() => setCurrentQuestion(prev => ({ ...prev, correctAnswer: option }))}
                          className={`px-3 py-2 rounded-lg ${
                            currentQuestion.correctAnswer === option
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          Correct
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">Added Questions</h3>
                  <div className="space-y-3">
                    {quizData.questions.map((q, index) => (
                      <div key={q.id} className="p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{index + 1}. {q.text}</p>
                            <div className="mt-2 space-y-1">
                              {q.options.map((opt, i) => (
                                <p key={i} className={`text-sm ${opt === q.correctAnswer ? 'text-green-600 font-medium' : 'text-gray-600'}`}>
                                  {opt}
                                </p>
                              ))}
                            </div>
                          </div>
                          <button
                            onClick={() => setQuizData(prev => ({
                              ...prev,
                              questions: prev.questions.filter(question => question.id !== q.id)
                            }))}
                            className="text-red-600 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between p-6 border-t">
              <button
                onClick={handleBack}
                className="btn-secondary"
                disabled={currentStep === 1}
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="btn-primary"
                disabled={currentStep === 3 || (currentStep === 1 && !quizData.title)}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </DashboardCard>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
