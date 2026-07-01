import api from './api';

export const revisionApi = {
  getSchedule: async () => {
    const { data } = await api.get('/revision/schedule');
    return data;
  },
  
  getTodayRevision: async () => {
    const { data } = await api.get('/revision/due-today');
    return data;
  },

  completeRevision: async (id) => {
    const { data } = await api.post(`/revision/${id}/complete`);
    return data;
  },

  rateQuestion: async (question_id, quality, context) => {
    const { data } = await api.post('/revision/rate', { question_id, quality, context });
    return data;
  }
};

export default revisionApi;
