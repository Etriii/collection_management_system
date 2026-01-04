import api from "../../../../services/apiService";
import { type ApiResponse } from "../../../../core/types";

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
    try {
        const result = await api.post<ApiResponse<TokenResponse>>("api/v1/login/", payload);
        return result;
    } catch (err: any) {
        throw new Error(err.response?.result?.detail || "Invalid credentials");
    }
}

export async function googleLoginApi(token: string): Promise<ApiResponse<TokenResponse>> {
    try {
        const result = await api.post<ApiResponse<TokenResponse>>("api/v1/auth/google/", { token });
        return result;
    } catch (err: any) {
        throw new Error(err.response?.result?.detail || "Google login failed");
    }
}

export async function fetchProfile(): Promise<ApiResponse<UserProfile>> {
    try {
        return await api.get<ApiResponse<UserProfile>>("api/v1/profile/");
    } catch (err: any) {
        throw new Error(err.response?.result?.detail || "Profile fetch failed");
    }
}
