import { loginApi, googleLoginApi, fetchProfile } from "../api/auth_api";
import { type ApiResponse } from "../../../../core/types";
import { type TokenResponse } from "@pages/auth/data/api/auth_api";
import { UserProfileModel } from "../model/userProfileModel";

export interface AuthRemoteDataSource {
  login(username: string, password: string): Promise<ApiResponse<TokenResponse>>;
  googleLogin(token: string): Promise<ApiResponse<TokenResponse>>;
  fetchProfile(): Promise<ApiResponse<UserProfileModel>>;
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
    const model = UserProfileModel.fromJson(res.data);
    return {
      ...res,
      data: model,
    };
  }
}
