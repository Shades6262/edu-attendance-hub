import axiosClient from './axiosClient';

export const scanAttendance = (barcodeId) => axiosClient.post('/attendance/scan', { barcodeId });
export const getMyAttendance = () => axiosClient.get('/attendance/me');
export const getUserAttendance = (userId) => axiosClient.get(`/attendance/user/${userId}`);
export const getAllAttendanceByDate = (date) => axiosClient.get('/attendance/all', { params: date ? { date } : {} });