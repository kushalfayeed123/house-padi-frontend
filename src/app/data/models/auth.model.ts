// src/app/data/models/auth.model.ts
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'renter' | 'owner' | 'admin';
  avatarUrl?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string; // From Swagger Security Schemes
}