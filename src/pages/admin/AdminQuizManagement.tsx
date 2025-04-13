import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AdminLayout from '../../components/AdminLayout';
import { DashboardCard } from '../../components/admin/DashboardCard';
import { adminApi } from '../../api/admin';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import '../../styles/animations.css';

const MAX_RETRIES = 3;

interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: any[];
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}

const AdminQuizManagement: React.FC = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async (retry = false) => {
    try {
      if (retry) {
        if (retryCount >= MAX_RETRIES) {
          setError('Maximum retry attempts reached. Please try again later.');
          return;
        }
        setRetryCount(prev => prev + 1);
      } else {
        setRetryCount(0);
      }

      setIsLoading(true);
      setError('');
      const data = await adminApi.getQuizzes();
      setQuizzes(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load quizzes';
      setError(`Error loading quizzes: ${errorMessage}`);
      console.error('Error fetching quizzes:', err);
      
      // Auto-retry after 2 seconds
      if (retryCount < MAX_RETRIES) {
        setTimeout(() => fetchQuizzes(true), 2000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteQuiz = async (quizId: string) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await adminApi.deleteQuiz(quizId);
      await fetchQuizzes();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete quiz';
      setError(`Error deleting quiz: ${errorMessage}`);
    }
  };

  const handlePublishQuiz = async (quiz: Quiz) => {
    try {
      await adminApi.updateQuiz(quiz.id, { ...quiz, isPublished: true });
      await fetchQuizzes();
    } catch (err) {
      setError('Failed to publish quiz');
    }
  };

  const handlePreviewQuiz = (quiz: Quiz) => {
    navigate(`/quiz`, { 
      state: { 
        quizId: quiz.id,
        studentName: 'Preview Mode',
        isPreview: true
      } 
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex flex-col justify-center items-center h-full space-y-4">
          <LoadingSpinner />
          {retryCount > 0 && (
            <div className="text-gray-600">
              Retry attempt {retryCount}/{MAX_RETRIES}...
            </div>
          )}
        </div>
      </AdminLayout>
    );
  }

  const filteredQuizzes = quizzes.filter(quiz =>
    quiz.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    quiz.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="animate-fade-in">
          <header className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Quiz Management</h1>
              <p className="text-gray-600 mt-2">Create and manage your quizzes</p>
            </div>
            <button 
              onClick={() => navigate('/admin/quiz-management/add')}
              className="btn-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Quiz
            </button>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <DashboardCard title="Total Quizzes">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-primary-600">{quizzes.length}</h3>
                <p className="text-gray-600">Total Quizzes</p>
              </div>
            </DashboardCard>
            <DashboardCard title="Published Quizzes">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-green-600">
                  {quizzes.filter(q => q.isPublished).length}
                </h3>
                <p className="text-gray-600">Published</p>
              </div>
            </DashboardCard>
            <DashboardCard title="Draft Quizzes">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-yellow-600">
                  {quizzes.filter(q => !q.isPublished).length}
                </h3>
                <p className="text-gray-600">Drafts</p>
              </div>
            </DashboardCard>
            <DashboardCard title="Total Questions">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-blue-600">
                  {quizzes.reduce((sum, quiz) => sum + (quiz.questions?.length || 0), 0)}
                </h3>
                <p className="text-gray-600">Total Questions</p>
              </div>
            </DashboardCard>
          </div>

          <DashboardCard title="Quiz List">
            <div className="flex justify-between items-center mb-6">
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search quizzes..."
                  className="pl-10 pr-4 py-2 w-full border rounded-lg focus:ring-2 focus:ring-primary-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex space-x-3">
                <button className="btn-secondary">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 flex justify-between items-center">
                <span>{error}</span>
                <button 
                  onClick={() => fetchQuizzes()}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Retry
                </button>
              </div>
            )}

            <div className="space-y-3">
              {filteredQuizzes.map((quiz) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-white rounded-lg border hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{quiz.title}</h3>
                      <div className="flex items-center space-x-4">
                        <p className="text-sm text-gray-600">
                          {quiz.questions?.length || 0} questions
                        </p>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          quiz.isPublished 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {quiz.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!quiz.isPublished && (
                        <button 
                          onClick={() => handlePublishQuiz(quiz)}
                          className="p-2 hover:bg-green-100 rounded-full"
                          title="Publish Quiz"
                        >
                          <Eye className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                      <button 
                        onClick={() => handlePreviewQuiz(quiz)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                        title="Preview Quiz"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => navigate(`/admin/quiz-management/edit/${quiz.id}`)}
                        className="p-2 hover:bg-gray-100 rounded-full"
                        title="Edit Quiz"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button 
                        onClick={() => handleDeleteQuiz(quiz.id)}
                        className="p-2 hover:bg-red-100 rounded-full"
                        title="Delete Quiz"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {filteredQuizzes.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? 'No quizzes match your search' : 'No quizzes created yet'}
                </div>
              )}
            </div>
          </DashboardCard>
        </div>
      </motion.div>
    </AdminLayout>
  );
};

export default AdminQuizManagement;
