import api from './api';

export const submissionApi = {
  submitResult: async (question_id, is_correct, quality) => {
    const { data } = await api.post('/submission/result', { question_id, is_correct, quality });
    return data;
  }
};

export default submissionApi;
