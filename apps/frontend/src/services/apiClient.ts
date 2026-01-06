import { triggerGlobalAlert } from '../contexts/AlertModalContext';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: unknown;
  headers?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

function handleAccountSuspended(): void {
  localStorage.removeItem('user_token');
  triggerGlobalAlert('활동이 제한된 계정입니다', '/login');
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthToken(endpoint: string): string | null {
    if (endpoint.startsWith('/admin')) {
      return sessionStorage.getItem('admin_token');
    }
    return localStorage.getItem('user_token');
  }

  private getHeaders(endpoint: string, customHeaders?: Record<string, string>): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...customHeaders,
    });

    const token = this.getAuthToken(endpoint);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { method = 'GET', body, headers: customHeaders } = options;
    
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders(endpoint, customHeaders);

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 403 && errorData.code === 'ACCOUNT_SUSPENDED') {
        handleAccountSuspended();
        throw new ApiError(
          errorData.message || '활동이 정지된 계정입니다.',
          response.status,
          errorData.code
        );
      }
      
      throw new ApiError(
        errorData.message || `Request failed with status ${response.status}`,
        response.status,
        errorData.code
      );
    }

    return response.json();
  }

  get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body });
  }

  put<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body });
  }

  patch<T>(endpoint: string, body: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
