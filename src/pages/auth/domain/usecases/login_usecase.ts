import type { AuthRepository } from "../repositories/auth_repository";

export class LoginUseCase {
    private repo: AuthRepository;

    constructor(repo: AuthRepository) { this.repo = repo }
    async execute(username: string, password: string) {
        await this.repo.login(username, password);
    }
}
