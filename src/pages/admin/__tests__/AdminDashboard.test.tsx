import { render, screen } from '@testing-library/react';
import AdminDashboard from '../AdminDashboard';
import { BrowserRouter as Router } from 'react-router-dom';

describe('AdminDashboard', () => {
  test('renders correctly', () => {
    render(
      <Router>
        <AdminDashboard />
      </Router>
    );
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Total Quizzes')).toBeInTheDocument();
    expect(screen.getByText('Active Users')).toBeInTheDocument();
    expect(screen.getByText('Average Score')).toBeInTheDocument();
  });
});
