import axiosClient from './axiosClient';

export const registerUser = (data) => axiosClient.post('/auth/register', data);
export const loginUser = (data) => axiosClient.post('/auth/login', data);
export const googleAuth = (data) => axiosClient.post('/auth/google', data);
export const updateProfilePicture = (formData) =>
  axiosClient.put('/auth/profile-picture', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const removeProfilePicture = () => axiosClient.delete('/auth/profile-picture');
export const deleteAccount = () => axiosClient.delete('/auth/account');

export const verifyEmail = (token) => axiosClient.post('/auth/verify-email', { token });
export const resendVerification = (email) => axiosClient.post('/auth/resend-verification', { email });
export const forgotPassword = (email) => axiosClient.post('/auth/forgot-password', { email });
export const resetPassword = (data) => axiosClient.post('/auth/reset-password', data);
