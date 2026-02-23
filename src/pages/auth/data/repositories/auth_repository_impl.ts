import type { AuthRepository } from "../../domain/repositories/auth_repository";
import type { AuthRemoteDataSource } from "../datasources/AuthRemoteDataSource";
import type { AuthLocalDataSource } from "../datasources/AuthLocalDataSource";
import type { UserEntity } from "@pages/auth/domain/entities/user_entity";
import { useDebounce } from "@utils/composables/useDebounce";

export class AuthRepositoryImpl implements AuthRepository {
    private remote: AuthRemoteDataSource;
    private local: AuthLocalDataSource
    constructor(
        remote: AuthRemoteDataSource,
        local: AuthLocalDataSource
    ) {
        this.remote = remote;
        this.local = local;
    }

    async login(username: string, password: string) {
        const jwt = await this.remote.login(username, password);
        this.local.saveTokens(jwt.data);
    }

    async loginWithGoogle(token: string) {
        const jwt = await this.remote.googleLogin(token);
        this.local.saveTokens(jwt.data);
    }

    async getCurrentUser(): Promise<UserEntity> {
        const model = await this.remote.fetchProfile();
        // localStorage.setItem("userData", JSON.stringify(model.data.toJson()));
        return model.data.toEntity();
    }

    async logout(): Promise<void> {
        const refreshToken = this.local.getRefreshToken();
        if (refreshToken) {
            this.remote.logout(refreshToken);
        }
        const { debounce } = useDebounce();
        debounce(() => this.local.clearTokens(), 50);
    }
}
