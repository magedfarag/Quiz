import { render, screen, fireEvent } from '@testing-library/react';
import HomePage from '../HomePage';
import { BrowserRouter as Router } from 'react-router-dom';

describe('HomePage', () => {
  test('renders correctly', () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );
    expect(screen.getByText('Welcome to Quizzy!')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Your name')).toBeInTheDocument();
    expect(screen.getByText('Start Quiz')).toBeInTheDocument();
  });

  test('shows error for invalid name', () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );
    const input = screen.getByPlaceholderText('Your name');
    const button = screen.getByText('Start Quiz');

    fireEvent.change(input, { target: { value: '1' } });
    fireEvent.click(button);

    expect(screen.getByText('Please enter a valid name (2-30 letters)')).toBeInTheDocument();
  });

  test('navigates to quiz page on valid name', () => {
    render(
      <Router>
        <HomePage />
      </Router>
    );
    const input = screen.getByPlaceholderText('Your name');
    const button = screen.getByText('Start Quiz');

    fireEvent.change(input, { target: { value: 'John Doe' } });
    fireEvent.click(button);

    expect(window.location.pathname).toBe('/quiz');
  });
});
