import type { ApiResponse } from "@core/types";
import axios, { type AxiosInstance, type InternalAxiosRequestConfig, AxiosError } from "axios";

interface TokenResponse {
    access: string;
    refresh: string;
}

declare module "axios" {
    export interface AxiosRequestConfig {
        cancelKey?: string;
        _retry?: boolean;
    }
}

/*
This version allows UI to cancel requests through external actions :>
*/

class ApiService {
    private api: AxiosInstance;
    private abortControllers: Map<string, AbortController> = new Map();

    constructor() {
        this.api = axios.create({
            baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/",
            headers: { "Content-Type": "application/json" },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        this.api.interceptors.request.use((config) => {
            const token = localStorage.getItem("accessToken");
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }

            // If a cancelKey is provided, handle the logic
            // if (config.cancelKey) {
            //     // Cancel existing request with this same key (Anti-spam)
            //     this.cancel(config.cancelKey);

            //     const controller = new AbortController();
            //     config.signal = controller.signal;
            //     this.abortControllers.set(config.cancelKey, controller);
            // }

            const key = config.cancelKey || `${config.method && config.url}`;
            // console.log(key)
            if (key) { // enabled key filling if not provided using the path and methhod
                // Cancel existing request with this same key (Anti-spam)
                this.cancel(key);
                const controller = new AbortController();
                config.signal = controller.signal;
                this.abortControllers.set(key, controller);
                config.cancelKey = key
            }
            return config;
        });
        this.api.interceptors.response.use(
            (response) => {
                const key = response.config.cancelKey;
                // Only delete if THIS request is the one stored in the map
                // (Prevents deleting a new request's controller that just started)
                if (key && this.abortControllers.get(key)?.signal === response.config.signal) {
                    this.abortControllers.delete(key);
                }
                return response;
            },
            async (error: AxiosError) => {
                const originalRequest = error.config;

                if (axios.isCancel(error) && originalRequest?.cancelKey) {
                    const currentController = this.abortControllers.get(originalRequest.cancelKey);

                    // If there is already a NEW controller for this key, it's an auto-cancel/spam
                    if (currentController && currentController.signal !== originalRequest.signal) {
                        (error as any).isAutoCancel = true;
                    } else {
                        // Otherwise, it was a manual cancel or the last one in the chain
                        this.abortControllers.delete(originalRequest.cancelKey);
                    }
                }

                // Handle Refresh Token Logic 
                if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
                    originalRequest._retry = true;
                    return this.handleRefresh(originalRequest);
                }

                return Promise.reject(error);
            }
        );
    }

    private async handleRefresh(originalRequest: InternalAxiosRequestConfig) {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) return Promise.reject("No refresh token");

        try {
            const res = await axios.post<ApiResponse<TokenResponse>>(
                `${import.meta.env.VITE_API_BASE_URL}api/v1/token/refresh/`,
                { refresh: refreshToken }
            );
            const newAccess = res.data.data.access;
            localStorage.setItem("accessToken", newAccess);

            if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${newAccess}`;
            }
            return this.api(originalRequest);
        } catch (err) {
            const { useAuth } = await import("@pages/auth/presentation/composables/useAuth");
            useAuth().logout();
            return Promise.reject(err);
        }
    }

    /**
     * Public method to manually cancel a request via button, onUnmounted, etc. 
     */
    cancel(key: string) {
        const controller = this.abortControllers.get(key);
        if (controller) {
            controller.abort();
            this.abortControllers.delete(key);
        }
    }

    async get<T>(endpoint: string, params: Record<string, any> = {}, cancelKey?: string): Promise<T> {
        const res = await this.api.get<T>(endpoint, {
            params,
            cancelKey
        });
        return res.data;
    }

    async post<T>(endpoint: string, body: Record<string, any> = {}, cancelKey?: string): Promise<T> {
        const res = await this.api.post<T>(endpoint, body, { cancelKey });
        return res.data;
    }

    // WHEN UPDATING FIELDS PLEASE USE PATCH INSEAD
    async put<T>(endpoint: string, body: Record<string, any> = {}, cancelKey?: string): Promise<T> {
        const res = await this.api.put<T>(endpoint, body, { cancelKey });
        return res.data;
    }

    async patch<T>(endpoint: string, body: Record<string, any> = {}, cancelKey?: string): Promise<T> {
        const res = await this.api.patch<T>(endpoint, body, { cancelKey });
        return res.data;
    }

    async delete<T>(endpoint: string, cancelKey?: string): Promise<T> {
        const res = await this.api.delete<T>(endpoint, { cancelKey });
        return res.data;
    }
}

export default new ApiService();


/*
USE IT SOMETHING LIKE THIS 

        try {
            const data = await getStudentPaymentsApi(student_id, "getStudentPayments"); // the "getStudentPayments" key wil be used for calling cancel("getStudentPayments") method from apiServicev2 to stop the request :>

            cache.data = data;
            cache.fetched = true;
            cache.loading = false;
        } catch (error: any) {
            // CHECK: If this was cancelled because a newer request started,
            if (error.isAutoCancel) {
                // console.error("Request superseded by a newer one.");
                return;
            }

            cache.loading = false;
            throw error;
        } // dont use finally block to stop loading as it will stop the loading when refetched :>
*/ 

