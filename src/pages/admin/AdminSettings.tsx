import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, RefreshCcw, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { fetchSettings, updateSettings, resetSettings } from '../../api/admin';
import { DashboardCard } from '../../components/admin/DashboardCard';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import type { AdminSettings } from '../../types/settings';

export default function AdminSettings() {
  const [settings, setSettings] = useState<AdminSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await fetchSettings();
      setSettings(data);
    } catch (error) {
      setError('Failed to load settings. Please try again.');
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;
    
    try {
      setIsSaving(true);
      setError('');
      const response = await updateSettings(settings);
      setSettings(response.settings);
      setSuccessMessage('Settings saved successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save settings. Please try again.';
      setError(message);
      console.error('Failed to save settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all settings to default values?')) {
      try {
        setIsSaving(true);
        setError('');
        const response = await resetSettings();
        setSettings(response.settings);
        setSuccessMessage('Settings reset to defaults!');
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to reset settings. Please try again.';
        setError(message);
        console.error('Failed to reset settings:', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-96">
          <LoadingSpinner />
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
        className="space-y-6"
      >
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
            <p className="text-gray-600 mt-2">Configure quiz system settings</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleReset}
              className="btn-secondary"
              disabled={isSaving}
            >
              <RefreshCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </button>
            <button
              onClick={handleSave}
              className="btn-primary"
              disabled={isSaving}
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        )}

        {successMessage && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg">
            {successMessage}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Quiz Settings">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quiz Time Limit (minutes)
                </label>
                <input
                  type="number"
                  value={settings?.quizTimeLimit || 30}
                  onChange={(e) => setSettings((prev: AdminSettings | null) => ({
                    ...prev!,
                    quizTimeLimit: parseInt(e.target.value)
                  }))}
                  min="1"
                  max="180"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Passing Score (%)
                </label>
                <input
                  type="number"
                  value={settings?.passingScore || 70}
                  onChange={(e) => setSettings((prev: AdminSettings | null) => ({
                    ...prev!,
                    passingScore: parseInt(e.target.value)
                  }))}
                  min="0"
                  max="100"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Questions
                </label>
                <input
                  type="number"
                  value={settings?.maxQuestions || 10}
                  onChange={(e) => setSettings((prev: AdminSettings | null) => ({
                    ...prev!,
                    maxQuestions: parseInt(e.target.value)
                  }))}
                  min="1"
                  max="100"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Attempts
                </label>
                <input
                  type="number"
                  value={settings?.maxAttempts || 3}
                  onChange={(e) => setSettings((prev: AdminSettings | null) => ({
                    ...prev!,
                    maxAttempts: parseInt(e.target.value)
                  }))}
                  min="1"
                  max="10"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Mode
                </label>
                <select
                  value={settings?.feedbackMode || 'afterSubmission'}
                  onChange={(e) => setSettings((prev: AdminSettings | null) => ({
                    ...prev!,
                    feedbackMode: e.target.value as 'immediate' | 'afterSubmission' | 'never'
                  }))}
                  className="input-field"
                >
                  <option value="immediate">Immediate</option>
                  <option value="afterSubmission">After Submission</option>
                  <option value="never">Never</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grading Scheme
                </label>
                <select
                  value={settings?.gradingScheme || 'percentage'}
                  onChange={(e) => setSettings((prev: AdminSettings | null) => ({
                    ...prev!,
                    gradingScheme: e.target.value as 'percentage' | 'points' | 'custom'
                  }))}
                  className="input-field"
                >
                  <option value="percentage">Percentage</option>
                  <option value="points">Points</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
            </div>
          </DashboardCard>

          <DashboardCard title="General Settings">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Require Email Verification
                  </label>
                  <p className="text-sm text-gray-500">
                    Users must verify their email before taking quizzes
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.requireEmailVerification || false}
                    onChange={(e) => setSettings((prev: AdminSettings | null) => ({
                      ...prev!,
                      requireEmailVerification: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Allow Retakes
                  </label>
                  <p className="text-sm text-gray-500">
                    Let students retake quizzes they've already completed
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.allowRetakes || false}
                    onChange={(e) => setSettings((prev: AdminSettings | null) => ({
                      ...prev!,
                      allowRetakes: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Show Results Immediately
                  </label>
                  <p className="text-sm text-gray-500">
                    Display quiz results right after submission
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings?.showResults || false}
                    onChange={(e) => setSettings((prev: AdminSettings | null) => ({
                      ...prev!,
                      showResults: e.target.checked
                    }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </DashboardCard>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
