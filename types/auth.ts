export interface User {
  id: number;
  username: string;
  email: string;
  provider?: string;
  confirmed?: boolean;
  blocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  jwt: string;
  user: User;
}

export interface StrapiError {
  error: {
    status: number;
    name: string;
    message: string;
    details?: any;
  };
}