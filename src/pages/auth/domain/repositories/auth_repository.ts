import type { UserEntity } from "../entities/user_entity";

export interface AuthRepository {
  login(username: string, password: string): Promise<void>;
  loginWithGoogle(token: string): Promise<void>;
  getCurrentUser(): Promise<UserEntity>;
  logout(): void;
}
