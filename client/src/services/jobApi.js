import api from './api';

const jobApi = {
  getJobs: async () => {
    try {
      const response = await api.get('/jobs');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Job API Error:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to fetch jobs' };
    }
  },

  addJob: async (jobData) => {
    try {
      const response = await api.post('/jobs', jobData);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Job API Error:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to add job' };
    }
  },

  updateJobStatus: async (id, statusData) => {
    try {
      const response = await api.put(`/jobs/${id}`, statusData);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Job API Error:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to update job' };
    }
  },

  deleteJob: async (id) => {
    try {
      const response = await api.delete(`/jobs/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Job API Error:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to delete job' };
    }
  }
};

export default jobApi;
