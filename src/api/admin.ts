const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

export const fetchDashboardStats = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/stats`);
  if (!response.ok) throw new Error('Failed to fetch dashboard stats');
  return response.json();
};

export const fetchQuizStats = async () => {
  const response = await fetch(`${API_BASE_URL}/results/stats`);
  if (!response.ok) throw new Error('Failed to fetch quiz stats');
  return response.json();
};

export const fetchQuestionStats = async () => {
  const response = await fetch(`${API_BASE_URL}/questions/stats`);
  if (!response.ok) throw new Error('Failed to fetch question stats');
  return response.json();
};

export const fetchUserResults = async (userId: string) => {
  const response = await fetch(`${API_BASE_URL}/results/user/${userId}`);
  if (!response.ok) throw new Error('Failed to fetch user results');
  return response.json();
};

export const fetchSettings = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/settings`);
  if (!response.ok) throw new Error('Failed to fetch settings');
  return response.json();
};

export const updateSettings = async (settingsData: Record<string, any>) => {
  const response = await fetch(`${API_BASE_URL}/admin/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settingsData)
  });
  if (!response.ok) throw new Error('Failed to update settings');
  return response.json();
};

export const fetchUsers = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/users`);
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
};

export const updateUser = async (userId: string, userData: Record<string, any>) => {
  const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  if (!response.ok) throw new Error('Failed to update user');
  return response.json();
};
