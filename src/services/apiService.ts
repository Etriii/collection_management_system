import type { ApiResponse } from "@core/types";
import axios, { type AxiosInstance, type InternalAxiosRequestConfig, AxiosError } from "axios";

interface TokenResponse {
  access: string;
  refresh: string;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Attach access token to every request
    this.api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
      const token = localStorage.getItem("accessToken");
      // ensure headers object exists and is indexable
      config.headers = config.headers ?? {};
      if (token) {
        (config.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
      }
      return config;
    });

    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config;
        if (!originalRequest) return Promise.reject(error);

        // If 401 and not retry yet
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          const refreshToken = localStorage.getItem("refreshToken");
          if (refreshToken) {
            try {
              const res = await axios.post<ApiResponse<TokenResponse>>(
                `${import.meta.env.VITE_API_BASE_URL}api/v1/token/refresh/`,
                { refresh: refreshToken },
                { headers: { "Content-Type": "application/json" } }
              );

              localStorage.setItem("accessToken", res.data.data.access);

              // Retry original request with new token
              if (originalRequest.headers)
                originalRequest.headers["Authorization"] = `Bearer ${res.data.data.access}`;
              return this.api(originalRequest);
            } catch (err) {
              // Refresh token expired or invalid → logout
              const { useAuth } = await import("@pages/auth/presentation/composables/useAuth");
              const { logout } = useAuth();
              logout();
              return Promise.reject(err);
            }
          } else {
            return Promise.reject(error);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  async get<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
    const res = await this.api.get<T>(endpoint, { params });
    return res.data;
  }

  async post<T>(endpoint: string, body: Record<string, any> = {}): Promise<T> {
    const res = await this.api.post<T>(endpoint, body);
    return res.data;
  }

  async put<T>(endpoint: string, body: Record<string, any> = {}): Promise<T> {
    const res = await this.api.put<T>(endpoint, body);
    return res.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const res = await this.api.delete<T>(endpoint);
    return res.data;
  }

  async patch<T>(endpoint: string, body: Record<string, any> = {}): Promise<T> {
    const res = await this.api.patch<T>(endpoint, body);
    return res.data;
  }
}

// Extend InternalAxiosRequestConfig to track retry
declare module "axios" {
  export interface InternalAxiosRequestConfig {
    _retry?: boolean;
  }
}

export default new ApiService();
