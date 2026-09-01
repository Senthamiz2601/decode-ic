import type { AuthUser } from '@/types';
import { API_BASE_URL, ApiError } from '@/services/api';

export interface RegisterInput {
  fullName: string;
  username: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface UpdateProfileInput {
  fullName: string;
  email: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

interface AuthResponse {
  ok: boolean;
  message: string;
  token?: string;
  user?: AuthUser;
}

const TOKEN_KEY = 'decode_ic_token';
const USER_KEY = 'decode_ic_user';

function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

function saveAuth(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function saveUser(user: AuthUser) {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  return getStoredUser();
}

export async function register(
  input: RegisterInput,
): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as AuthResponse;

  if (!response.ok || !data.ok) {
    throw new ApiError(
      data.message || 'Unable to create account.',
      response.status,
    );
  }

  if (!data.token || !data.user) {
    throw new ApiError('Invalid authentication response from server.');
  }

  saveAuth(data.token, data.user);

  return data.user;
}

export async function login(
  input: LoginInput,
): Promise<AuthUser> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      password: input.password,
    }),
  });

  const data = (await response.json()) as AuthResponse;

  if (!response.ok || !data.ok) {
    throw new ApiError(
      data.message || 'Unable to login.',
      response.status,
    );
  }

  if (!data.token || !data.user) {
    throw new ApiError('Invalid authentication response from server.');
  }

  saveAuth(data.token, data.user);

  return data.user;
}

export async function updateProfile(
  input: UpdateProfileInput,
): Promise<AuthUser> {
  const token = getToken();

  if (!token) {
    throw new ApiError('Authentication required.', 401);
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as AuthResponse;

  if (!response.ok || !data.ok) {
    throw new ApiError(
      data.message || 'Unable to update profile.',
      response.status,
    );
  }

  if (!data.user) {
    throw new ApiError('Invalid profile response from server.');
  }

  saveUser(data.user);

  return data.user;
}

export async function changePassword(
  input: ChangePasswordInput,
): Promise<string> {
  const token = getToken();

  if (!token) {
    throw new ApiError('Authentication required.', 401);
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  const data = (await response.json()) as AuthResponse;

  if (!response.ok || !data.ok) {
    throw new ApiError(
      data.message || 'Unable to change password.',
      response.status,
    );
  }

  return data.message || 'Password changed successfully.';
}

export async function logout(): Promise<void> {
  clearAuth();
}

export function getInitials(fullName: string) {
  return (
    fullName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || 'U'
  );
}