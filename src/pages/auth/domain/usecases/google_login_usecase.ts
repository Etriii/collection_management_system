import type { AuthRepository } from "../repositories/auth_repository";

export class GoogleLoginUseCase {
    private repo: AuthRepository;

    constructor(repo: AuthRepository) { this.repo = repo }
    async execute(token: string) {
        await this.repo.loginWithGoogle(token);
    }
}
