import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorBoundary from '@components/ErrorBoundary';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import AdminLogin from '@pages/admin/AdminLogin';
import AdminDashboard from '@pages/admin/AdminDashboard';
import AdminQuizManagement from '@pages/admin/AdminQuizManagement';
import AdminUserManagement from '@pages/admin/AdminUserManagement';
import AdminAnalytics from '@pages/admin/AdminAnalytics';
import AdminSettings from '@pages/admin/AdminSettings';
import AdminAuditLogs from '@pages/admin/AdminAuditLogs';
import AddQuiz from '@pages/admin/AddQuiz';
import EditQuiz from '@pages/admin/EditQuiz';
import AddUser from '@pages/admin/AddUser';
import EditUser from '@pages/admin/EditUser';
import NotFound from '@pages/NotFound';
import Forbidden from '@pages/Forbidden';
import ServerError from '@pages/ServerError';
import '@/index.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <NotFound />
  },
  {
    path: '/quiz',
    element: <QuizPage />,
  },
  {
    path: '/results',
    element: <ResultsPage />,
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboard />,
  },
  {
    path: '/admin/quiz-management',
    element: <AdminQuizManagement />,
  },
  {
    path: '/admin/quiz-management/add',
    element: <AddQuiz />,
  },
  {
    path: '/admin/quiz-management/edit/:id',
    element: <EditQuiz />,
  },
  {
    path: '/admin/user-management',
    element: <AdminUserManagement />,
  },
  {
    path: '/admin/user-management/add',
    element: <AddUser />,
  },
  {
    path: '/admin/user-management/edit/:id',
    element: <EditUser />,
  },
  {
    path: '/admin/analytics',
    element: <AdminAnalytics />,
  },
  {
    path: '/admin/settings',
    element: <AdminSettings />,
  },
  {
    path: '/admin/audit-logs',
    element: <AdminAuditLogs />,
  },
  {
    path: '/404',
    element: <NotFound />,
  },
  {
    path: '/403',
    element: <Forbidden />,
  },
  {
    path: '/500',
    element: <ServerError />,
  },
  {
    path: '*',
    element: <NotFound />,
  }
], {
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  </StrictMode>
);
