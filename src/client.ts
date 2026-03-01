import axios, { AxiosInstance } from 'axios';
import { AuthConfig, getAuthHeaders } from './auth.js';

const BASE_URL = 'https://api.algohouse.ai';

export class QuantXDataClient {
  private axiosInstance: AxiosInstance;
  private authConfig: AuthConfig;

  constructor(email: string, signingKey: string) {
    this.authConfig = { email, signingKey };
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 30000
    });
  }

  async get(path: string, params?: Record<string, any>): Promise<any> {
    const authHeaders = getAuthHeaders('GET', path, this.authConfig);
    
    const response = await this.axiosInstance.get(path, {
      params: {
        ...params,
        ...authHeaders
      }
    });
    
    return response.data;
  }

  // Public endpoint (no auth required)
  async getPublic(path: string, params?: Record<string, any>): Promise<any> {
    const response = await this.axiosInstance.get(path, { params });
    return response.data;
  }
}
