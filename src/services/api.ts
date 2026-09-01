// Centralized API client.
// Today every service function resolves against local mock data.
// Swap this file's internals for real `fetch` calls against
// import.meta.env.VITE_API_BASE_URL once the FastAPI backend exists —
// callers in pages/hooks never need to change.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export function mockDelay<T>(value: T, ms = 350): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'ApiError';
  }
}
