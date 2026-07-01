import api from './api';

export const taskApi = {
  getTodayTasks: async () => {
    const { data } = await api.get('/tasks/today');
    return data;
  },
  
  getDayTasks: async (dayNumber) => {
    const { data } = await api.get(`/tasks/day/${dayNumber}`);
    return data;
  },

  getTaskDetails: async (taskId) => {
    const { data } = await api.get(`/tasks/${taskId}`);
    return data;
  },

  submitTask: async (taskId, answer, timeTakenSeconds = 0, language = 'javascript') => {
    const { data } = await api.post(`/tasks/${taskId}/complete`, {
      answer,
      time_taken_seconds: timeTakenSeconds,
      language
    });
    return data;
  },

  replaceTask: async (taskId) => {
    const { data } = await api.post(`/tasks/${taskId}/replace`);
    return data;
  },

  fetchLeetcodeContent: async (titleSlug) => {
    const { data } = await api.get(`/tasks/leetcode/${titleSlug}`);
    return data;
  }
};

export default taskApi;
