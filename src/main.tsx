import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import RouteError from './components/RouteError';
import HomePage from './pages/HomePage';
import QuizPage from './pages/QuizPage';
import ResultsPageWithErrorBoundary from './pages/ResultsPage';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminQuizManagement from './pages/admin/AdminQuizManagement';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import AdminSettings from './pages/admin/AdminSettings';
import AdminAuditLogs from './pages/admin/AdminAuditLogs';
import AdminAchievements from './pages/admin/AdminAchievements';
import QuizOverview from './pages/student/QuizOverview'; // Updated to use student version
import QuizSelection from './pages/student/QuizSelection';
import NotFound from './pages/NotFound';
import Forbidden from './pages/Forbidden';
import ServerError from './pages/ServerError';
import QuizEngine from './components/QuizEngine';
import './index.css';

// Create the browser router with error handling
const router = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />,
    errorElement: <RouteError />
  },
  {
    path: '/quiz-selection',
    element: <QuizSelection />,
    errorElement: <RouteError />
  },
  {
    path: '/quiz-overview',
    element: <QuizOverview />,
    errorElement: <RouteError />
  },
  {
    path: '/quiz',
    element: <QuizPage />,
    errorElement: <RouteError />
  },
  {
    path: '/results',
    element: <ResultsPageWithErrorBoundary />,
    errorElement: <RouteError />
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
    errorElement: <RouteError />
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboard />,
    errorElement: <RouteError />
  },
  {
    path: '/admin/quiz-management',
    element: <AdminQuizManagement />,
    errorElement: <RouteError />
  },
  {
    path: '/admin/analytics',
    element: <AdminAnalytics />,
    errorElement: <RouteError />
  },
  {
    path: '/admin/settings',
    element: <AdminSettings />,
    errorElement: <RouteError />
  },
  {
    path: '/admin/audit-logs',
    element: <AdminAuditLogs />,
    errorElement: <RouteError />
  },
  {
    path: '/admin/user-management',
    element: <AdminUserManagement />,
    errorElement: <RouteError />
  },
  {
    path: '/admin/achievements',
    element: <AdminAchievements />,
    errorElement: <RouteError />
  },
  {
    path: '/quiz-engine',
    element: <QuizEngine />,
    errorElement: <RouteError />
  },
  {
    path: '/404',
    element: <NotFound />,
    errorElement: <RouteError />
  },
  {
    path: '/403',
    element: <Forbidden />,
    errorElement: <RouteError />
  },
  {
    path: '/500',
    element: <ServerError />,
    errorElement: <RouteError />
  },
  {
    path: '*',
    element: <NotFound />,
    errorElement: <RouteError />
  }
]);

// Root app wrapped in our custom ErrorBoundary
const App = () => {
  return (
    <ErrorBoundary>
      <RouterProvider router={router} />
    </ErrorBoundary>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
