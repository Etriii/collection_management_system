import { defineStore } from "pinia";
import { AuthRemoteDataSourceImpl } from "../../data/datasources/AuthRemoteDataSource";
import { AuthLocalDataSourceImpl } from "../../data/datasources/AuthLocalDataSource";
import { AuthRepositoryImpl } from "../../data/repositories/auth_repository_impl";
import { LoginUseCase } from "../../domain/usecases/login_usecase";
import { GoogleLoginUseCase } from "../../domain/usecases/google_login_usecase";

const remote = new AuthRemoteDataSourceImpl();
const local = new AuthLocalDataSourceImpl();
const repo = new AuthRepositoryImpl(remote, local);

const loginUseCase = new LoginUseCase(repo);
const googleLoginUseCase = new GoogleLoginUseCase(repo);

export const useAuthStore = defineStore("auth", {
  state: () => ({
    loading: false,
    error: "",
    user: null as any,
    initialized: false,
  }),
  actions: {
    async initialize() {
      try {
        if (this.initialized) return;
        this.user = await repo.getCurrentUser();
      } catch {
        this.user = null;
      } finally {
        this.initialized = true;
      }
    },
    async login(username: string, password: string) {
      this.loading = true;
      try {
        await loginUseCase.execute(username, password);
        this.user = await repo.getCurrentUser();
      } catch (e: any) {
        this.error = e.message;
        throw e;
      } finally {
        this.loading = false;
      }
    },
    async loginWithGoogle(token: string) {
      this.loading = true;
      try {
        await googleLoginUseCase.execute(token);
        this.user = await repo.getCurrentUser();
      } catch (e: any) {
        this.error = "Google login failed";
        throw e;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      repo.logout();
      this.user = null;
    },
  },
});
