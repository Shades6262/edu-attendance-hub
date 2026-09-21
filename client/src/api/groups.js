import axiosClient from './axiosClient';

export const createGroup = (data) => axiosClient.post('/groups', data);
export const getGroups = () => axiosClient.get('/groups');
export const getGroupById = (id) => axiosClient.get(`/groups/${id}`);
export const addStudentToGroup = (groupId, studentId) => axiosClient.patch(`/groups/${groupId}/add-student`, { studentId });
export const removeStudentFromGroup = (groupId, studentId) => axiosClient.patch(`/groups/${groupId}/remove-student`, { studentId });
export const deleteGroup = (id) => axiosClient.delete(`/groups/${id}`);