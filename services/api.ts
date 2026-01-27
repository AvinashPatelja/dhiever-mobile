import axios from 'axios';
import { API_CONFIG } from '../constants/api';
import { RegisterRequest } from '@/types';

export const authAPI = {
  login: (userName: string, password: string) => 
    axios.post(`${API_CONFIG.BASE_URL}/Auth/Login`, { userName, password }),
  
  register: (data: RegisterRequest) => 
    axios.post(`${API_CONFIG.BASE_URL}/Auth/Register`, data),
};

export const deviceAPI = {
  getUserData: (userName: string) => 
    axios.get(`${API_CONFIG.BASE_URL}/Device/UserData/${userName}`),
  
  upsertDeviceLive: (data: any) => 
    axios.post(`${API_CONFIG.BASE_URL}/Device/UpsertDeviceLive`, data),
  
  updateDefaultGV: (imei: string) => 
    axios.post(`${API_CONFIG.BASE_URL}/Device/UpdateDefaultGV`, { imei }),
  
  upsertMapping: (data: any) => 
    axios.post(`${API_CONFIG.BASE_URL}/device/upsert-mapping`, data),
};