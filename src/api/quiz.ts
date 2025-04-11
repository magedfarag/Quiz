const API_BASE_URL = 'http://localhost:3001/api';

export const fetchQuestions = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/questions`);
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch questions');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching questions:', error);
    throw error;
  }
};

export const submitQuizResults = async (resultData: Record<string, any>) => {
  try {
    const response = await fetch(`${API_BASE_URL}/results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(resultData)
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to submit quiz');
    }
    return response.json();
  } catch (error) {
    console.error('Error submitting quiz:', error);
    throw error;
  }
};

export const deleteQuestion = async (questionId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/questions/${questionId}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete question');
    }
    return response.json();
  } catch (error) {
    console.error('Error deleting question:', error);
    throw error;
  }
};
