import { render, screen, fireEvent } from '@testing-library/react';
import AdminLogin from '../AdminLogin';
import { BrowserRouter as Router } from 'react-router-dom';

describe('AdminLogin', () => {
  test('renders correctly', () => {
    render(
      <Router>
        <AdminLogin />
      </Router>
    );
    expect(screen.getByText('Admin Login')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter password')).toBeInTheDocument();
    expect(screen.getByText('Login')).toBeInTheDocument();
  });

  test('shows error for invalid credentials', async () => {
    render(
      <Router>
        <AdminLogin />
      </Router>
    );
    const usernameInput = screen.getByPlaceholderText('Enter username');
    const passwordInput = screen.getByPlaceholderText('Enter password');
    const loginButton = screen.getByText('Login');

    fireEvent.change(usernameInput, { target: { value: 'wrong' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(loginButton);

    expect(await screen.findByText('Invalid username or password')).toBeInTheDocument();
  });
});
