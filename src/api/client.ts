// HTTP Client
// Axios-based HTTP client with interceptors for authentication and error handling

import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { config } from "@/config/environment";
import { tokenManager } from "@/utils/token-manager";
import { handleApiError } from "@/utils/error-handler";

class HttpClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.apiBaseUrl,
      timeout: config.requestTimeout,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (requestConfig) => {
        const token = tokenManager.getAccessToken();
        if (token && requestConfig.headers) {
          requestConfig.headers.Authorization = `Bearer ${token}`;
        }

        return requestConfig;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor - handle errors
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        // Handle 401 - token expired, redirect to login
        if (error.response?.status === 401) {
          console.warn('[HttpClient interceptor] 401 Unauthorized, clearing token from tokenManager');
          tokenManager.clearTokens();
          window.location.href = "/login";
        }

        return Promise.reject(handleApiError(error));
      },
    );
  }

  public async get<T>(
    url: string,
    requestConfig?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.get<T>(url, requestConfig);
    return response.data;
  }

  public async post<T>(
    url: string,
    data?: any,
    requestConfig?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.post<T>(url, data, requestConfig);
    return response.data;
  }

  public async put<T>(
    url: string,
    data?: any,
    requestConfig?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.put<T>(url, data, requestConfig);
    return response.data;
  }

  public async delete<T>(
    url: string,
    requestConfig?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.delete<T>(url, requestConfig);
    return response.data;
  }

  public async patch<T>(
    url: string,
    data?: any,
    requestConfig?: AxiosRequestConfig,
  ): Promise<T> {
    const response = await this.client.patch<T>(url, data, requestConfig);
    return response.data;
  }
}

export const httpClient = new HttpClient();
