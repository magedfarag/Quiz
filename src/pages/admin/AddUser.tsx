import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, X } from 'lucide-react';
import AdminLayout from '@components/AdminLayout';
import { DashboardCard } from '@/components/admin/DashboardCard';
import type { User } from '@/types/user';

export default function AddUser() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student' as User['role'],
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3001/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (!response.ok) throw new Error('Failed to create user');
      navigate('/admin/users');
    } catch (err) {
      console.error('Failed to create user:', err);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <header className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Add User</h1>
          <div className="space-x-3">
            <button onClick={() => navigate('/admin/users')} className="btn-secondary">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
            <button onClick={handleSubmit} className="btn-primary">
              <Save className="w-4 h-4 mr-2" />
              Save
            </button>
          </div>
        </header>

        <DashboardCard>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Form fields implementation */}
          </form>
        </DashboardCard>
      </div>
    </AdminLayout>
  );
}
