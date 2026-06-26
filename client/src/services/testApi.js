import api from './api';

export const testApi = {
  startTest: async () => {
    const { data } = await api.post('/tests/start');
    return data;
  },
  
  submitTest: async (testId, answers) => {
    const { data } = await api.post(`/tests/${testId}/submit`, { answers });
    return data;
  },

  getHistory: async () => {
    const { data } = await api.get('/tests/history');
    return data;
  },

  getTestResult: async (testId) => {
    const { data } = await api.get(`/tests/${testId}/result`);
    return data;
  }
};

export default testApi;
