import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const SettingsCard = styled.div`
  background: ${theme.colors.surface};
  border-radius: 8px;
  padding: ${theme.spacing.xl};
  box-shadow: ${theme.shadows.card};
`;

const SettingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.md} 0;
  border-bottom: 1px solid rgba(0,0,0,0.1);

  &:last-child {
    border-bottom: none;
  }
`;

export const AdminSettings = () => {
  const [settings, setSettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings: newSettings })
      });
      if (response.ok) {
        setSettings(newSettings);
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  if (isLoading) return <div>Loading settings...</div>;

  return (
    <SettingsCard>
      <h2>System Configuration</h2>
      <SettingRow>
        <label>Quiz Time Limit (minutes)</label>
        <input
          type="number"
          value={settings.quizTimeLimit}
          onChange={(e) => updateSettings({ ...settings, quizTimeLimit: parseInt(e.target.value) })}
          min="1"
          max="180"
        />
      </SettingRow>
      <SettingRow>
        <label>Passing Score (%)</label>
        <input
          type="number"
          value={settings.passingScore}
          onChange={(e) => updateSettings({ ...settings, passingScore: parseInt(e.target.value) })}
          min="0"
          max="100"
        />
      </SettingRow>
      <SettingRow>
        <label>Allow Retakes</label>
        <input
          type="checkbox"
          checked={settings.allowRetakes}
          onChange={(e) => updateSettings({ ...settings, allowRetakes: e.target.checked })}
        />
      </SettingRow>
      <SettingRow>
        <label>Show Results Immediately</label>
        <input
          type="checkbox"
          checked={settings.showResults}
          onChange={(e) => updateSettings({ ...settings, showResults: e.target.checked })}
        />
      </SettingRow>
    </SettingsCard>
  );
};
