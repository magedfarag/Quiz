import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import AdminLayout from '@components/AdminLayout';
import { DashboardCard } from '@/components/admin/DashboardCard';
import { adminApi } from '@/api/admin';
import type { User } from '@/types/user';

export default function EditUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<Partial<User>>({
    name: '',
    email: '',
    role: 'student',
    status: 'active'
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        setError('');
        if (id) {
          const data = await adminApi.getUser(id);
          setFormData(data);
        }
      } catch (err) {
        setError('Failed to load user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (id) {
        await adminApi.updateUser(id, formData);
      }
      navigate('/admin/users');
    } catch (err) {
      setError('Failed to save user');
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">
            {id ? 'Edit User' : 'Add User'}
          </h1>
          <div className="flex space-x-3">
            <button 
              onClick={() => navigate('/admin/users')}
              className="btn-secondary"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button 
              onClick={handleSubmit}
              className="btn-primary"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">{error}</div>
        )}

        <DashboardCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="input-field w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="input-field w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="input-field w-full"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value })}
                className="input-field w-full"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </form>
        </DashboardCard>
      </div>
    </AdminLayout>
  );
}
