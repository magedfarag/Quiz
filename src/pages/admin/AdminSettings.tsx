import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import AdminLayout from '@components/AdminLayout'; // Adjusted path
import { fetchSettings, updateSettings } from '@/api/admin';
import { DashboardCard } from '@/components/admin/DashboardCard';

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchSettings();
        setSettings(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to load settings:', error);
        setIsLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async () => {
    try {
      await updateSettings(settings);
      alert('Settings saved successfully!');
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  return (
    <AdminLayout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
          <p className="text-gray-600 mt-2">Configure quiz system settings</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DashboardCard title="Quiz Settings">
            <form className="space-y-4">
              <label>
                Quiz Timer (seconds):
                <input 
                  type="number" 
                  value={settings?.quizTimer || ''}
                  onChange={(e) => setSettings({
                    ...settings,
                    quizTimer: parseInt(e.target.value)
                  })}
                />
              </label>
              <button type="button" onClick={handleSave}>Save</button>
            </form>
          </DashboardCard>

          <DashboardCard title="System Settings">
            <form className="space-y-4">
              {/* System settings form implementation */}
            </form>
          </DashboardCard>
        </div>
      </motion.div>
    </AdminLayout>
  );
}
