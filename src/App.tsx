import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQuizManagement from './pages/admin/AdminQuizManagement';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AddQuiz from './pages/admin/AddQuiz';
import EditQuiz from './pages/admin/EditQuiz';
import AddUser from './pages/admin/AddUser';
import EditUser from './pages/admin/EditUser';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import ServerError from './pages/ServerError';
import QuizOverview from './pages/student/QuizOverview';
import QuizSelection from './pages/student/QuizSelection';

const wrapWithErrorBoundary = (element: React.ReactNode) => (
  <ErrorBoundary>{element}</ErrorBoundary>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: wrapWithErrorBoundary(<HomePage />),
    errorElement: <NotFound />
  },
  {
    path: '/quiz-selection',
    element: wrapWithErrorBoundary(<QuizSelection />),
  },
  {
    path: '/quiz-overview',
    element: wrapWithErrorBoundary(<QuizOverview />),
  },
  {
    path: '/quiz',
    element: wrapWithErrorBoundary(<QuizPage />),
  },
  {
    path: '/results',
    element: wrapWithErrorBoundary(<ResultsPage />),
  },
  {
    path: '/admin/login',
    element: wrapWithErrorBoundary(<AdminLogin />),
  },
  {
    path: '/admin/dashboard',
    element: wrapWithErrorBoundary(<AdminDashboard />),
  },
  {
    path: '/admin/quiz-management',
    element: wrapWithErrorBoundary(<AdminQuizManagement />),
  },
  {
    path: '/admin/quiz-management/add',
    element: wrapWithErrorBoundary(<AddQuiz />),
  },
  {
    path: '/admin/quiz-management/edit/:id',
    element: wrapWithErrorBoundary(<EditQuiz />),
  },
  {
    path: '/admin/user-management',
    element: wrapWithErrorBoundary(<AdminUserManagement />),
  },
  {
    path: '/admin/user-management/add',
    element: wrapWithErrorBoundary(<AddUser />),
  },
  {
    path: '/admin/user-management/edit/:id', 
    element: wrapWithErrorBoundary(<EditUser />),
  },
  {
    path: 'admin/users/:id/edit',
    element: wrapWithErrorBoundary(<EditUser />),
  },
  {
    path: '/admin/analytics',
    element: wrapWithErrorBoundary(<AdminAnalytics />),
  },
  {
    path: '/admin/settings',
    element: wrapWithErrorBoundary(<AdminSettings />),
  },
  {
    path: '/admin/audit-logs',
    element: wrapWithErrorBoundary(<AdminAuditLogs />),
  },
  {
    path: '/404',
    element: wrapWithErrorBoundary(<NotFound />),
  },
  {
    path: '/403',
    element: wrapWithErrorBoundary(<Forbidden />),
  },
  {
    path: '/500',
    element: wrapWithErrorBoundary(<ServerError />),
  },
  {
    path: '*',
    element: wrapWithErrorBoundary(<NotFound />),
  }
]);

const App = () => {
  return <RouterProvider router={router} />;
};

export default App;
