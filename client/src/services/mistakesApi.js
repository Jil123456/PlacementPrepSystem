import api from './api';

export const mistakesApi = {
  getPendingMistakes: async () => {
    const { data } = await api.get('/mistakes/pending');
    return data;
  }
};

export default mistakesApi;
