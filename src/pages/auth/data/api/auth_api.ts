import api from "../../../../services/apiService";
import { type ApiResponse } from "../../../../core/types";
import { ENDPOINTS } from "@core/url_paths";
import { useAlertStore } from "@stores/ui/alert";

interface LoginPayload {
    username: string;
    password: string;
}

export interface TokenResponse {
    access: string;
    refresh: string;
}

interface UserProfile {
    exp: null;
    id: number;
    username: string;
    email: string;
}


export async function loginApi(payload: LoginPayload): Promise<ApiResponse<TokenResponse>> {
    const alert = useAlertStore()
    try {
        const result = await api.post<ApiResponse<TokenResponse>>(
            ENDPOINTS.auth.login,
            payload,
            15000
        );
        return result;
    } catch (err: any) {
        if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
            alert.show("The server is taking too long to respond. Please try again.", "error")
            throw new Error("The server is taking too long to respond. Please try again.");
        }

        throw new Error(err.response?.data?.detail || "Invalid credentials");
    }
}

export async function googleLoginApi(token: string): Promise<ApiResponse<TokenResponse>> {
    const alert = useAlertStore()
    try {
        const result = await api.post<ApiResponse<TokenResponse>>(
            ENDPOINTS.auth.google,
            { token },
            20000
        );
        return result;
    } catch (err: any) {
        if (err.code === 'ECONNABORTED') {
            alert.show("The server is taking too long to respond. Please try again.", "error")
            throw new Error("Connection to Google login timed out.");
        }

        throw new Error(err.response?.data?.detail || "Google login failed");
    }
}

export async function fetchProfile(): Promise<ApiResponse<UserProfile>> {
    try {
        return await api.get<ApiResponse<UserProfile>>(ENDPOINTS.profile);
    } catch (err: any) {
        throw new Error(err.response?.result?.detail || "Profile fetch failed");
    }
}


export async function logoutApi(refreshToken: string): Promise<ApiResponse<TokenResponse>> {
    try {
        const result = await api.post<ApiResponse<TokenResponse>>(ENDPOINTS.auth.logout, { "refresh": refreshToken });
        return result;
    } catch (err: any) {
        throw new Error(err.response?.result?.errors || "Invalid Token");
    }
}