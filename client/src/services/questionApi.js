import api from './api';

export const questionApi = {
  getDSAQuestions: async (params) => {
    const { data } = await api.get('/questions/dsa', { params });
    return data;
  },
  
  getAptitudeQuestions: async (params) => {
    const { data } = await api.get('/questions/aptitude', { params });
    return data;
  },

  getCoreSubjectQuestions: async (params) => {
    const { data } = await api.get('/questions/core-subjects', { params });
    return data;
  },

  getQuestionById: async (id) => {
    const { data } = await api.get(`/questions/${id}`);
    return data;
  },

  submitAnswer: async (id, answer, timeTakenSeconds) => {
    const { data } = await api.post(`/questions/${id}/answer`, {
      answer,
      time_taken_seconds: timeTakenSeconds
    });
    return data;
  }
};

export default questionApi;
