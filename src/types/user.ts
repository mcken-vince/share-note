export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Optional, as we don't want to send this to the client
}

export interface UserWithPassword extends User {
  password: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
