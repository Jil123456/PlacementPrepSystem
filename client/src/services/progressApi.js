import api from './api';

export const progressApi = {
  getDashboard: async () => {
    const { data } = await api.get('/progress/dashboard');
    return data;
  },
  
  getRoadmap: async () => {
    const { data } = await api.get('/progress/roadmap');
    return data;
  },

  getWeakness: async () => {
    const { data } = await api.get('/progress/weakness');
    return data;
  },

  unlockNextDay: async () => {
    const { data } = await api.post('/progress/unlock-next');
    return data;
  }
};

export default progressApi;
