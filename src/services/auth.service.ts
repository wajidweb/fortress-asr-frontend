import { api } from './api';

export const authService = {
  login: async (credentials: any) => {
    return api.post<{ accessToken: string; user: any }>('/auth/login', credentials);
  },
  
  registerGuard: async (data: any) => {
    return api.post('/auth/register/guard', data);
  },
  
  registerClient: async (data: any) => {
    return api.post('/auth/register/client', data);
  },
  
  logout: async () => {
    return api.postWithCredentials('/auth/logout');
  },
  
  getMe: async () => {
    return api.get<{ user: any }>('/auth/me');
  },
  
  forgotPassword: async (data: any) => {
    return api.post<{ message: string }>('/auth/forgot-password', data);
  },
  
  resetPassword: async (data: any) => {
    return api.post<{ message: string }>('/auth/reset-password', data);
  }
};
