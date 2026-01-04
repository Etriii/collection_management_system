export interface AuthLocalDataSource {
    saveTokens(tokens: { access: string; refresh: string }): void;
    getAccessToken(): string | null;
    getRefreshToken(): string | null;
    clearTokens(): void;
}

export class AuthLocalDataSourceImpl implements AuthLocalDataSource {
    saveTokens(tokens: { access: string; refresh: string }) {
        localStorage.setItem("accessToken", tokens.access);
        localStorage.setItem("refreshToken", tokens.refresh);
    }

    getAccessToken() {
        return localStorage.getItem("accessToken");
    }

    getRefreshToken() {
        return localStorage.getItem("refreshToken");
    }

    clearTokens() {
        localStorage.clear();
    }
}
