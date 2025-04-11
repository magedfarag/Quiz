// ... (previous imports)
import { adminLogin } from '../../api/auth';

export default function AdminLogin() {
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { token, user } = await adminLogin(username, password);
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      navigate('/admin/dashboard');
    } catch (error) {
      setError(error.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  // ... (rest of the component)
}
