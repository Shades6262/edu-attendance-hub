import axiosClient from './axiosClient';

export const getAllUsers = (params = {}) => axiosClient.get('/admin/users', { params });
export const getPendingUsers = () => axiosClient.get('/admin/pending-users');
export const approveUser = (id, decision) =>
  axiosClient.patch(`/admin/approve/${id}`, { decision });
export const updateUserRole = (id, role) =>
  axiosClient.patch(`/admin/users/${id}/role`, { role });
export const updateUserStatus = (id, status) =>
  axiosClient.patch(`/admin/users/${id}/status`, { status });
export const deleteUser = (id) => axiosClient.delete(`/admin/users/${id}`);