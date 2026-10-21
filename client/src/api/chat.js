import axiosClient from './axiosClient';

export const getPresetMessages = () => axiosClient.get('/chat/preset-messages');
export const getMessages = (groupId) => axiosClient.get(`/chat/${groupId}`);
export const sendMessage = (groupId, content) => axiosClient.post(`/chat/${groupId}`, { content });