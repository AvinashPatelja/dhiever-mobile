export interface DeviceLiveData {
  imei: string;
  status: boolean;
  starTime: string;
  endTime: string;
  deviceType: number;
  defaultGV: boolean;
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  imei: string;
}