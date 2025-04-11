import { render, screen, fireEvent } from '@testing-library/react';
import QuizPage from '../QuizPage';
import { BrowserRouter as Router } from 'react-router-dom';

describe('QuizPage', () => {
  test('renders correctly', () => {
    render(
      <Router>
        <QuizPage />
      </Router>
    );
    expect(screen.getByText('Question 1 of 3')).toBeInTheDocument();
    expect(screen.getByText('What is 2 + 2?')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('6')).toBeInTheDocument();
  });

  test('navigates to next question', () => {
    render(
      <Router>
        <QuizPage />
      </Router>
    );
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    expect(screen.getByText('Question 2 of 3')).toBeInTheDocument();
  });

  test('shows error when no answer is selected', () => {
    render(
      <Router>
        <QuizPage />
      </Router>
    );
    const nextButton = screen.getByText('Next');
    fireEvent.click(nextButton);
    expect(screen.getByText('Please select an answer before proceeding')).toBeInTheDocument();
  });
});
