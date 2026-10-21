import axiosClient from './axiosClient';

export const createTrackerReport = (data) => axiosClient.post('/tracker-reports', data);
export const getTrackerReports = () => axiosClient.get('/tracker-reports');
export const getTrackerReportById = (id) => axiosClient.get(`/tracker-reports/${id}`);
export const reviewTrackerReport = (id, feedback) => axiosClient.patch(`/tracker-reports/${id}/review`, { feedback });