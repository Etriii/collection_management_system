import api from "../../../../services/apiService";
import { type ApiResponse } from "../../../../core/types";
import { ENDPOINTS } from "@core/constants";

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
        const result = await api.post<ApiResponse<TokenResponse>>(ENDPOINTS.auth.login, payload);
        return result;
    } catch (err: any) {
        throw new Error(err.response?.result?.detail || "Invalid credentials");
    }
}

export async function googleLoginApi(token: string): Promise<ApiResponse<TokenResponse>> {
    try {
        const result = await api.post<ApiResponse<TokenResponse>>(ENDPOINTS.auth.google, { token });
        return result;
    } catch (err: any) {
        throw new Error(err.response?.result?.detail || "Google login failed");
    }
}

export async function fetchProfile(): Promise<ApiResponse<UserProfile>> {
    try {
        return await api.get<ApiResponse<UserProfile>>(ENDPOINTS.profile);
    } catch (err: any) {
        throw new Error(err.response?.result?.detail || "Profile fetch failed");
    }
}
