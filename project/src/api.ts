import { User, Flowchart } from './types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class API {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Request failed' }));
      throw new Error(error.detail || 'Request failed');
    }

    if (response.status === 204) {
      return null;
    }

    return response.json();
  }

  async register(email: string, username: string, password: string) {
    return this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, username, password }),
    });
  }

  async login(username: string, password: string) {
    return this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async getMe(): Promise<User> {
    return this.request('/api/auth/me');
  }

  async getFlowcharts(): Promise<Flowchart[]> {
    return this.request('/api/flowcharts');
  }

  async getFlowchart(id: string): Promise<Flowchart> {
    return this.request(`/api/flowcharts/${id}`);
  }

  async createFlowchart(title: string, description: string, data: any): Promise<Flowchart> {
    return this.request('/api/flowcharts', {
      method: 'POST',
      body: JSON.stringify({ title, description, data }),
    });
  }

  async updateFlowchart(id: string, title?: string, description?: string, data?: any): Promise<Flowchart> {
    return this.request(`/api/flowcharts/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ title, description, data }),
    });
  }

  async deleteFlowchart(id: string) {
    return this.request(`/api/flowcharts/${id}`, {
      method: 'DELETE',
    });
  }
}

export const api = new API();
