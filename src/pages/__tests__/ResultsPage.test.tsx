import { render, screen } from '@testing-library/react';
import ResultsPage from '../ResultsPage';
import { BrowserRouter as Router } from 'react-router-dom';

describe('ResultsPage', () => {
  test('renders correctly', () => {
    render(
      <Router>
        <ResultsPage />
      </Router>
    );
    expect(screen.getByText('Quiz Results')).toBeInTheDocument();
    expect(screen.getByText('8/10')).toBeInTheDocument();
    expect(screen.getByText('You scored 80%')).toBeInTheDocument();
    expect(screen.getByText('Score Breakdown')).toBeInTheDocument();
    expect(screen.getByText('Question Review')).toBeInTheDocument();
    expect(screen.getByText('Achievements Unlocked')).toBeInTheDocument();
  });

  test('displays correct achievements', () => {
    render(
      <Router>
        <ResultsPage />
      </Router>
    );
    expect(screen.getByText('First Step')).toBeInTheDocument();
    expect(screen.getByText('Perfect Score')).toBeInTheDocument();
  });
});
