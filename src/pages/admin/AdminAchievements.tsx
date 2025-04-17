import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Award, Star, Zap, Brain, Trophy, Edit, Trash2 } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { DashboardCard } from '../../components/admin/DashboardCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { dataService, Achievement } from '../../api/data';

export default function AdminAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Achievement>>({});

  const getIconComponent = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'star': return <Star className="w-5 h-5" />;
      case 'award': return <Award className="w-5 h-5" />;
      case 'zap': return <Zap className="w-5 h-5" />;
      case 'brain': return <Brain className="w-5 h-5" />;
      case 'trophy': return <Trophy className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  // Fetch achievements from the correct API endpoint
  const fetchAchievements = async () => {
    try {
      setIsLoading(true);
      setError(null);
      // Use the correct endpoint: /api/achievements
      const response = await fetch('http://localhost:3001/api/achievements');
      if (!response.ok) throw new Error('Failed to load achievements');
      const data = await response.json();
      setAchievements(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load achievements';
      setError(errorMessage);
      console.error('Error fetching achievements:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAchievement = async () => {
    try {
      const newAchievement = {
        name: 'New Achievement',
        description: 'Achievement description',
        icon: 'award',
        conditions: {
          quizzes_completed: 1
        },
        isActive: true,
        earnedCount: 0
      };

      const response = await dataService.addAchievement(newAchievement);
      setAchievements([...achievements, response]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create achievement';
      setError(errorMessage);
      console.error('Error adding achievement:', err);
    }
  };

  const handleUpdateAchievement = async (id: number) => {
    try {
      await dataService.updateAchievement(id, editForm);
      setAchievements(achievements.map(achievement => 
        achievement.id === id 
          ? { ...achievement, ...editForm } 
          : achievement
      ));
      
      setIsEditing(null);
      setEditForm({});
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update achievement';
      setError(errorMessage);
      console.error('Error updating achievement:', err);
    }
  };

  const handleDeleteAchievement = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this achievement?')) return;

    try {
      await dataService.deleteAchievement(id);
      setAchievements(achievements.filter(achievement => achievement.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete achievement';
      setError(errorMessage);
      console.error('Error deleting achievement:', err);
    }
  };

  const handleToggleActive = async (achievement: Achievement) => {
    try {
      const updatedStatus = !achievement.isActive;
      await dataService.updateAchievement(achievement.id, { isActive: updatedStatus });
      setAchievements(achievements.map(item => 
        item.id === achievement.id 
          ? { ...item, isActive: updatedStatus } 
          : item
      ));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to toggle achievement status';
      setError(errorMessage);
      console.error('Error toggling achievement status:', err);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Achievements Management</h1>
            <p className="text-gray-600 mt-2">Create and manage achievements for students</p>
          </div>
          <button
            onClick={handleAddAchievement}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Achievement
          </button>
        </header>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((achievement) => (
            <DashboardCard key={achievement.id}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                      {getIconComponent(achievement.icon)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{achievement.name}</h3>
                      <p className="text-sm text-gray-500">{achievement.description}</p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {isEditing === achievement.id ? (
                      <>
                        <button
                          onClick={() => handleUpdateAchievement(achievement.id)}
                          className="p-1 text-green-600 hover:text-green-800"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setIsEditing(null);
                            setEditForm({});
                          }}
                          className="p-1 text-gray-600 hover:text-gray-800"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setIsEditing(achievement.id);
                            setEditForm(achievement);
                          }}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteAchievement(achievement.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing === achievement.id ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Name</label>
                      <input
                        type="text"
                        value={editForm.name || ''}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Description</label>
                      <input
                        type="text"
                        value={editForm.description || ''}
                        onChange={(e) =>
                          setEditForm({ ...editForm, description: e.target.value })
                        }
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Icon</label>
                      <select
                        value={editForm.icon || 'award'}
                        onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                        className="w-full px-3 py-2 border rounded-md"
                      >
                        <option value="award">Award</option>
                        <option value="star">Star</option>
                        <option value="zap">Zap</option>
                        <option value="brain">Brain</option>
                        <option value="trophy">Trophy</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="border-t border-gray-100 pt-4 mt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Earned by</span>
                        <span className="font-medium">{achievement.earnedCount} students</span>
                      </div>

                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-600">Status</span>
                        <div className="flex items-center">
                          <span
                            className={`w-2 h-2 rounded-full mr-1.5 ${
                              achievement.isActive ? 'bg-green-500' : 'bg-red-500'
                            }`}
                          ></span>
                          <span>{achievement.isActive ? 'Active' : 'Inactive'}</span>
                        </div>
                      </div>

                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-gray-600">Conditions</span>
                        <span className="font-medium">
                          {Object.entries(achievement.conditions)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleActive(achievement)}
                      className={`w-full mt-4 py-1.5 text-sm rounded-md ${
                        achievement.isActive
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {achievement.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </>
                )}
              </div>
            </DashboardCard>
          ))}
        </div>

        {achievements.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <Award className="w-12 h-12 text-gray-400 mx-auto" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No achievements found</h3>
            <p className="mt-2 text-gray-500">Create your first achievement to get started.</p>
            <button
              onClick={handleAddAchievement}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Achievement
            </button>
          </div>
        )}
      </motion.div>
    </AdminLayout>
  );
}