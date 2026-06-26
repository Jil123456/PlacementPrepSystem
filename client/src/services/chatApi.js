import api from './api';

const chatApi = {
  sendMessage: async (messages) => {
    try {
      const response = await api.post('/chat', { messages });
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Chat API Error:', error);
      return { success: false, error: error.response?.data?.message || 'Failed to communicate with AI' };
    }
  }
};

export default chatApi;
