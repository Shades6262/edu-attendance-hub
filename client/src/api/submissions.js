import axiosClient from './axiosClient';

export const createSubmission = (data) => axiosClient.post('/submissions', data);
export const getMySubmissions = () => axiosClient.get('/submissions/me');
export const getSubmissionsForAssignment = (assignmentId) => axiosClient.get(`/submissions/assignment/${assignmentId}`);
export const reviewSubmission = (id, feedback) => axiosClient.patch(`/submissions/${id}/review`, { feedback });