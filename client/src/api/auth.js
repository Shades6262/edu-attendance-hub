import axiosClient from './axiosClient';

export const registerUser = (data) => axiosClient.post('/auth/register', data);
export const loginUser = (data) => axiosClient.post('/auth/login', data);
export const googleAuth = (data) => axiosClient.post('/auth/google', data);
export const updateProfilePicture = (formData) =>
  axiosClient.put('/auth/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const removeProfilePicture = () => axiosClient.delete('/auth/profile-picture');
