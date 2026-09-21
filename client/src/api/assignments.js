import axiosClient from './axiosClient';

export const createAssignment = (data) => axiosClient.post('/assignments', data);
export const getAssignments = () => axiosClient.get('/assignments');
export const getAssignmentById = (id) => axiosClient.get(`/assignments/${id}`);
export const updateAssignment = (id, data) => axiosClient.patch(`/assignments/${id}`, data);
export const deleteAssignment = (id) => axiosClient.delete(`/assignments/${id}`);