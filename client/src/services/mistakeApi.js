import api from './api';

export const mistakeApi = {
  getMistakes: async (params) => {
    const { data } = await api.get('/mistakes', { params });
    return data;
  },
  
  getMistakeStats: async () => {
    const { data } = await api.get('/mistakes/stats');
    return data;
  },

  markRevised: async (mistakeId) => {
    const { data } = await api.put(`/mistakes/${mistakeId}/revised`);
    return data;
  }
};

export default mistakeApi;
