import axiosClient from './axiosClient';

export const askGemini = (data) =>
  axiosClient.post('/ai/chat', data, { timeout: 45000 });

export const getConversations = () =>
  axiosClient.get('/ai/conversations');

export const getConversationById = (id) =>
  axiosClient.get(`/ai/conversations/${id}`);

export const renameConversation = (id, title) =>
  axiosClient.patch(`/ai/conversations/${id}`, { title });

export const deleteConversation = (id) =>
  axiosClient.delete(`/ai/conversations/${id}`);

export const deleteAllConversations = () =>
  axiosClient.delete('/ai/conversations');
