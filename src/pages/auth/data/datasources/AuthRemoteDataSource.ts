import { loginApi, googleLoginApi, fetchProfile, logoutApi } from "../api/auth_api";
import { type ApiResponse } from "../../../../core/types";
import { type TokenResponse } from "@pages/auth/data/api/auth_api";
import { UserModel } from "../model/userProfileModel";

export interface AuthRemoteDataSource {
  login(username: string, password: string): Promise<ApiResponse<TokenResponse>>;
  googleLogin(token: string): Promise<ApiResponse<TokenResponse>>;
  fetchProfile(): Promise<ApiResponse<UserModel>>;
  logout(refreshToken: string): void;
}

export class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  async login(username: string, password: string) {
    return await loginApi({ username, password });
  }

  async googleLogin(token: string) {
    return await googleLoginApi(token);
  }

  async fetchProfile() {
    const res = await fetchProfile();
    const model = UserModel.fromJson(res.data);
    return {
      ...res,
      data: model,
    };
  }

  async logout(refreshToken: string){
    await logoutApi(refreshToken)
  }
}
